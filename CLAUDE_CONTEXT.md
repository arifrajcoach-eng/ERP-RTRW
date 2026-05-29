# SmartRW AI - Complete Reference & Context Guide for Claude Code

Dokumen ini disusun khusus sebagai panduan referensi lengkap untuk **Claude Code** agar dapat mengintegrasikan semua peran secara otonom (Automated QC, Operations, & Governance Assistant) dengan pemahaman mendalam tentang arsitektur, basis kode, dan aturan fungsional aplikasi SmartRW AI.

---

## 🏗️ 1. PETA STRUKTUR PROYEK (Project Tree Schema)

Berikut adalah komponen-komponen kritis dalam folder `/src` yang mengatur seluruh logika aplikasi:

```
/src
├── App.tsx                    # Controller Utama, Routing, State Management & Sidebar Menu
├── firebase.ts                # Inisialisasi Firebase Auth, Firestore DB, & Resilient Memory Cache
├── types.ts                   # Kontrak tipe data TypeScript untuk Log Tambah, SOS, & Tamu
├── constants.ts               # Batasan default paket langganan (maxWarga, limit kuota)
├── /lib
│   ├── appUtils.tsx           # Kalkulasi fitur aktif berdasarkan addon & status tenant
│   └── langUtils.ts           # White-labeling dinamis (getTranslatedLabel) untuk RT/RW/Cluster/Apt
├── /services
│   ├── aiService.ts           # Integrasi Gemini AI untuk Laporan, Summary, & FAQ otomatis
│   ├── dataService.ts         # Integrasi CRUD & Fetching real-time terfilter tenantId
│   └── subscriptionService.ts # Verifikasi status langganan tenant aktif
└── /components
    ├── ErrorBoundary.tsx      # Isolator eror runtime untuk mencegah crash total layar putih
    ├── WargaView.tsx          # Panel manajemen kependudukan dengan checks limit warga pasca-addon
    ├── SuratView.tsx          # Management administrasi surat pengantar dengan validasi kepemilikan
    ├── KasView.tsx            # Pembukuan kas masuk & keluar terisolasi per wilayah
    └── SOSButton.tsx          # Integrasi tombol darurat terhubung ke satpam / petugas terdekat
```

---

## 🔒 2. ARSITEKTUR MULTI-TENANCY & ATURAN MUTLAK ISOLASI

Aplikasi SmartRW AI mengimplementasikan arsitektur database multi-tenant berbasis single-database cluster dengan isolasi logis.

### A. Pola Relasi Parent-Child (RW-RT)
*   **Parent (RW)** memiliki kendali atas beberapa **Child (RT)** di bawahnya.
*   RT ditandai dengan field `parentId` di dokumen tenant-nya yang berisi `id` dari RW terkait.
*   **Aturan Impersonasi:** Admin RW dapat melakukan peninjauan (impersonasi) tanpa perlu login langsung ke data RT. Hal ini diatur melalui state `impersonatedTenantId` yang disimpan di `localStorage`.
*   **Aturan Self-Healing:** Tombol darurat di browser (`ErrorBoundary` reset) hanya membersihkan cache tampilan tanpa menghapus key otentikasi primer (`firebase:auth`, `currentTenant`, `impersonatedTenantId`).

### B. Standard Keamanan Enforced-Tenant Query
Setiap query Firestore yang mengambil data koleksi dinamis harus disaring menggunakan parameter `tenantId` dari tenant yang saat ini aktif:
```typescript
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Pola Filter Query yang Benar:
const q = query(
  collection(db, "data_warga"),
  where("tenantId", "in", [currentTenantId]) // Atok gunakan == untuk string tunggal
);
```

### C. Translasi Label Wilayah Dinamis
Gunakan selalu utilitas `getTranslatedLabel(key, themeMode)` dari `@/lib/langUtils` untuk memastikan tampilan teks otomatis menyesuaikan tipologi wilayah:
*   Jika `themeMode === 'rt_rw'`: `RT` -> "RT", `Warga` -> "Warga"
*   Jika `themeMode === 'cluster'`: `RT` -> "Blok", `Warga` -> "Warga"
*   Jika `themeMode === 'apartemen'`: `RT` -> "Unit", `Warga` -> "Penghuni"

---

## ⚙️ 3. TIERING SUBSCRIPTION & FITUR ADD-ON

Batas kapasitas dan jumlah warga terhitung menggunakan properti `maxWarga` dari modul `@/lib/appUtils.tsx`. 

*   **Trial / Free:** Dibatasi maksimal **50 Warga**.
*   **Standard / Pro / Premium:** Memiliki batas bawaan dari schema `PLAN_FEATURES` di `src/constants.ts`.
*   **Add-On Booster:** Tenant dapat membeli kuota warga ekstra (contoh: +100 warga, +500 warga). Kalkulasi harus menggunakan hasil akhir dari wrapper `getPlanFeatures(tenant).maxWarga` dan bukan membaca properti mentah `.maxWarga` dari objek tenant secara langsung.

---

## 🤖 4. INTEGRASI WORKFLOW UNTUK CLAUDE CODE

Anda dapat memberikan instruksi langsung ke Claude Code dengan memberikan file referensi `.md` ini. 

### Perintah Cepat Terminal Untuk Claude Code:
1.  **Melakukan Audit Keamanan Query:**
    ```bash
    claude "Gunakan panduan di CLAUDE_CONTEXT.md dan cek seluruh query collection di src/ untuk memastikan filter tenantId tidak pernah absen"
    ```
2.  **Melakukan Verifikasi Konsistensi Fitur:**
    ```bash
    claude "Audit file src/components/ untuk memastikan modul-modul input baru telah menggunakan getTranslatedLabel untuk white-labeling sesuai tema"
    ```
3.  **Melakukan Health-Check Dependensi:**
    ```bash
    claude "Jalankan linting applet dan periksa apakah ada import tipe data enum yang keliru atau modul tidak terpakai"
    ```
