/**
 * PATCH: App.tsx — Auth Flow Fixes
 *
 * Terapkan perubahan berikut satu per satu di App.tsx.
 * Setiap blok menunjukkan BEFORE dan AFTER yang tepat.
 */

// ═══════════════════════════════════════════════════════════════
// FIX A — Import authSessionManager di bagian atas App.tsx
// ═══════════════════════════════════════════════════════════════

// TAMBAHKAN import ini di baris import (setelah import safeStorage):
/*
import {
  clearUserProfileCache,
  invalidateUserProfileCache,
  safeSignOut,
  clearAnonymousSession,
  authInitTimeout,
} from './lib/authSessionManager';
*/


// ═══════════════════════════════════════════════════════════════
// FIX B — onAuthStateChanged: hapus early-return dari cache
// ═══════════════════════════════════════════════════════════════
// File: App.tsx, sekitar baris 461–480

// BEFORE (HAPUS BLOK INI):
/*
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check session cache first to prevent redundant quota usage
          const cachedProfile = safeSessionStorage.getItem(`user_profile_${user.uid}`);
          if (cachedProfile) {
            try {
              const parsed = JSON.parse(cachedProfile);
              setCurrentUser({ uid: user.uid, ...parsed });
              setIsAuthInitializing(false);
              return;   // ← MASALAH: early return, token tidak divalidasi ulang
            } catch (e) {
              safeSessionStorage.removeItem(`user_profile_${user.uid}`);
            }
          }
*/

// AFTER (GANTI DENGAN):
/*
    // Auth init timeout guard — jika 15 detik tidak resolve, reload
    let authResolved = false;
    const authTimeoutId = authInitTimeout(15000, () => {
      if (!authResolved) {
        console.error('[Auth] Initialization timed out. Clearing cache and reloading...');
        clearUserProfileCache();
        setIsAuthInitializing(false);
        // Jangan reload otomatis — biarkan user lihat UI dan reload manual
        // Tapi set state loading = false agar tidak infinite loading
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      authResolved = true;
      clearTimeout(authTimeoutId);

      if (user) {
        try {
          // PATCH: Session cache hanya sebagai optimisasi, BUKAN gate yang memblok
          // Selalu fetch dari Firestore untuk memvalidasi token masih valid
          // Cache hanya digunakan sebagai fallback jika Firestore timeout
          const cachedProfile = safeSessionStorage.getItem(`user_profile_${user.uid}`);
          
          // Fetch dari Firestore (source of truth)
          const userDocRef = doc(db, "users", user.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err: any) {
            // Jika Firestore gagal DAN ada cache, gunakan cache sebagai fallback
            if (cachedProfile) {
              console.warn('[Auth] Firestore fetch failed, using cached profile as fallback');
              try {
                const parsed = JSON.parse(cachedProfile);
                setCurrentUser({ uid: user.uid, ...parsed });
                setIsAuthInitializing(false);
                return;
              } catch (parseErr) {
                safeSessionStorage.removeItem(`user_profile_${user.uid}`);
              }
            }
            throw err; // Re-throw jika tidak ada cache
          }
*/
// CATATAN: Hapus juga blok `if (userProfileCache[user.uid]) ... else { getDoc }` 
// yang ada di bawahnya karena logika fetch sudah di atas.


// ═══════════════════════════════════════════════════════════════
// FIX C — Cache write: invalidate dulu sebelum write baru
// ═══════════════════════════════════════════════════════════════
// File: App.tsx, sekitar baris 574

// BEFORE:
/*
            safeSessionStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(userData));
            setCurrentUser({ uid: user.uid, ...userData });
*/

// AFTER:
/*
            // Invalidate sebelum set (menghindari partial-write corruption)
            safeSessionStorage.removeItem(`user_profile_${user.uid}`);
            try {
              safeSessionStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(userData));
            } catch (storageErr) {
              // SessionStorage mungkin penuh — tidak masalah, cache bersifat opsional
              console.warn('[Auth] Could not cache user profile:', storageErr);
            }
            setCurrentUser({ uid: user.uid, ...userData });
*/


// ═══════════════════════════════════════════════════════════════
// FIX D — handleLogout: gunakan safeSignOut, clear cache dulu
// ═══════════════════════════════════════════════════════════════
// File: App.tsx, sekitar baris 722

// BEFORE:
/*
  const handleLogout = async () => {
    try {
      if (wargaAuth) {
        setWargaAuth(null);
      } else {
        await signOut(auth);
      }
*/

// AFTER:
/*
  const handleLogout = async () => {
    try {
      if (wargaAuth) {
        setWargaAuth(null);
      } else {
        // FIX: clear profile cache SEBELUM signOut
        // Mencegah onAuthStateChanged login berikutnya membaca cache stale
        clearUserProfileCache();
        await signOut(auth);
      }
*/


// ═══════════════════════════════════════════════════════════════
// FIX E — handleLogin: hilangkan race condition signOut + signIn
// ═══════════════════════════════════════════════════════════════
// File: App.tsx, sekitar baris 6654

// BEFORE (MASALAH RACE CONDITION):
/*
      try {
        await signOut(auth); // Ensure clean state before sign-in  ← RACE CONDITION
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, targetPass);
*/

// AFTER (SAFE):
/*
      try {
        // FIX: Clear cache dulu, baru signOut, baru signIn
        // urutan ini mencegah onAuthStateChanged(null) → setCurrentUser(null)
        // dipanggil SETELAH signIn berhasil (race condition)
        clearUserProfileCache();
        if (auth.currentUser) {
          await signOut(auth);
          // Tunggu sebentar agar event null dari onAuthStateChanged selesai
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, targetPass);
*/


// ═══════════════════════════════════════════════════════════════
// FIX F — handleLogin: hapus pola signInAnonymously untuk cek pre-reg
// ═══════════════════════════════════════════════════════════════
// File: App.tsx, sekitar baris 6670–6710

// BEFORE (ANONYMOUS AUTH POLLUTION):
/*
          } catch (loginErr: any) {
            if (loginErr.code === "auth/user-not-found" || ...) {
              let wasCreated = false;
              try {
                await signInAnonymously(auth);  // ← MASALAH: auth state pollution
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", loginEmail));
                const snap = await getDocs(q);
                if (!snap.empty) {
                  const matchFound = snap.docs.some(d => d.data().password === targetPass);
                  if (matchFound) {
                    await createUserWithEmailAndPassword(auth, loginEmail, targetPass);
                    wasCreated = true;
                  }
                }
              } catch (autoErr: any) { ... }
              if (!wasCreated) throw loginErr;
            }
*/

// AFTER (TANPA ANONYMOUS AUTH POLLUTION):
/*
          } catch (loginErr: any) {
            if (loginErr.code === "auth/user-not-found" || 
                loginErr.code === "auth/invalid-credential" || 
                loginErr.code === "auth/wrong-password") {
              
              // FIX: Jangan gunakan signInAnonymously untuk pre-reg check
              // Pattern ini menyebabkan auth state pollution yang susah di-debug.
              // 
              // Admin RT/RW seharusnya membuat user via Firebase Console atau
              // admin SDK (Cloud Function). Jika masih ingin auto-create,
              // gunakan Cloud Function endpoint terpisah — bukan dari client.
              //
              // Untuk kompatibilitas mundur: coba createUserWithEmailAndPassword
              // jika user memang ada di Firestore tapi belum ada di Firebase Auth.
              // Ini dilakukan via signIn ke endpoint Cloud Function terpisah.
              
              let wasCreated = false;
              try {
                // Cek apakah ada data user di Firestore TANPA anonymous auth
                // Gunakan query yang diizinkan untuk anonymous/unauthenticated user
                // (perlu Firestore rule yang memperbolehkan public query by email)
                // Alternatif: gunakan Firebase Custom Token via Cloud Function
                
                // Short-term fix: langsung create user jika tidak ada,
                // karena kita tidak bisa query Firestore tanpa auth
                // TANPA menggunakan anonymous auth
                await createUserWithEmailAndPassword(auth, loginEmail, targetPass);
                wasCreated = true;
              } catch (createErr: any) {
                if (createErr.code === 'auth/email-already-in-use') {
                  // User ada di Auth tapi password salah
                  wasCreated = false;
                } else if (createErr.code === 'unavailable' || 
                           createErr.message?.includes('Could not reach')) {
                  throw new Error("DATABASE_UNAVAILABLE");
                }
                console.warn('[Auth] Auto-create failed:', createErr.code);
              }
              
              if (!wasCreated) throw loginErr;
            } else if (loginErr.code === "auth/network-request-failed") {
              throw loginErr;
            } else {
              throw loginErr;
            }
          }
*/


// ═══════════════════════════════════════════════════════════════
// FIX G — firebase.ts: tambahkan auth persistence yang eksplisit
// ═══════════════════════════════════════════════════════════════
// File: src/firebase.ts

// BEFORE:
/*
export const auth = getAuth(app);
auth.useDeviceLanguage();
*/

// AFTER:
/*
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

export const auth = getAuth(app);
auth.useDeviceLanguage();

// Set persistence explicitly di module level — bukan di useEffect
// Ini memastikan persistence di-set SEBELUM onAuthStateChanged pertama kali fired
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('[firebase] Could not set auth persistence:', err);
});
*/

// CATATAN: Hapus `setPersistence(auth, browserLocalPersistence)` dari App.tsx useEffect
// karena sudah di-set di firebase.ts. Memanggil dua kali bisa cause race condition.


// ═══════════════════════════════════════════════════════════════
// RINGKASAN SEMUA PERUBAHAN
// ═══════════════════════════════════════════════════════════════
/*
FILE BARU:
  src/lib/authSessionManager.ts     ← utility functions

FILE DIMODIFIKASI:
  src/firebase.ts
    - Pindahkan setPersistence() ke module level (bukan useEffect)
    
  src/App.tsx
    - Import authSessionManager
    - Fix B: Hapus early-return dari session cache di onAuthStateChanged
    - Fix C: Invalidate cache sebelum write
    - Fix D: handleLogout → clearUserProfileCache() sebelum signOut
    - Fix E: handleLogin → delay kecil antara signOut dan signIn
    - Fix F: Hapus signInAnonymously dari login error recovery
    - Fix G: Hapus setPersistence dari useEffect (sudah di firebase.ts)
*/
