import React, { useState } from 'react';
import { BookOpen, Shield, Users, Mail, DollarSign, Store, Activity, AlertTriangle, MessageSquare, Info, Star, AlertOctagon, Lightbulb, Palette, FileText, Printer, CheckCircle2, Heart, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PanduanAdminView() {
  const [activeTab, setActiveTab] = useState<'fitur' | 'action' | 'peringatan' | 'sosialisasi'>('fitur');

  const tabs = [
    { id: 'fitur', label: 'Fitur Aplikasi', icon: Info },
    { id: 'sosialisasi', label: 'Bahan Sosialisasi', icon: FileText },
    { id: 'action', label: 'Action Plan', icon: Star },
    { id: 'peringatan', label: 'Peringatan Penting', icon: AlertOctagon },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl mb-4 text-blue-600">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Pusat Panduan & Bantuan Admin
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Selamat datang di Pusat Panduan SmaRtRw AI. Di sini Anda dapat menemukan petunjuk operasional, langkah strategis, serta panduan keamanan untuk menggunakan aplikasi sebagai Pengurus.
        </p>
      </div>

      {/* Tabs Container */}
      <div className="flex overflow-x-auto no-scrollbar bg-white p-1 rounded-xl shadow-sm border border-slate-200">
        <div className="flex space-x-1 min-w-max w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'fitur' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section: Warga & Kependudukan */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Kependudukan</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Menambahkan Warga Baru:</strong> Buka "Data Warga", klik "+ Warga Baru", isi formulir data diri.</li>
                      <li><strong>2. Verifikasi Warga Registrasi:</strong> Periksa warga di "Verifikasi Warga", bandingkan dokumen, lalu Terima/Tolak.</li>
                      <li><strong>3. Buku Tamu/Satpam:</strong> Catat pengunjung masuk/keluar di "Buku Tamu".</li>
                    </ul>
                  </div>

                  {/* Section: Keuangan & Iuran */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Keuangan & Kas</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Mencatat Transaksi:</strong> Buka "Uang Kas", catat "Pemasukan" atau "Pengeluaran".</li>
                      <li><strong>2. Memantau Iuran:</strong> Kelola iuran bulanan, verifikasi bukti transfer pembayaran dari warga.</li>
                      <li><strong>3. Transparansi:</strong> Catatan kas otomatis tampil di Dashboard warga.</li>
                    </ul>
                  </div>

                  {/* Section: Surat & Administrasi */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Mail className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Administrasi Surat</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Permintaan Surat:</strong> Pantau pengajuan di "Surat & Dokumen" {">"} tab "Permintaan".</li>
                      <li><strong>2. Setujui & Cetak:</strong> Ubah status jadi "Selesai" dan surat bisa dicetak format PDF.</li>
                      <li><strong>3. Custom Kop Surat:</strong> Edit logo/detail Kop di menu "Kop Surat".</li>
                    </ul>
                  </div>

                  {/* Section: Wirausaha & Lapak */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-rose-50 rounded-lg">
                        <Store className="h-5 w-5 text-rose-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">E-Lapak & Wirausaha</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Katalog Toko:</strong> Tambahkan produk di "E-Lapak UMKM" untuk dijual ke tetangga.</li>
                      <li><strong>2. Order & Pesanan:</strong> Pantau pesanan dan ubah status jadi "Diproses" atau "Selesai".</li>
                    </ul>
                  </div>

                  {/* Section: Kesehatan & Posyandu */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-pink-50 rounded-lg">
                        <Activity className="h-5 w-5 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Kesehatan (Posyandu)</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Data Pasien:</strong> Pencatatan biodata balita, ibu hamil, dan lansia.</li>
                      <li><strong>2. Rekam Medis:</strong> Pantau grafik berat/tinggi badan balita dan tensi darah lansia.</li>
                      <li><strong>3. Jadwal Layanan:</strong> Publikasikan jadwal imunisasi rutin.</li>
                    </ul>
                  </div>

                  {/* Section: Bank Sampah */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Shield className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Bank Sampah</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Setor Sampah:</strong> Tabungan warga dari penimbangan sampah daur ulang.</li>
                      <li><strong>2. Saldo Tabungan:</strong> Setiap warga memiliki saldo bank sampah yang dapat ditarik.</li>
                      <li><strong>3. Harga Komoditas:</strong> Atur harga per kilo untuk kardus, plastik, botol, dll.</li>
                    </ul>
                  </div>

                  {/* Section: Booking Fasum & Inventaris */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Booking Fasum & Inventaris</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Pinjam Fasilitas:</strong> Warga dapat membooking lapangan atau balai pertemuan.</li>
                      <li><strong>2. Peminjaman Alat:</strong> Manajemen dan pendataan peminjaman aset inventaris (tenda, kursi, dll).</li>
                      <li><strong>3. Jadwal Otomatis:</strong> Mencegah bentrok jadwal antar warga.</li>
                    </ul>
                  </div>

                  {/* Section: Komunikasi & Pengaduan */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Pengaduan Warga</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Merespon Laporan:</strong> Laporan infrastruktur warga masuk ke menu "Pengaduan".</li>
                      <li><strong>2. Update Status:</strong> Berikan tanggapan progress penyelesaian keluhan.</li>
                      <li><strong>3. Tombol SOS:</strong> Warga bisa menekan SOS yang memicu notifikasi ke layar Admin.</li>
                    </ul>
                  </div>

                  {/* Section: Fitur Cerdas (AI) */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">AI Asisten (Chaty)</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Asisten Ketua:</strong> Chaty bisa beri insight (contoh: "Siapa warga yang belum lunas iuran?").</li>
                      <li><strong>2. Edukasi Warga:</strong> Chaty bisa menjawab cara penggunaan fitur aplikasi untuk warga.</li>
                    </ul>
                  </div>

                  {/* Section: Tema & Tampilan */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <Palette className="h-5 w-5 text-slate-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Kustomisasi & Tema</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li><strong>1. Ganti Skin/Tema:</strong> Aplikasi memiliki berbagai pilihan tema (Glassmorphism, Dark Luxury, Corporate, dll).</li>
                      <li><strong>2. Logo & Tagline:</strong> Unggah logo instansi dan tentukan tagline khusus wilayah Anda pada menu pengaturan.</li>
                      <li><strong>3. Branding Personal:</strong> Sesuaikan nama wilayah dan warna aksen agar aplikasi terasa lebih personal dan eksklusif.</li>
                      <li><strong>4. Responsif:</strong> Tampilan otomatis menyesuaikan saat dibuka melalui Laptop, Tablet, maupun HP.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-blue-800">Tips Bagi Pengurus Baru</h3>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed ml-8">
                    Mulailah dengan (1) melengkapi <strong>Data Wilayah/Organisasi</strong>, (2) mencatat <strong>Data Warga/KK</strong>, dan (3) membimbing warga menginstall aplikasi. Selamat bertugas menjadi pengurus yang modern! 🚀
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'sosialisasi' && (
              <div className="space-y-6 print:m-0 print:p-0">
                {/* Print Header - Only visible when printing */}
                <div className="hidden print:block text-center border-b-2 border-slate-900 pb-6 mb-8">
                  <h1 className="text-3xl font-black uppercase tracking-tight">Materi Sosialisasi Aplikasi SmaRtRw AI</h1>
                  <p className="text-slate-600 mt-2">Dukungan Teknologi untuk Lingkungan yang Lebih Modern & Transparan</p>
                </div>

                <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden print:border-none print:shadow-none">
                  {/* Action Button for UI */}
                  <div className="absolute top-6 right-6 print:hidden">
                    <button 
                      onClick={handlePrint}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak / Simpan PDF</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 print:mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600 print:hidden">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Materi Edukasi Warga</h3>
                      <p className="text-sm text-slate-500 mt-1">Gunakan poin-poin ini saat melakukan rapat warga atau pesan grup</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Q1: Kenapa Pakai Aplikasi Ini? */}
                    <section>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">1</div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">Kenapa Pakai SmaRtRw AI?</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10 print:ml-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h5 className="font-bold text-slate-800 mb-2 flex items-center"><Zap className="w-4 h-4 mr-2 text-amber-500" /> Digitalisasi Tanpa Ribet</h5>
                          <p className="text-sm text-slate-600">Mengubah sistem manual yang lambat menjadi sistem digital yang cepat dan bisa diakses kapan saja dari genggaman.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h5 className="font-bold text-slate-800 mb-2 flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-blue-500" /> Keamanan Data</h5>
                          <p className="text-sm text-slate-600">Arsip warga tidak lagi berupa tumpukan kertas yang mudah rusak/hilang, tapi tersimpan aman di sistem cloud terenkripsi.</p>
                        </div>
                      </div>
                    </section>

                    {/* Q2: Benefit Section */}
                    <section>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">2</div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">Manfaat Bagi Semua Pihak</h4>
                      </div>
                      <div className="space-y-4 ml-10 print:ml-4">
                        {/* Warga */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <h5 className="font-black text-blue-900 text-sm uppercase tracking-widest mb-3 flex items-center">
                            <Heart className="w-4 h-4 mr-2 fill-blue-500 text-blue-500" /> Bagi Warga
                          </h5>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-blue-800">
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Monitor Iuran & Saldo secara Real-time.</li>
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Urus Surat Pengantar dari HP tanpa harus ke rumah Pengurus.</li>
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Tombol SOS untuk kondisi darurat lingkungan.</li>
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Info kegiatan & Transparansi Keuangan Wilayah.</li>
                          </ul>
                        </div>
                        {/* RT/RW */}
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                          <h5 className="font-black text-emerald-900 text-sm uppercase tracking-widest mb-3 flex items-center">
                            <Shield className="w-4 h-4 mr-2 fill-emerald-500 text-emerald-500" /> Bagi Pengurus (RT & RW)
                          </h5>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-emerald-800">
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Otomatisasi Laporan Keuangan (RT) & Konsolidasi (RW).</li>
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Database warga yang rapi, akurat, dan mudah dicari.</li>
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Verifikasi mandiri bukti bayar iuran warga.</li>
                            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> Koordinasi cepat antar RT melalui dashboard RW.</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Q3: Unifying Features */}
                    <section>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">3</div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">Ekosistem yang Menyatukan Kita</h4>
                      </div>
                      <div className="ml-10 print:ml-4 bg-slate-900 p-6 rounded-2xl text-white">
                        <p className="text-sm text-slate-300 mb-6">Aplikasi ini bukan sekadar alat administrasi, tapi wadah interaksi sosial:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <Store className="w-8 h-8 mx-auto mb-3 text-rose-400" />
                            <h6 className="font-bold text-xs uppercase mb-1">E-Lapak UMKM</h6>
                            <p className="text-[10px] text-slate-400">Jual-Beli antar tetangga untuk perkuat ekonomi warga.</p>
                          </div>
                          <div className="text-center">
                            <Activity className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                            <h6 className="font-bold text-xs uppercase mb-1">Bank Sampah & Posyandu</h6>
                            <p className="text-[10px] text-slate-400">Menjaga lingkungan & kesehatan bersama secara terukur.</p>
                          </div>
                          <div className="text-center">
                            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-sky-400" />
                            <h6 className="font-bold text-xs uppercase mb-1">Aspirasi & Pengaduan</h6>
                            <p className="text-[10px] text-slate-400">Suara warga didengar dan ditindaklanjuti secara sistematis.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Bonus: Additional Points */}
                    <section className="print:break-before-page print:mt-20">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">4</div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">Standar Masa Depan</h4>
                      </div>
                      <div className="ml-10 print:ml-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-slate-200 rounded-xl">
                          <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Transparansi Mutlak</h6>
                          <p className="text-xs text-slate-600 leading-relaxed">Setiap rupiah yang masuk dan keluar dapat diaudit langsung oleh warga lewat grafik yang jujur.</p>
                        </div>
                        <div className="p-4 border border-slate-200 rounded-xl">
                          <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Keadilan Layanan</h6>
                          <p className="text-xs text-slate-600 leading-relaxed">Sistem antrian surat dan verifikasi iuran menjamin semua warga mendapat hak layanan yang sama cepatnya.</p>
                        </div>
                        <div className="p-4 border border-slate-200 rounded-xl">
                          <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Akses Inklusif</h6>
                          <p className="text-xs text-slate-600 leading-relaxed">Bisa diakses dari browser mana pun tanpa harus download aplikasi berat, hemat memori HP warga.</p>
                        </div>
                      </div>
                    </section>
                  </div>
                  
                  {/* Print Footer */}
                  <div className="hidden print:block mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">SmaRtRw AI • Digitalized for Harmony</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'action' && (
              <div className="bg-white border text-emerald-800 border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Action Plan Implementasi</h3>
                    <p className="text-sm text-slate-500 mt-1">Langkah praktis mengajak warga menggunakan aplikasi</p>
                  </div>
                </div>
                
                <ol className="relative border-l-2 border-emerald-100 ml-4 md:ml-6 space-y-8">
                  <li className="pl-8 relative">
                    <span className="absolute -left-[17px] bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">1</span>
                    <h4 className="font-bold text-slate-800 mb-1">Memasukkan Data Warga & Sosialisasi</h4>
                    <p className="text-sm text-slate-600">Mulailah dengan memasukkan data KK & NIK warga ke dalam menu "Data Warga", lalu sebarkan link aplikasi atau panduan install kepada warga melalui grup WhatsApp lingkungan.</p>
                  </li>
                  <li className="pl-8 relative">
                    <span className="absolute -left-[17px] bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">2</span>
                    <h4 className="font-bold text-slate-800 mb-1">Warga Inisiasi Pendaftaran</h4>
                    <p className="text-sm text-slate-600">Arahkan warga untuk melakukan pendaftaran akun baru menggunakan NIK & No. KK mereka melalui link aplikasi.</p>
                  </li>
                  <li className="pl-8 relative">
                    <span className="absolute -left-[17px] bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">3</span>
                    <h4 className="font-bold text-slate-800 mb-1">Admin Melakukan Verifikasi</h4>
                    <p className="text-sm text-slate-600">Pendaftaran warga akan masuk ke menu "Verifikasi Warga". Segera verifikasi agar akun mereka aktif.</p>
                  </li>
                  <li className="pl-8 relative">
                    <span className="absolute -left-[17px] bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">4</span>
                    <h4 className="font-bold text-slate-800 mb-1">Aplikasi Siap Digunakan</h4>
                    <p className="text-sm text-slate-600">Warga bisa login pakai NIK & KK. Agar lebih mudah, mereka juga bisa <strong>Masuk dengan Google</strong> jika email Google warga sudah terdata.</p>
                  </li>
                  <li className="pl-8 relative">
                    <span className="absolute -left-[17px] bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">5</span>
                    <h4 className="font-bold text-slate-800 mb-1">Uji Coba Fitur (First Action)</h4>
                    <p className="text-sm text-slate-600">Arahkan warga untuk melakukan aktivitas pertama mereka, seperti mengecek tagihan iuran lewat dashboard, membuat surat pengantar, atau menyapa <em>Chaty AI</em>.</p>
                  </li>
                  <li className="pl-8 relative">
                    <span className="absolute -left-[17px] bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">6</span>
                    <h4 className="font-bold text-slate-800 mb-1">Pendampingan Khusus</h4>
                    <p className="text-sm text-slate-600">Kenalkan <em>Tombol Darurat (SOS)</em>. Mintalah beberapa warga (Kader/Pemuda) yang melek teknologi untuk mendampingi warga lansia menggunakan aplikasi.</p>
                  </li>
                </ol>
              </div>
            )}

            {activeTab === 'peringatan' && (
              <div className="bg-white border border-rose-200 p-6 md:p-8 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-rose-100">
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                    <AlertOctagon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Hal yang Harus Dihindari</h3>
                    <p className="text-sm text-slate-500 mt-1">Demi keamanan dan kelancaran sistem bersama</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:border-rose-200 transition-colors">
                    <h4 className="font-bold text-rose-900 mb-1 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>Jangan Mengosongkan Kolom Data Penting</h4>
                    <p className="text-sm text-rose-800/80 ml-3.5">Pastikan isian form esensial (seperti NIK, No. KK, Email, Nomor WhatsApp) terisi lengkap saat mendata warga. Data yang kosong bisa menghambat verifikasi atau memicu <em>error</em> sistem.</p>
                  </div>
                  
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:border-rose-200 transition-colors">
                    <h4 className="font-bold text-rose-900 mb-1 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>Jangan Sembarangan Mengubah Hak Akses</h4>
                    <p className="text-sm text-rose-800/80 ml-3.5">Berhati-hatilah saat memberikan peran "Admin", "Bendahara", dll. Hanya berikan ke pengurus resmi untuk menghindari penyalahgunaan privasi data warga.</p>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:border-rose-200 transition-colors">
                    <h4 className="font-bold text-rose-900 mb-1 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>Jangan Menghapus Riwayat Secara Paksa</h4>
                    <p className="text-sm text-rose-800/80 ml-3.5">Jangan hapus riwayat kas, iuran, atau surat masuk, kecuali jika ganda (spam). Riwayat lama esensial untuk audit transparansi wilayah.</p>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:border-rose-200 transition-colors">
                    <h4 className="font-bold text-rose-900 mb-1 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>Jangan Membagikan Akun Anda</h4>
                    <p className="text-sm text-rose-800/80 ml-3.5">Sistem mencatat identitas log pengguna untuk setiap perubahan. Jangan gunakan akun bersama karena dapat mengacaukan jejak audit (siapa yang berbuat apa, di jam berapa).</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
