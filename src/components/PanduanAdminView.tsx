import React, { useState } from 'react';
import { BookOpen, Shield, Users, Mail, DollarSign, Store, Activity, AlertTriangle, MessageSquare, Info, Star, AlertOctagon, Lightbulb, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PanduanAdminView() {
  const [activeTab, setActiveTab] = useState<'fitur' | 'action' | 'peringatan'>('fitur');

  const tabs = [
    { id: 'fitur', label: 'Fitur Aplikasi', icon: Info },
    { id: 'action', label: 'Action Plan', icon: Star },
    { id: 'peringatan', label: 'Peringatan Penting', icon: AlertOctagon },
  ];

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
