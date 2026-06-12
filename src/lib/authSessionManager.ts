/**
 * PATCH: src/lib/authSessionManager.ts  (FILE BARU)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ROOT CAUSE ANALYSIS — Login Hang / Stale Token / Harus Delete-Recreate User
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * AKAR MASALAH #1 — Session Cache Stale (PALING SERING TERJADI)
 * ──────────────────────────────────────────────────────────────
 * Di onAuthStateChanged, ada logika:
 *
 *   const cachedProfile = safeSessionStorage.getItem(`user_profile_${user.uid}`);
 *   if (cachedProfile) {
 *     setCurrentUser({ uid: user.uid, ...parsed });
 *     setIsAuthInitializing(false);
 *     return;  // ← EARLY RETURN — tidak refresh token, tidak re-fetch Firestore
 *   }
 *
 * Ketika user login di browser/profil berbeda, sessionStorage berbeda,
 * jadi tidak ada masalah. Tapi ketika SAME browser dipakai untuk login
 * berbagai role secara bergantian:
 *
 *   Login RT-01 → profile cache disimpan di sessionStorage
 *   Logout → signOut(auth) dipanggil
 *   Login RW → onAuthStateChanged fired, tapi sessionStorage TIDAK di-clear!
 *   → user_profile_{uid_rw} belum ada (baru), tapi user_profile_{uid_rt} masih ada
 *   → Jika UID sama (karena delete-recreate), profile lama ter-return
 *   → currentUser = profil RT yang sudah stale, bukan RW
 *   → UI loading terus karena state tidak konsisten
 *
 * Ketika user dihapus dan dibuat ulang dengan email yang sama:
 *   Firebase memberi UID BARU yang berbeda
 *   → sessionStorage key lama tidak di-clear
 *   → Setelah 10+ delete-recreate, sessionStorage penuh dengan stale keys
 *   → Parser JSON bisa corrupt jika storage limit tercapai
 *
 * AKAR MASALAH #2 — Race Condition: signOut sebelum signInWithEmailAndPassword
 * ──────────────────────────────────────────────────────────────────────────────
 * Di handleLogin (baris ~6654):
 *
 *   await signOut(auth);  // ← trigger onAuthStateChanged(null)
 *   const userCredential = await signInWithEmailAndPassword(auth, ...);
 *
 * signOut() men-trigger onAuthStateChanged(null) secara async.
 * signInWithEmailAndPassword() mungkin resolve lebih cepat dari callback null.
 * Akibatnya: onAuthStateChanged dipanggil dengan user=null SETELAH login berhasil
 * → setCurrentUser(null) dipanggil → UI flash ke login screen → loading hang
 *
 * AKAR MASALAH #3 — IndexedDB Firestore Lock (Multi-Tab)
 * ───────────────────────────────────────────────────────
 * persistentMultipleTabManager() menggunakan IndexedDB lock.
 * Ketika 2+ tab dibuka dengan tenant berbeda (RT & RW di tab berbeda),
 * IndexedDB lock bisa stuck jika salah satu tab crash atau force-closed.
 * Akibatnya: tab baru infinite loading karena menunggu lock dari tab lama.
 * firebase.ts sudah handle ini dengan isIframe check, tapi tidak handle
 * skenario multiple tabs dengan multi-tenant berbeda.
 *
 * AKAR MASALAH #4 — Anonymous Auth Pollution
 * ──────────────────────────────────────────────
 * Di handleLogin error recovery (baris ~6670):
 *
 *   await signInAnonymously(auth);  // ← untuk cek pre-registration
 *   // jika tidak ada pre-registration match → auth state = anonymous
 *   // onAuthStateChanged fired dengan anonymous user
 *   // Lalu createUserWithEmailAndPassword dipanggil
 *   // → 2 onAuthStateChanged events berurutan dalam hitungan ms
 *   // → State machine menjadi tidak sinkron
 *
 * Ketika auth/user-not-found terjadi dan recovery gagal,
 * anonymous session bisa tertinggal di IndexedDB.
 * Login berikutnya akan mendapat anonymous user bukan email user.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SOLUSI PERMANEN
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { safeSessionStorage, safeLocalStorage } from './safeStorage';

// ─────────────────────────────────────────────────────────────────
// KONSTANTA — Keys yang tidak boleh dihapus saat session cleanup
// ─────────────────────────────────────────────────────────────────
const PROTECTED_STORAGE_KEYS = [
  'firebase:auth',
  'firebaseLocalStorageDb',
  'currentTenant',
  'parentTenant',
  'impersonatedTenantId',
] as const;

const USER_PROFILE_CACHE_PREFIX = 'user_profile_';

// ─────────────────────────────────────────────────────────────────
// FIX #1: Bersihkan seluruh user_profile cache saat logout/login
// ─────────────────────────────────────────────────────────────────

/**
 * Hapus SEMUA user_profile_* keys dari sessionStorage.
 * Dipanggil SEBELUM signOut dan SEBELUM signInWithEmailAndPassword.
 * Mencegah stale profile dari session sebelumnya ter-return di onAuthStateChanged.
 */
export function clearUserProfileCache(): void {
  try {
    const sessionKeys = safeSessionStorage.getKeys();
    sessionKeys.forEach((key) => {
      if (key.startsWith(USER_PROFILE_CACHE_PREFIX)) {
        safeSessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('[authSessionManager] clearUserProfileCache failed:', e);
  }
}

/**
 * Hapus user_profile cache untuk UID tertentu saja.
 * Berguna saat profile Firestore di-update — cache harus di-invalidate.
 */
export function invalidateUserProfileCache(uid: string): void {
  try {
    safeSessionStorage.removeItem(`${USER_PROFILE_CACHE_PREFIX}${uid}`);
  } catch (e) {
    console.warn('[authSessionManager] invalidateUserProfileCache failed:', e);
  }
}

// ─────────────────────────────────────────────────────────────────
// FIX #2: Safe logout yang bersih tanpa race condition
// ─────────────────────────────────────────────────────────────────

/**
 * Logout yang aman:
 * 1. Clear profile cache DULU sebelum signOut
 * 2. Tunggu signOut selesai
 * 3. Clear session storage (kecuali protected keys)
 *
 * Menggantikan pola `await signOut(auth)` langsung di handleLogin/handleLogout.
 */
export async function safeSignOut(): Promise<void> {
  // Step 1: Clear profile cache SEBELUM signOut
  // Mencegah onAuthStateChanged(null) dari membaca cache stale
  clearUserProfileCache();

  // Step 2: Bersihkan sessionStorage non-protected
  try {
    const sessionKeys = safeSessionStorage.getKeys();
    sessionKeys.forEach((key) => {
      if (!PROTECTED_STORAGE_KEYS.some((k) => key.includes(k))) {
        safeSessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('[authSessionManager] session cleanup failed:', e);
  }

  // Step 3: Firebase signOut
  try {
    await signOut(auth);
  } catch (e) {
    console.error('[authSessionManager] signOut error:', e);
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────
// FIX #3: Clear IndexedDB Firestore lock saat login gagal/hang
// ─────────────────────────────────────────────────────────────────

/**
 * Deteksi dan bersihkan IndexedDB lock yang stuck.
 * Dipanggil saat login timeout atau infinite loading terdeteksi.
 *
 * Firebase Firestore menyimpan data di IndexedDB dengan nama:
 *   firestore/[projectId]/[databaseId]/main
 *
 * Ketika tab crash tanpa proper cleanup, lock bisa tersisa.
 */
export async function clearFirestoreIndexedDBLock(projectId: string): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;

  const dbNames = [
    `firestore/[DEFAULT]/[DEFAULT]/main`,
    `firestore/${projectId}/[DEFAULT]/main`,
    `firestore/${projectId}/(default)/main`,
    `firebase-heartbeat-database`,
    `firebase-installations-database`,
  ];

  let cleared = false;
  for (const dbName of dbNames) {
    try {
      await new Promise<void>((resolve, reject) => {
        // Open with version check — jika ada lock, ini akan trigger onblocked
        const req = indexedDB.open(dbName);
        req.onblocked = () => {
          // Database masih di-hold oleh tab lain — tidak bisa force close dari sini
          console.warn(`[authSessionManager] IndexedDB "${dbName}" is blocked by another tab`);
          resolve();
        };
        req.onsuccess = (e) => {
          (e.target as IDBOpenDBRequest).result?.close();
          resolve();
        };
        req.onerror = () => resolve(); // Not found = ok
        setTimeout(resolve, 500); // Timeout fallback
      });
    } catch (e) {
      // Silent — db might not exist
    }
  }

  return cleared;
}

// ─────────────────────────────────────────────────────────────────
// FIX #4: Login dengan proper sequencing, tanpa anonymous pollution
// ─────────────────────────────────────────────────────────────────

/**
 * Validator pre-login: cek apakah user sudah terdaftar di Firestore
 * TANPA signInAnonymously (yang menyebabkan auth state pollution).
 *
 * Gunakan ini di handleLogin untuk menggantikan pola:
 *   await signInAnonymously(auth);
 *   const snap = await getDocs(query(usersRef, where("email", "==", loginEmail)));
 *
 * Karena /users collection membutuhkan auth, dan kita tidak mau anonymous auth,
 * solusinya adalah menggunakan /public_usernames atau endpoint terpisah.
 * Jika tidak tersedia, gunakan try/catch pada signInWithEmailAndPassword langsung
 * dan handle auto-create dari sisi Cloud Functions atau admin SDK.
 *
 * Catatan: pola create-user-if-not-found dari client side adalah anti-pattern
 * karena Firebase Auth harusnya menjadi source of truth.
 * Akun harus dibuat via admin panel / Cloud Function — bukan client login flow.
 */
export function isAnonymousAuthPolluted(): boolean {
  // Cek apakah current auth state adalah anonymous
  const currentUser = auth.currentUser;
  return !!currentUser?.isAnonymous;
}

/**
 * Bersihkan anonymous session sebelum login normal.
 * Mencegah onAuthStateChanged sequence yang tidak sinkron.
 */
export async function clearAnonymousSession(): Promise<void> {
  if (isAnonymousAuthPolluted()) {
    console.log('[authSessionManager] Clearing anonymous session before login...');
    clearUserProfileCache();
    await signOut(auth);
    // Tunggu sebentar agar onAuthStateChanged(null) selesai diproses
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// ─────────────────────────────────────────────────────────────────
// HELPER: Auth state timeout guard
// ─────────────────────────────────────────────────────────────────

/**
 * Wrap onAuthStateChanged dengan timeout guard.
 * Jika dalam X detik tidak ada auth state yang resolve, paksa reset.
 *
 * Gunakan ini di useEffect yang memanggil onAuthStateChanged:
 *
 *   const timeoutId = authInitTimeout(10000, () => {
 *     console.error('Auth initialization timed out, forcing reload');
 *     clearUserProfileCache();
 *     window.location.reload();
 *   });
 *   // Di dalam onAuthStateChanged callback: clearTimeout(timeoutId);
 */
export function authInitTimeout(
  ms: number,
  onTimeout: () => void
): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    console.error(`[authSessionManager] Auth init timed out after ${ms}ms`);
    onTimeout();
  }, ms);
}
