# SmartRW AI - Developer & AI Agent Guidelines

Dokumen ini berisi panduan mutlak dan arsitektur penting untuk dipatuhi oleh seluruh pengembang (baik Human Engineer maupun AI Agents seperti **Gemini Built-in**, **Claude Code**, **Cursor**, atau **Github Actions**).

---

## 🚨 ATURAN EMAS 1: Integritas Struktur Parent & Child Tenant (MUTLAK)
Aplikasi SmartRW AI berjalan di atas sistem multi-tenant terdistribusi dengan hubungan **Parent (RW / Wilayah Utama)** dan **Child (RT / Wilayah Bagian)**. Hubungan ini **TIDAK BOLEH** diubah, dirusak, atau dihilangkan mekanismenya dalam keadaan apa pun:

1. **Relasi `parentId`:**
   - Setiap Tenant RT (Child) memiliki properti `parentId` yang merujuk pada Tenant RW (Parent).
   - Memutuskan atau mengabaikan field `parentId` ini akan merusak sinkronisasi data iuran, surat, dan kepengurusan wilayah.

2. **Mekanisme Impersonasi & Sesi Sementera:**
   - Fitur di mana Parent Tenant bisa melakukan impersonasi (meninjau/mengakses) ke Child Tenant melalui `impersonatedTenantId` di `localStorage` harus terus dijaga agar tidak terjadi kebocoran hak akses.
   - Session/Local Storage yang bertugas menyimpan status tenant (`currentTenant`, `parentTenant`, `impersonatedTenantId`) **tidak boleh** dihapus atau di-reset secara sembarangan oleh rutin pembersihan otomatis.

3. **Restorasi Keadaan Darurat (Self-Healing / Auto-Heal):**
   - Jika `ErrorBoundary` mendeteksi adanya malfungsi memori lokal, tombol "Auto-Heal & Reset" akan membersihkan cache browser **TANPA** menghapus key otentikasi kunci (`firebase:auth`, `firebaseLocalStorageDb`) dan key tenant (`impersonatedTenantId`, `currentTenant`, `parentTenant`).

---

## 🔒 ATURAN EMAS 2: Keamanan & Pemisahan Data Firestore (Data Segregation)
1. **Penyaringan Query Firestore:**
   - Setiap query Firestore baru yang ditulis wajib menyertakan filter berdasarkan `tenantId` dari pengguna yang sedang aktif (`currentTenant.id` atau `currentUser.tenantId`).
   - *Contoh Benar:*
     ```typescript
     const q = query(
       collection(db, 'data_warga'), 
       where('tenantId', '==', currentUser.tenantId)
     );
     ```
2. **Aturan Keamanan (Security Rules):**
   - Semua modifikasi aturan keamanan pada Firestore harus menggunakan fungsi validasi keanggotaan tenant, contohnya: `isTenantMember(resource.data.tenantId)` untuk menghindari kebocoran data antar-tenant (*cross-tenant data leakage*). Jangan pernah menggunakan `allow read, write: if true;`.

---

## 🛠️ ATURAN EMAS 3: Self-Healing & Automated QC
1. **Penanganan Eror Runtime:**
   - Semua modul utama wajib dilindungi oleh `ErrorBoundary` global yang ramah pengguna.
   - Gagalnya satu komponen kecil di dalam halaman (misal: visualisasi chart data yang null) tidak boleh menyebabkan satu layar gantung/putih (*blank screen*). Isolasi bagian tersebut menggunakan ErrorBoundary lokal atau berikan fallback UI yang bersih.
2. **Sanitasi Data Inputs:**
   - Lakukan penanganan *try-catch* yang solid saat memproses parsing data mentah dari LocalStorage atau response API pihak ketiga, untuk mencegah app crash saat startup akibat data korup.
