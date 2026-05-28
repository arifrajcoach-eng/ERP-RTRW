# 📑 SmartRW AI - Blueprint & Arsitektur Desain Sistem

Dokumen ini disusun sebagai acuan teknis komprehensif, arsitektur data, dan panduan desain untuk membangun kembali atau memperluas aplikasi **SmartRW AI**. Gunakan dokumen ini sebagai cetak biru (blueprint) agar standar performa, keamanan, dan fungsionalitas tetap terjaga.

---

## 🏛️ 1. Arsitektur Multi-Tenant Terdistribusi (Parent-Child)

Aplikasi ini menggunakan desain **Multi-Tenant Hierarkis** yang dirancang untuk membagi wilayah administratif secara logis dan aman.

```
                  [ RW / Wilayah Utama (Parent Tenant) ]
                                  |
         +------------------------+------------------------+
         |                                                 |
[ RT 01 (Child Tenant) ]                         [ RT 02 (Child Tenant) ]
```

### 🔑 Aturan Utama Sinkronisasi Data:
1. **Relasi `parentId`:**
   - Setiap Tenant RT (Child) wajib memiliki field `parentId` yang merujuk pada parent-nya (RW).
   - Memutuskan relasi ini akan merusak konsolidasi data keuangan (kas), iuran, mading, dan laporan yang diakses oleh pengurus RW.
2. **Mekanisme Impersonasi (Sesi Sementara):**
   - Pengurus RW dapat "meninjau" wilayah RT di bawahnya tanpa perlu login ulang.
   - Keadaan ini disimpan di `localStorage` menggunakan parameter `impersonatedTenantId`.
3. **Mekanisme Self-Healing (Perbaikan Mandiri):**
   - Jika terdapat kegagalan struktur data lokal/browser, sistem menyediakan tombol reset darurat.
   - Proses ini **TIDAK BOLEH** menghapus kunci otentikasi primer (`firebase:auth`, `firebaseLocalStorageDb`) serta kunci status tenant (`impersonatedTenantId`, `currentTenant`, `parentTenant`).

---

## 🔒 2. Strategi Keamanan & Isolasi Data (Firestore)

Keamanan SmartRW AI berdiri di atas prinsip **Zero-Trust Multi-Tenancy**. Data satu wilayah tidak boleh bocor ke wilayah lain.

### 🛡️ Implementasi Firestore Security Rules
Seluruh CRUD pada Firestore dibatasi secara ketat berdasarkan status login, relasi tenant, dan peran (role) pengguna.
*   **Akses Surat (`/databases/{database}/documents/surat/{id}`):**
    *   **Membaca/Menulis:** Hanya diperbolehkan jika pengguna telah masuk (authenticated), dan merupakan pemilik asli dokumen (berdasarkan pencocokan `authUid` / `userId` / `nik`), atau merupakan **Pengurus** (`isPengurus()`) yang berada di bawah tenant yang sama (`isTenantMember(resource.data.tenantId)`).

```javascript
// Struktur Dasar Rule Surat
match /surat/{id} {
  allow get: if isSignedIn();
  allow create: if isSignedIn();
  allow update, delete: if isAdmin() || (
    isSignedIn() && (
      // Aturan Warga Mandiri (E-Administrasi)
      (resource != null && (
        resource.data.authUid == request.auth.uid || 
        resource.data.userId == request.auth.uid || 
        resource.data.nik == getUserData().nik
      )) ||
      // Aturan Pengurus (RT / RW)
      (getUserData() != null && (
        getUserData().role in ['SUPER_ADMIN', 'ADMIN'] ||
        (isPengurus() && isTenantMember(resource.data.tenantId))
      ))
    )
  );
}
```

### 🔍 Penyaringan Query Sisi Klien (Frontend Enforced)
Setiap panggilan data Firestore wajib menyertakan filter ID Tenant aktif untuk meminimalkan beban memori klien:
```typescript
const q = query(
  collection(db, 'data_warga'), 
  where('tenantId', '==', currentUser.tenantId)
);
```

---

## 🎨 3. Pedoman Desain Visual & Antarmuka (UI/UX)

Desain antarmuka SmartRW AI condong pada gaya **Modern Swiss Slate Tech-Forward** dengan tingkat keterbacaan yang tinggi.

*   **Tema Warna Utama (High-Contrast Slate):**
    *   Latar Belakang: Off-whites (`bg-slate-50/50` atau `bg-slate-100`) untuk light-mode, dan charcoal-slate (`bg-slate-900`) untuk dark-mode.
    *   Elemen Informasi: Sempit, bersih, minim penggunaan garis luar tebal. Pilih shadow lembut (`shadow-sm`) dibandingkan layout bertingkat tajam.
*   **Tipografi yang Kuat:**
    *   **Inter** untuk teks utama (UI standard) memberikan keterbacaan tinggi.
    *   **Space Grotesk** atau **Outfit** untuk Display Headings dengan tracking rapat (`tracking-tight font-black`) memberikan kesan kokoh & elegan.
    *   **JetBrains Mono** untuk indikator status, kode, angka, nilai keuangan, dan metrik data.
*   **Interaksi Efek Gerak (Micro-movement):**
    *   Gunakan `motion/react` untuk setiap pergeseran status, pembukaan modal, dan transisi tab agar memberikan kepuasan taktil kepada pengguna.
    *   *Touch Targets:* Seluruh tombol interaktif utama wajib berdimensi minimal 44px untuk kenyamanan pengguna perangkat seluler.

---

## 💾 4. Arsitektur Data & Model Penyimpanan Utama

Berikut adalah referensi schema koleksi utama Firestore yang digunakan oleh sistem:

### 📁 Koleksi `surat` (Arsip & Permohonan Administrasi)
Menyimpan riwayat dan draf permohonan surat pengantar dari warga ke RT/RW.
```json
{
  "id": "doc_id_otomatis",
  "tenantId": "rw26_berjuang",
  "jenis": "Pengantar KTP/KK",
  "pemohon": "Achmad Syarif",
  "nik": "317xxxxxxxxxxxxx",
  "status": "Selesai", // Pilihan: 'Draft', 'Menunggu Persetujuan RT', 'Menunggu Persetujuan RW', 'Selesai', 'Ditolak', 'Diarsipkan'
  "tanggal": "2026-05-23T00:00:00Z",
  "userId": "uid_pengguna_auth",
  "authUid": "uid_pengguna_auth",
  "tanggalPengajuan": "2026-05-23T08:12:00Z",
  "archivedAt": "2026-05-28T09:42:00Z" // Opsional jika status 'Diarsipkan'
}
```

### 📁 Koleksi `data_warga` (Profil Kependudukan)
Kumpulan database warga utama yang terelasi erat dengan Kartu Keluarga (KK).
```json
{
  "id": "doc_id_nik",
  "tenantId": "rt01_rw26",
  "nik": "317xxxxxxxxxxxxx",
  "nama": "Achmad Syarif",
  "noKK": "317xxxxxxxxxxxxx",
  "role": "WARGA",
  "status": "AKTIF",
  "listWargaInKK": [
    { "nik": "317xxxxxxxxxxxxx", "nama": "Istri", "hubungan": "Istri" }
  ]
}
```

---

## ⚙️ 5. Manajemen Pembersihan Data Otomatis & Penghapusan

Untuk mencegah membengkaknya penyimpanan Firestore seiring waktu, SmartRW AI melengkapi model sirkulasi datanya dengan 2 fitur mutlak:

1.  **Tombol Hapus Mandiri (Warga & Admin):**
    *   Warga dapat menghapus draf/permohonan surat milik mereka sendiri dari tab **Riwayat** secara langsung.
    *   Admin dapat menghapus dokumen surat apa pun yang diotorisasi di bawah yurisdiksi tenant-nya.
2.  **Mesin Pengarsipan Otomatis (Auto-Archive):**
    *   Pembersihan otomatis mendeteksi surat lama yang berumur **> 3 bulan (90 hari)**.
    *   Surat aktif dipindahkan dengan status `'Diarsipkan'` sehingga kearsipan historis tetap steril dari daftar utama.
    *   Surat yang sudah rampung (status `Selesai` atau `Ditolak`) akan dihapus secara permanen dari server Firestore untuk menjaga kesehatan skalabilitas aplikasi.
