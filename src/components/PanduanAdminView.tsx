import React from 'react';
import { BookOpen, Shield, Users, Mail, DollarSign, Store, Activity, AlertTriangle, MessageSquare } from 'lucide-react';

export default function PanduanAdminView() {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">
            Pusat Panduan & Bantuan Admin
          </h2>
        </div>
        <p className="text-slate-600">
          Selamat datang di Pusat Panduan SmaRtRw AI. Di sini Anda dapat menemukan petunjuk operasional langkah demi langkah untuk menggunakan fitur-fitur yang ada di aplikasi ini sebagai Pengurus (Ketua RT/RW, Admin, Sekretaris, Bendahara, Kader, dll).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section: Warga & Kependudukan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">Kependudukan & Pendataan</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong>1. Menambahkan Warga Baru:</strong> Buka menu "Data Warga", klik tombol "+ Warga Baru", isi formulir data diri (NIK, Nama, Alamat, dll). Klik "Simpan".
            </li>
            <li>
              <strong>2. Verifikasi Warga Registrasi:</strong> Di menu "Verifikasi Warga", Anda bisa memeriksa warga yang mendaftar mandiri. Bandingkan KK/KTP yang di-upload, lalu klik tombol centang hijau untuk "Terima" atau ikon silang untuk "Tolak".
            </li>
            <li>
              <strong>3. Buku Tamu/Satpam:</strong> Catat pengunjung yang masuk/keluar di menu "Buku Tamu", sangat berguna untuk satpam / keamanan lingkungan mencatat plat nomor kendaraan.
            </li>
          </ul>
        </div>

        {/* Section: Keuangan & Iuran */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-800">Keuangan & Uang Kas</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong>1. Mencatat Uang Kas Masuk/Keluar:</strong> Buka menu "Uang Kas", klik "+ Transaksi Baru". Pilih kategori "Pemasukan" atau "Pengeluaran", masukkan nominal, tanggal, dan keterangan. 
            </li>
            <li>
              <strong>2. Memantau Iuran Warga:</strong> Fitur tagihan iuran digunakan untuk mengelola Iuran Bulanan Warga (IPL, Kebersihan, Keamanan). Admin bisa generate tagihan bulanan dan warga akan melihatnya di dashboard mereka. Warga bisa upload bukti transfer, dan Admin bisa "Verifikasi" bukti tersebut agar status iuran lunas.
            </li>
            <li>
              <strong>3. Laporan Keuangan Transparan:</strong> Semua catatan kas akan otomatis ditampilkan di Dashboard warga sehingga transparan. 
            </li>
          </ul>
        </div>

        {/* Section: Surat & Administrasi */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-800">Administrasi & Surat</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong>1. Mengelola Permintaan Surat:</strong> Jika warga mengajukan surat (Pengantar Domisili, dll) lewat Chaty AI atau menu Surat, statusnya masuk ke menu "Surat & Dokumen" {">"} tab "Permintaan".
            </li>
            <li>
              <strong>2. Menyetujui & Mencetak:</strong> Admin dapat melihat detail pengajuan. Jika sesuai, Admin bisa ganti status menjadi "Selesai" dan surat bisa dicetak ke dalam format PDF otomatis lengkap dengan kop surat RT/RW.
            </li>
            <li>
              <strong>3. Custom Kop Surat:</strong> Admin/RW dapat mengubah logo dan detail Kop di menu "Kop Surat".
            </li>
          </ul>
        </div>

        {/* Section: Wirausaha & Lapak */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <Store className="h-6 w-6 text-rose-600" />
            <h3 className="text-lg font-semibold text-slate-800">E-Lapak & Wirausaha</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong>1. Membuat Katalog Toko:</strong> Buka menu "E-Lapak UMKM", warga atau Admin dapat menambahkan produk-produk buatan warga (makanan, jasa, dll) agar bisa dipesan tetangga lain.
            </li>
            <li>
              <strong>2. Order & Pesanan:</strong> Jika ada yang pesan, penjual / Admin lapak bisa melihat pesanan di menu lapak dan mengubah status jadi "Diproses" hingga "Selesai".
            </li>
          </ul>
        </div>

        {/* Section: Komunikasi & Pengaduan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-slate-800">Pengaduan & Keamanan</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong>1. Merespon Laporan Warga:</strong> Laporan infrastruktur rusak atau masalah lingkungan masuk ke menu "Pengaduan". 
            </li>
            <li>
              <strong>2. Mengupdate Status:</strong> Admin dapat memberikan tanggapan (progress), dan merubah status (Diterima, Diproses, Selesai) sehingga warga pelapor dapat memantau pengerjaan keluhan mereka.
            </li>
            <li>
              <strong>3. Tombol SOS:</strong> Di menu pengguna, warga bisa menekan tombol Darurat (SOS) yang akan memicu notifikasi visual ke layar Admin/Satpam apabila sedang login.
            </li>
          </ul>
        </div>

        {/* Section: Fitur Cerdas (AI) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-800">AI Asisten (Chaty)</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong>1. Chaty untuk Admin (Asisten Ketua):</strong> Chaty dirancang memahami apakah yang chat adalah Warga atau Pengurus. Jika Anda pengurus, Chaty dapat memberikan Insight Singkat misal: "Siapa saja warga yang iurannya belum lunas?" atau "Berapa total kas saat ini?".
            </li>
            <li>
              <strong>2. Tugas Edukasi Warga:</strong> Chaty juga menjawab pertanyaan warga layaknya customer service lingkungan yang ramah (misal warga tanya: "Chaty, saya mau buat KTP gimana caranya?").
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mt-6">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Tips Bagi Pengurus Baru</h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          Jangan ragu untuk mengeksplorasi aplikasi ini. Untuk memulainya, hal pertama yang sebaiknya dilakukan adalah (1) melengkapi <strong>Data Wilayah/Organisasi</strong>, kemudian (2) mencatat <strong>Data Warga/KK</strong> Anda, dan (3) membimbing warga untuk menginstall/mengakses aplikasi agar bisa mulai memakai layanan administrasi (<strong>Surat Pengantar & Iuran</strong>). Selamat bertugas menjadi pengurus yang modern! 🚀
        </p>
      </div>

    </div>
  );
}
