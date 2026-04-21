# Security Specification - RW 26 BERJUANG

## 1. Data Invariants
- **Warga**: Setiap warga harus memiliki NIK yang valid (16 digit numeric). Hanya Admin dan Operator yang bisa menambah/edit data warga.
- **Kas**: Setiap transaksi kas harus memiliki tipe 'Masuk' atau 'Keluar'. Debit/Kredit harus valid (number >= 0).
- **Surat**: Permohonan surat hanya bisa diajukan oleh pengguna terautentikasi (Warga). Persetujuan/Penolakan hanya bisa dilakukan oleh Admin/Operator.
- **Iuran**: Catatan iuran terkait dengan data warga. Nominal harus number > 0.
- **Users**: Profil pengguna (role dsb) hanya bisa dibaca oleh pemiliknya atau Admin. Role tidak bisa diubah sendiri oleh user (hanya Admin).

## 2. The "Dirty Dozen" Payloads (Deny Test Cases)

1. **Identity Spoofing**: Mencoba membuat warga dengan field `ownerId` orang lain.
2. **Privilege Escalation**: User biasa mencoba set `role: 'Admin'` di koleksi `users`.
3. **Invalid ID**: Mencoba membuat dokumen dengan ID `../../../etc/passwd` (ID Poisoning).
4. **Negative Nominal**: Membuat catatan iuran dengan `nominal: -100000`.
5. **Shadow Fields**: Menambahkan field tersembunyi `isVerified: true` pada data warga untuk mem-bypass validasi UI.
6. **Orphaned Write**: Menambah iuran tanpa `nik` warga yang valid.
7. **Terminal State Bypass**: Mengubah status surat yang sudah 'Selesai'.
8. **Resource Exhaustion**: Mengirim string NAMA sepanjang 1MB.
9. **Unauthorized List**: User 'Viewer' mencoba membaca seluruh koleksi `users`.
10. **Unverified Auth**: Mencoba menulis data tanpa email yang terverifikasi (jika diaktifkan).
11. **Timestamp Spoofing**: Mengirim `createdAt` manual (bukan server timestamp).
12. **Foreign Update**: User A mencoba menghapus data kas yang diinput oleh User B.

## 3. Test Runner Configuration
File `firestore.rules.test.ts` akan memvalidasi skenario di atas.
