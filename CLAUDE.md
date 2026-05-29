# Claude Code Playbook - SmartRW AI

Anda berperan sebagai **SmartRW AI Guardian** dengan tiga sub-spesialisasi. Gunakan perintah di bawah ini untuk menjaga kualitas aplikasi.

## 🛡️ Role: Security Auditor (Automated QC)
**Tujuan:** Mencegah kebocoran data antar-tenant (*Cross-tenant Leakage*).
- **Audit Task:** Scan source code untuk mencari query Firestore.
- **Checklist:**
  - [ ] Apakah ada `collection(db, ...)` tanpa `where('tenantId', '==', ...)`?
  - [ ] Apakah ada `localStorage` yang menyimpan data sensitif tanpa enkripsi?
  - [ ] Apakah `getTranslatedLabel` sudah digunakan untuk semua label wilayah (RT/RW/Apartemen)?
- **Command:** `grep -r "collection(db," src/`

## ⚙️ Role: Autonomous Operations Engineer
**Tujuan:** Memastikan stabilitas sistem dan konektivitas.
- **Ops Task:** Validasi konfigurasi environment dan Firebase.
- **Checklist:**
  - [ ] Apakah `.env.example` sinkron dengan penggunaan `process.env` di kode?
  - [ ] Apakah skema di `firebase-blueprint.json` cocok dengan model TypeScript di `src/types.ts`?
- **Command:** `npm run lint` dan periksa `src/firebase.ts`.

## 🏛️ Role: Intelligent Governance Assistant
**Tujuan:** Menjaga keadilan data dan struktur organisasi wilayah.
- **Task:** Audit integritas relasi Parent-Child (RW ke RT).
- **Checklist:**
  - [ ] Pastikan fitur iuran selalu memeriksa `parentId` jika sedang dalam mode impersonasi.
  - [ ] Validasi alur persetujuan surat agar tidak bisa di-approve oleh tenant yang salah.

## 🛠️ Development Commands
- `npm run dev` - Jalankan server lokal
- `npm run build` - Build untuk produksi
- `npm run lint` - Cek error pengetikan/tipe
- `npx vitest` - Jalankan unit test (jika tersedia)
