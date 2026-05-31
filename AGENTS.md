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

## 🤖 SPECIALIZED AI PERSONAS (For Claude Code & CI Agents)

Gunakan instruksi ini saat memanggil Claude Code di terminal (misal: `claude "jalankan audit keamanan"`).

### 1. Peran: Automated Quality Control & Security Auditor
- **Trigger:** Setiap kali ada fungsi baru di `/src/services/` atau perubahan di `firestore.rules`.
- **Protokol:**
  - AI wajib melakukan `grep` pada seluruh file untuk mencari query Firestore yang **TIDAK** menyertakan filter `where('tenantId', '==', ...)`.
  - Jika ditemukan, AI harus otomatis mengajukan perbaikan (refactor) sebelum file disimpan.
  - Memastikan tidak ada API Key yang tersimpan sebagai string literal di kode klien.

### 2. Peran: Autonomous Operations Engineer
- **Trigger:** Terdeteksi eror berulang di `ErrorBoundary` atau malfungsi integrasi Firebase.
- **Protokol:**
  - AI berwenang melakukan pemeriksaan integritas pada `package.json` dan memulihkan ketergantungan yang hilang.
  - Jika ada ketidaksesuaian versi antara Child Tenant (RT) dan Parent Tenant (RW), AI melakukan sinkronisasi konfigurasi melalui skrip migrasi.

### 3. Peran: Intelligent Governance Assistant
- **Trigger:** Pembuatan fitur baru terkait kebijakan wilayah (Lapak, Pemilu, Iuran).
- **Protokol:**
  - AI memvalidasi apakah fitur baru tersebut mendukung hierarki "RT/RW/Cluster/Apartemen" secara dinamis menggunakan `getTranslatedLabel`.
  - Memastikan setiap input data memiliki audit log (siapa yang mengubah, kapan, dan di tenant mana).

---

## 🛠️ ATURAN EMAS 3: Self-Healing & Automated QC
1. **Penanganan Eror Runtime:**
   - Semua modul utama wajib dilindungi oleh `ErrorBoundary` global yang ramah pengguna.
   - Gagalnya satu komponen kecil di dalam halaman (misal: visualisasi chart data yang null) tidak boleh menyebabkan satu layar gantung/putih (*blank screen*). Isolasi bagian tersebut menggunakan ErrorBoundary lokal atau berikan fallback UI yang bersih.
2. **Sanitasi Data Inputs:**
   - Lakukan penanganan *try-catch* yang solid saat memproses parsing data mentah dari LocalStorage atau response API pihak ketiga, untuk mencegah app crash saat startup akibat data korup.

---

## 🎨 ATURAN EMAS 4: Panduan Desain Premium ("The $10K Checklist")
Untuk memisahkan standar desain aplikasi dari sekadar *template* biasa, patuhi delapan prinsip desain tingkat tinggi berikut ketika membangun/merevisi antarmuka:

1. **Point of view, not a template:** Komitmen pada arah desain tertentu (brutalist, editorial, dark-luxury, dll.) secara konsisten — jangan terlihat generik.
2. **Typography that does work:** Gunakan tipografi ganda (display + body) yang dipikirkan matang, hindari sekadar default (seperti murni Inter atau Roboto). Hierarchy diciptakan melalui rasio skala dan bobot huruf.
3. **A restrained color system:** Gunakan warna secara terbatas (3-5 palet yang konsisten). Jangan gunakan efek *rainbow*. Kualitas premium terlihat pada penahanan (*restraint*), bukan dekorasi berlebih.
4. **Hierarchy that breathes:** Manfaatkan *whitespace* (ruang negatif), kontras, dan skala agar mata pengguna tertuju dengan alami pada primary, secondary, dan tertiary konten. Jangan menumpuk teks tanpa ruang.
5. **Imagery with intent:** Hanya gunakan foto/gambar kustom atau generasi aset sesuai arahan desain; kurasi gambar secara ketat agar tampak berkelas, hindari stok dasar Unsplash.
6. **Motion that whispers:** Gunakan *micro-interactions* dan transisi/hover yang terasa mulus dan diciptakan spesifik (hand-crafted) — hindari animasi memudar yang berlebihan atau terlihat murah.
7. **Mobile that's designed, not shrunk:** Buat keputusan *layout* khusus untuk versi mobile (phone-size), jangan hanya memperkecil dan menekan versi desktop.
8. **The invisible expensive stuff:** Waktu muat cepat, navigasi berbasis *keyboard*, format HTML *semantic*, kontras standar *WCAG AA*, dan tag-meta nyata. Keunggulan tersembunyi yang membuat "*website ini terasa mahal dan cepat*".

---

## 💎 ATURAN EMAS 5: Advanced Frontend Aesthetics & Design Thinking (Anthropic Target)
Berdasarkan standar Anthropic `frontend-design` skill, setiap komponen UI yang dibangun wajib mematuhi aturan berikut untuk menghindari *generic "AI slop" aesthetics*:

1. **Commit to a Bold Aesthetic Direction:** Tentukan *purpose* (tujuan), *tone* (minimalis brutal, retro-modern, dark-luxury, dll.), dan *constraints*. Jangan mendesain secara abu-abu; jadikan aplikasi memiliki karakter spesifik yang tidak terlupakan (unforgettable).
2. **Typography Beyond Defaults:** Jangan pernah menggunakan font generik atau system fonts (Arial, Roboto, Inter) jika desain membutuhkan identitas visual. Pilih font *display* yang berkarakter dan pasangkan dengan font *body* yang elegan.
3. **Motion that Creates Delight:** Eksploitasi fitur CSS atau *library* seperti `framer-motion` / `motion`. Fokus pada *high-impact moments* (misal: *staggered reveals* dengan delay saat page load) daripada ribuan *micro-interaction* acak.
4. **Spatial Composition & Grids:** Ciptakan layout asimetris, ruang negatif yang lega (whitespace), tumpang tindih elemen (overlap), atau alur diagonal. Berhentilah mengandalkan pola grid atau komponen standar yang membosankan.
5. **Atmosphere Backgrounds & Visual Depth:** Jangan gunakan warna solid datar, melainkan buat atmosfer UI melalui tekstur *noise*, *grain overlays*, gradient meshes, *layered transparencies*, atau bayangan dramatis (shadows). 
6. **No "Cookie-Cutter" Templates:** Setiap request dari pengguna wajib dieksekusi dengan *creative details* unik yang sesuai konteks. Selalu variasikan tema antara kreasi, hidari tampilan yang terasa persis dengan template *framework* bawaan.

---

## 🚀 ATURAN EMAS 6: UI/UX Pro Max Intelligence Skill
Sistem telah dilengkapi dengan kapabilitas desain UI/UX tingkat tinggi dari `nextlevelbuilder/ui-ux-pro-max-skill` yang terinstall di `.agent/skills/ui-ux-pro-max`. Agen AI diwajibkan untuk mengadopsi standar praktis berikut saat membangun/merevisi komponen visual:

1. **Penggunaan Database Desain Secara Mandiri (`data/*.csv`):**
   - Sebelum memulai desain halaman baru (Landing, SaaS Dashboard, E-Commerce, dll), AI **DIWAJIBKAN** merujuk pada standar dan pola yang telah disepakati dari folder skill, atau memformulasikan estetikanya berdasarkan "Product Category" (misal: "SaaS", "E-commerce Luxury").

2. **Pre-Delivery Checklist Khusus UI/UX (Pro Max Rules):**
   - **Icons Visual:** Dilarang keras menggunakan Emojis sebagai UI Icons. Hanya gunakan SVG (Heroicons/Lucide).
   - **Stable Hover:** Properti `hover` harus mengubah warna, opacity, border, atau box-shadow *tanpa* menggeser tata letak (layout shift).
   - **Smooth Interaction:** Selalu sediakan `cursor-pointer` di elemen interaktif, dan hindari perubahan instan; gunakan komposer transisi seperti `transition-all duration-300`.
   - **Kontras Light/Dark Mode Kuat:** Hindari teks yang terlalu redup (`#94A3B8` di slate-400 pada light mode sangat tidak diizinkan; minimal text-slate-600 untuk mute text). Jangan pakai batas bingkai putih transparan (`border-white/10`) untuk latar belakang putih cerah.
   - **Responsive & Spacing:** Seluruh layout navigasi yang mengambang (`fixed`) harus memberikan ruang di sekitarnya dan bukan tertempel mati, serta konten di bawahnya tidak boleh bersembunyi.
   
3. **Misi Penghilang "AI Slop":**
   - Hasil akhir harus memisahkan standar desain $10K (memiliki "taste", tipografi tegas) dibandingkan boilerplate murahan (seperti gradien ungu AI default yang berulang).


