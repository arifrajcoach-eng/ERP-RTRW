# 📑 PRD (Product Requirement Document) - SmartRW AI

Dokumen ini mendeskripsikan spesifikasi fungsional, arsitektur, dan kebutuhan produk mutlak dari **SmartRW AI**, sebuah platform SaaS (Software-as-a-Service) tata kelola lingkungan (Smart Governance) multi-tenant berskala enterprise yang dirancang khusus untuk RT, RW, Perumahan, dan Cluster di Indonesia.

---

## 🏛️ 1. RINGKASAN PRODUK & VISI UTAMA

### 1.1 Masalah (Problem Statement)
Tata kelola administratif di tingkat terkecil (RT/RW) di Indonesia sering kali menghadapi tantangan klasik:
*   **Arsip Fisik yang Rentan**: Data kependudukan disimpan secara manual dalam buku besar atau spreadsheet lokal, berisiko hilang, atau tidak akurat.
*   **Transparansi Keuangan Rendah**: Pencatatan kas dan iuran warga rawan kesalahan pencatatan dan sulit diaudit langsung oleh warga secara real-time.
*   **E-Administrasi Lambat**: Warga harus mengantre untuk berkas permohonan surat pengantar RT/RW.
*   **Keamanan Wilayah Pasif**: Penanganan darurat (SOS) masih mengandalkan komunikasi pesan instan acak tanpa koordinasi berbasis lokasi yang presisi.

### 1.2 Solusi (SmartRW AI)
SmartRW AI mengintegrasikan seluruh administrasi kependudukan, keuangan kas/iuran, e-administrasi persuratan, kegawatdaruratan (SOS), ekonomi warga melalui pasar lokal (E-Toko), hingga pemantauan kesehatan balita (Posyandu) ke dalam **satu ekosistem berbasis cloud multi-tenant terpadu** yang dapat diakses oleh Warga, Satpam, Pengurus RT, dan Pengurus RW.

---

## 👥 2. PERSONA PENGGUNA (USER PERSONA)

Aplikasi mengenali empat peran pengguna utama dengan hak akses terisolasi secara aman:

| Peran | Deskripsi | Hak Akses Utama |
| :--- | :--- | :--- |
| **Warga** | Anggota komunitas/warga yang tinggal di wilayah aktif. | Melihat pengumuman (Mading), mengecek iuran & kas secara transparan, mengajukan surat pengantar secara mandiri, berbelanja/berjualan di E-Toko, mengajukan keluhan, serta mengaktifkan alarm SOS darurat. |
| **Pengurus RT (Admin)** | Pengelola administratif di tingkat Rukun Tetangga (RT). | Mengelola data kependudukan RT, mencatatkan entri iuran bulanan dan kas, menyetujui surat pengantar warga, mengelola inventaris aset, dan membalas keluhan warga. |
| **Pengurus RW (Parent Admin)** | Pengelola pengawas tingkat tinggi (Rukun Warga). | Mengonsolidasikan laporan dari seluruh RT di bawahnya, melakukan impersonasi (peninjauan) ke sistem RT secara dinamis, mengelola template surat wilayah utama, dan merilis kebijakan global. |
| **Satpam / Linmas** | Tim keamanan dan patroli lingkungan. | Memantau dasbor keamanan, menerima sinyal darurat (SOS) aktif dengan titik koordinat peta langsung, dan mengelola log patroli / buku tamu kunjungan. |

---

## 🏗️ 3. ARSITEKTUR MULTI-TENANT HIERARKIS (GOLDEN RULE 1)

Sistem SmartRW AI dibangun menggunakan arsitektur **Hierarchical Multi-Tenancy** (Hubungan Parent-Child):

```
                   [ RW / Wilayah Utama (Parent Tenant) ]
                                   |
         +------------------------+------------------------+
         |                                                 |
 [ RT 01 (Child Tenant) ]                         [ RT 02 (Child Tenant) ]
```

### 3.1 Aturan Relasi Data
1.  **Field `parentId` wajib**: Setiap tenant RT (Child) menyimpan properti `parentId` yang merujuk pada salah satu tenant RW (Parent).
2.  **Impersonasi Dinamis (`impersonatedTenantId`)**: Pengurus RW dapat memilih salah satu RT bawahan di antarmuka mereka untuk bertindak atas nama RT tersebut. ID impersonasi ini disimpan secara aman dan sementara di browser `localStorage`.
3.  **Self-Healing Error Handler**: ErrorBoundary sistem mendeteksi korupsi memori cache lokal dan menyediakan tombol reset darurat (Auto-Heal) yang akan menyaring data rusak tanpa menghapus token autentikasi inti Firebase (`firebase:auth`).

---

## ⚙️ 4. SPESIFIKASI MODUL & FITUR UTAMA

Dalam sub-bab ini dirinci setiap modul fungsional yang tersedia di SmartRW AI beserta teknologi visual pendukungnya:

### 4.1 Modul Kependudukan (`KependudukanView.tsx` & `WargaView.tsx`)
Modul manajemen profil warga yang memuat identitas digital terlindungi:
*   **Manajemen Kartu Keluarga (KK)**: Pengelompokan warga secara otomatis berdasarkan Nomor KK.
*   **Validasi NIK**: Validasi pola format NIK nasional guna menghindari duplikasi.
*   **ID Card Warga**: ID Card Digital interaktif yang dapat dicetak secara mandiri oleh warga dengan kode QR unik.

### 4.2 Modul Keuangan Premium (`KasView.tsx`, `IuranView.tsx` & `FinansialDashboardView.tsx`)
*   **Manajemen Dues Terstruktur (Iuran Bulanan)**: Pencatatan iuran IPKL (keamanan, kebersihan, listrik, iuran sosial) dengan status otomatis terintegrasi.
*   **AI Scan Struk (OCR Penerimaan)**: Warga atau pengurus dapat mengunggah bukti bayar/nota belanja untuk dipindai secara instan menggunakan kecerdasan buatan, yang mengekstrak nilai nominal, tanggal, dan nama entitas secara presisi.
*   **Visualisasi Kasflow (D3 / Recharts)**: Dasbor statistik interaktif grafik batang dan garis yang melacak pergerakan kas masuk (Debit) vs keluar (Kredit).
*   **Export Laporan**: Ekspor mutasi kas bulanan dalam dokumen PDF formal siap cetak dan File Spreadsheet Excel (`.xlsx`).

### 4.3 E-Administrasi Persuratan (`SuratView.tsx` & `KopTemplateManagementView.tsx`)
Sistem pengurusan dokumen pengantar resmi yang ramah lingkungan:
*   **Surat Pengantar Mandiri**: Warga mengajukan template surat (Surat Keterangan Pengantar KTP, Kartu Keluarga, Domisili, Surat Kematian, dll).
*   **Kop Surat Dinamis**: Pengurus RW dapat mendesain visual Kop Surat (Logo, Nama Wilayah, Teks Kepala) melalui dasbor pembangun Kop Surat yang responsif.
*   **Cetak Standar Formal**: Sistem menghasilkan template cetak PDF resmi dengan tanda tangan berstempel (e-signature format).

### 4.4 Modul Ekonomi Kreatif (`ETokoView.tsx`)
Marketplace lokal terisolasi bagi pelaku UMKM di lingkungan warga:
*   **Listing Produk**: Warga dapat memajang dagangan (makanan, jasa, kerajinan) dengan deskripsi, gambar, dan varian harga.
*   **Sistem Transaksi internal**: Alur checkout instan dan pelacakan pesanan (Diproses, Dikirim, Selesai) untuk menghadirkan sirkulasi ekonomi berdaya saing tinggi.

### 4.5 Modul E-Voting & Pengambilan Keputusan (`EVotingView.tsx` & `CandidateManagementView.tsx`)
Sistem pemilu mandiri (PilRT atau PilRW) bebas kecurangan:
*   **Kartu Paslon Interaktif**: Profil kandidat dengan file foto, dokumen visi misi, dan penanda suara masuk.
*   **Real-time Quick Count**: Grafik hasil hitung suara transparan menggunakan Recharts yang diperbarui secara langsung saat warga mengetuk tombol "Vote".

### 4.6 Proteksi Darurat SOS (`SOSButton.tsx`, `SOSOverlay.tsx` & `SOSDashboardMap.tsx`)
Sistem penanggulangan keadaan bahaya (Kebakaran, Kejahatan, Medis Darurat):
*   **Floating Trigger**: Tombol SOS melayang yang dapat dipicu warga hanya dengan 1 ketukan.
*   **Siren Ring Indicator**: Memutar efek audio sirine berfrekuensi tinggi dengan overlay berkedip intens berwarna merah menyala di seluruh perangkat warga tertaut di tenant tersebut.
*   **Peta Kejadian Aktif**: Lokasi korban SOS ditampilkan di peta dasbor Satpam secara presisi menggunakan Google Maps koordinat GPS.

### 4.7 Modul Kesehatan Balita & Posyandu (`PosyanduView.tsx`)
Sistem pencatatan tumbuh kembang anak usia dini untuk memantau stunting:
*   **Kartu KMS Digital**: Rekam grafik tinggi badan, berat badan anak, lingkar kepala, dan kelengkapan jadwal imunisasi.
*   **Jadwal Imunisasi**: Notifikasi agenda imunisasi berkala yang diunggah oleh bidan/petugas kesehatan.

### 4.8 Modul Patroli & Keamanan (`SatpamDashboard.tsx` & `BukuTamuView.tsx`)
*   **Buku Tamu Publik**: Tamu (kurir, kerabat) dapat memindai Kode QR pos satpam secara mandiri menggunakan smartphone untuk mengisi logs kedatangan (`GuestBookFormPublic.tsx`).
*   **Ronda QR Code**: Penanda titik patroli keliling perumahan agar integritas sistem keamanan ronda tetap terjaga.

---

## 🔒 5. SPESIFIKASI NON-FUNGSIONAL & KEAMANAN DATA

### 5.1 Isolasi Sisi Firestore (Golden Rule 2)
Isolasi multi-tenant diikat di level database menggunakan Firebase Security Rules dan query-filter yang andal:
*   **Rule Query**: Setiap pemanggilan data harus disaring menggunakan parameter tenant pengakses aktif:
    ```typescript
    const q = query(collection(db, "data_warga"), where("tenantId", "==", currentUser.tenantId));
    ```
*   **Firestore Rules Enforcements**: Membatasi hak modifikasi database berdasarkan aturan kepengurusan wilayah melalui fungsi rules, misal `isTenantMember(resource.data.tenantId)`.

### 5.2 Standar Desain "The 10K USD Premium Checklist" (Golden Rule 4 & 5)
Mengadopsi antarmuka kelas dunia yang elegan:
*   **Palet Elegan Slate Modern**: Menghindari elemen visual mencolok berpola gradien warna pelangi acak. Menggunakan perpaduan slate grey yang tenang dipadukan dengan aksen gradasi yang terencana (seperti *indigo-to-purple-to-pink* pada tombol interaktif penting).
*   **Asimteris Grid, Whitespace, & Motion**: Transisi lancar menggunakan animasi `motion` (staggered delay, smooth entering cards) memberikan kepuasan interaksi mikro di setiap navigasi.
*   **Mobile-First Precision**: Dasbor bertransisi secara mulus ke bentuk laci navigasi bawah *(floating bottom navigation sheets)* di layar smartphone dengan touch target minimum 44px.

### 5.3 Manajemen Siklus Arsip Otomatis (Auto-Archive)
Mencegah overload payload Firebase free-tier:
*   Sistem secara otomatis memindahkan atau mengarsipkan permohonan surat administrasi berumur **lebih dari 90 hari (3 bulan)**.
*   Menghapus secara berkala logs transaksi kas/iuran yang telah tersinkronisasi sempurna demi memastikan sistem bekerja optimal dan kencang.

---

## 🗺️ 6. ROADMAP PENGEMBANGAN SEPANJANG TAHUN

```
+---------------------------+       +---------------------------+       +---------------------------+
|          FASE 1           |       |          FASE 2           |       |          FASE 3           |
|  Pilar Admin & Finansial  | ----> |  Ekosistem Komunitas & SOS| ----> | Solusi Enterprise & Whitelabel|
|  (Core Tenant, Kas, Surat)|       |  (E-Toko, Voting, Posyandu|       | (Multi-Cluster Billing, AI|
|                           |       |   Security SOS Map)       |       |  Analytics, Custom Domain)|
+---------------------------+       +---------------------------+       +---------------------------+
```

### Fase 1: Fondasi Kuat Administrasi & Keuangan (Bulan 1-3)
*   Penyempurnaan modul multi-tenant, pendaftaran tenant RT-RW, dan persetujuan akun warga.
*   Pembangunan sistem iuran multi-tagihan otomatis dengan OCR pembaca nota keuangan bertenaga kecerdasan buatan.
*   Pembuatan template surat dinamis tingkat lanjut yang patuh regulasi tata kelola dalam negeri.

### Fase 2: Aktivasi Fitur Gaya Hidup & Kegawatdaruratan (Bulan 4-6)
*   Peluncuran widget SOS darurat bersuara sirine keras disertai dasbor kontrol tim Satpam (Linmas) lingkungan.
*   Penyediaan lapak UMKM (E-Toko) sebagai penggerak sirkulasi modal internal warga.
*   Digitalisasi Posyandu dengan kartu tumbuh kembang KMS guna memerangi kasus stunting di pemukiman.

### Fase 3: Skalabilitas Korporasi & Whitelabel (Bulan 7-12)
*   Integrasi gerbang pembayaran virtual (simulasi Midtrans / payment gateway sesungguhnya) untuk pembayaran iuran instan otomatis dari handphone.
*   Kemampuan analisis pintar prediktif menggunakan model kecerdasan buatan Gemini AI untuk meramalkan kesehatan keuangan kas RT/RW hingga mereview anomali statistik iuran.
*   Whitelabeling untuk kompleks perumahan berskala masif (Apartemen, Townhouse, Kawasan Mandiri).
