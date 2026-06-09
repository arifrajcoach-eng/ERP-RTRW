import React, { useState } from 'react';
import { BookOpen, Shield, Users, Mail, DollarSign, Store, Activity, AlertTriangle, MessageSquare, Info, Star, AlertOctagon, Lightbulb, Palette, FileText, Printer, CheckCircle2, Heart, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PanduanAdminView() {
  const [activeTab, setActiveTab] = useState<'fitur' | 'action' | 'peringatan' | 'sosialisasi'>('fitur');
  const [isPrinting, setIsPrinting] = useState(false);

  const tabs = [
    { id: 'fitur', label: 'Fitur Aplikasi', icon: Info, color: 'from-blue-500 to-indigo-600', activeBg: 'bg-indigo-600' },
    { id: 'sosialisasi', label: 'Bahan Sosialisasi', icon: FileText, color: 'from-violet-500 to-purple-600', activeBg: 'bg-purple-600' },
    { id: 'action', label: 'Action Plan', icon: Star, color: 'from-emerald-500 to-teal-600', activeBg: 'bg-emerald-600' },
    { id: 'peringatan', label: 'Peringatan Penting', icon: AlertOctagon, color: 'from-rose-500 to-red-600', activeBg: 'bg-rose-600' },
  ];

  const handlePrint = async () => {
    if (isPrinting) return;

    // We keep window.print() as a background-friendly option, 
    // but we'll primarily use jsPDF + html2canvas for a direct file download
    // which is more reliable in AI Studio's sandboxed iframe environment.
    
    const elementId = activeTab === 'sosialisasi' ? 'print-sosialisasi-content' : `active-tab-content-${activeTab}`;
    const element = document.getElementById(elementId);
    
    if (!element) {
      window.print();
      return;
    }

    try {
      setIsPrinting(true);
      
      // Capture the element with high resolution
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Robust sanitization for modern color functions (oklch, oklab) which crash html2canvas parser
          const sanitizeCSS = (css: string) => {
            if (!css) return '';
            // More robust replacement for oklch and oklab.
            // Matching any balanced parentheses content after the function name to be safe.
            return css
              .replace(/oklch\([^)]+(\/[^)]+)?\)/gi, '#475569')
              .replace(/oklab\([^)]+(\/[^)]+)?\)/gi, '#475569');
          };

          // 1. Sanitize all style tags
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            try {
              if (styleTags[i].innerHTML) {
                styleTags[i].innerHTML = sanitizeCSS(styleTags[i].innerHTML);
              }
              if (styleTags[i].textContent) {
                styleTags[i].textContent = sanitizeCSS(styleTags[i].textContent);
              }
            } catch (e) {
              console.warn('Failed to sanitize style tag:', e);
            }
          }

          // 2. Sanitize inline styles on all elements
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
              el.setAttribute('style', sanitizeCSS(styleAttr));
            }
          });

          // 3. Force visibility for specific print-only elements
          const hiddenPrintElements = clonedDoc.querySelectorAll('.hidden.print\\:block');
          hiddenPrintElements.forEach((el) => {
            (el as HTMLElement).style.setProperty('display', 'block', 'important');
            (el as HTMLElement).style.setProperty('visibility', 'visible', 'important');
            (el as HTMLElement).style.setProperty('opacity', '1', 'important');
          });

          // 4. Inject a normalization print stylesheet
          const normalizationStyle = clonedDoc.createElement('style');
          normalizationStyle.innerHTML = `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { background: white !important; }
            .shadow-sm, .shadow-md, .shadow-xl, .shadow-2xl { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          `;
          clonedDoc.head.appendChild(normalizationStyle);
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const imgWidth = 210; 
      const pageHeight = 297; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `SmartRW_Admin_${activeTab}.pdf`;
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF Export Error:', error);
      // Fallback to window.print() if canvas capture fails
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto print:m-0 print:p-0 print:max-w-none">
      {/* Global Print Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          /* Hide non-print elements */
          .print\:hidden { display: none !important; }
          
          /* Force sections to start on new pages if needed */
          .print\:break-before-page {
            break-before: page;
          }
          
          /* Remove shadows and borders that look bad in PDF */
          .shadow-sm, .shadow-md, .shadow-xl, .shadow-2xl {
            box-shadow: none !important;
          }
          
          /* High contrast for text */
          .text-slate-500, .text-slate-600 {
            color: #475569 !important;
          }
          
          /* Prevent items from being cut in half */
          .bg-white.p-6 {
            break-inside: avoid;
            margin-bottom: 20px;
          }
        }
      `}} />

      {/* Global Document Header for Print Only */}
      <div className="hidden print:block mb-8 border-b-4 border-slate-900 pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Digital Governance Guide</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">SmartRW AI Management System • Official Documentation</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-900 uppercase">Document Ref: ADM-GUIDE-2024</p>
            <p className="text-[10px] text-slate-400">Generated: {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 text-center print:hidden relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-4 bg-indigo-600 text-white rounded-2xl mb-6 shadow-xl shadow-indigo-200"
          >
            <BookOpen className="h-10 w-10" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Pusat Panduan <span className="text-indigo-600">&</span> Bantuan Admin
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Petunjuk operasional, langkah strategis, dan protokol keamanan eksklusif untuk Pengurus Wilayah.
          </p>
        </div>
      </div>

      {/* Modern Unified Navigation Suite */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 print:hidden">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: idx * 0.08,
                type: 'spring',
                stiffness: 120,
                damping: 20
              }}
              whileHover={{ 
                y: -12, 
                scale: 1.05,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden group border-2 ${
                isActive 
                  ? `border-transparent shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)] text-white` 
                  : 'bg-white/80 backdrop-blur-md border-slate-100 text-slate-500 hover:border-indigo-200/50 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabBg"
                  className={`absolute inset-0 bg-gradient-to-br ${tab.color}`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay" />
                </motion.div>
              )}
              
              <div className="relative z-10 flex flex-col items-center space-y-4">
                <motion.div 
                  className={`p-4 rounded-2xl transition-all duration-500 ${
                    isActive ? 'bg-white/20 shadow-lg shadow-black/10 backdrop-blur-md' : 'bg-slate-50 group-hover:bg-indigo-50 shadow-sm'
                  }`}
                  animate={isActive ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon className={`h-8 w-8 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                </motion.div>
                
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] md:text-sm font-black uppercase tracking-[0.25em] text-center leading-tight transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-slate-900'
                  }`}>
                    {tab.label.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-center mt-1 opacity-60 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}>
                    {tab.label.split(' ').slice(1).join(' ')}
                  </span>
                </div>
              </div>

              {isActive && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0.2 }}
                  className="absolute -right-10 -bottom-10 bg-white rounded-full w-40 h-40 blur-3xl"
                />
              )}
            </motion.button>
          );
        })}

        {/* Unified Print Action Card */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ 
            y: -12, 
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          disabled={isPrinting}
          className={`relative flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] bg-slate-900 border-2 border-slate-800 text-white shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)] transition-all duration-500 overflow-hidden group ${isPrinting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-2xl bg-white/10 group-hover:bg-indigo-500 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all duration-500 ${isPrinting ? 'animate-pulse' : ''}`}>
              {isPrinting ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <Printer className="h-8 w-8 group-hover:rotate-12 transition-transform" />
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] md:text-sm font-black uppercase tracking-[0.25em] text-center leading-tight">
                {isPrinting ? 'Cetak' : 'Cetak'}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-center mt-1 opacity-60">
                {isPrinting ? 'Dokumen...' : 'Dokumen PDF'}
              </span>
            </div>
          </div>
          
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-15 transition-opacity">
            <Palette className="w-24 h-24 rotate-12" />
          </div>
        </motion.button>
      </div>

      {/* Content Area */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`active-tab-content-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'fitur' && (
              <div className="space-y-6 print:space-y-8">
                <div className="hidden print:block mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Daftar Fitur Utama Aplikasi</h2>
                  <p className="text-slate-500 text-sm">Berikut adalah modul fungsional yang tersedia untuk membantu operasional wilayah.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
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
                <div 
                  id="print-sosialisasi-content"
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden print:border-none print:shadow-none"
                  style={{ minHeight: '800px' }}
                >
                  <div className="p-6 md:p-8 space-y-12 text-slate-800 print:p-0">
                    <section className="space-y-6">
                      <div className="border-l-4 border-slate-900 pl-4">
                        <h4 className="font-black uppercase tracking-tight text-2xl text-slate-900">Kenapa kita harus pakai aplikasi SmartRW AI?</h4>
                        <p className="text-slate-500 mt-2 text-sm">Poin-poin ini dirancang berdasarkan fitur nyata yang ada di dalam aplikasi:</p>
                      </div>
                      
                      <p className="text-lg font-medium text-slate-700 italic border-l-2 border-slate-200 pl-4 py-2 bg-slate-50/50 rounded-r-xl">
                        "Kita pindah ke digital bukan sekadar gaya-gayaan, tapi untuk menyelesaikan masalah klasik di lingkungan kita:"
                      </p>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-2 flex items-center">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-2 text-[10px]">1</span>
                            Transparansi
                          </h5>
                          <p className="text-sm text-slate-600 leading-relaxed pl-8">
                            Tidak ada lagi kecurigaan "uang iuran lari ke mana?". Semua tercatat sistem, warga bisa cek riwayat bayarnya sendiri kapan saja.
                          </p>
                        </div>

                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-2 flex items-center">
                            <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mr-2 text-[10px]">2</span>
                            Keamanan 24/7 (Fitur SOS)
                          </h5>
                          <p className="text-sm text-slate-600 leading-relaxed pl-8">
                            Saat ada keadaan darurat (sakit, maling, kebakaran), warga tidak perlu bingung cari nomor telepon pengurus. Cukup satu klik tombol SOS, semua pengurus dan warga sekitar yang aktif akan mendapat notifikasi instan.
                          </p>
                        </div>

                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-2 flex items-center">
                            <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-2 text-[10px]">3</span>
                            Administrasi Tanpa Ribet
                          </h5>
                          <p className="text-sm text-slate-600 leading-relaxed pl-8">
                            Urus surat pengantar atau lapor warga baru tidak perlu lagi cari-cari pengurus ke rumahnya. Semua bisa diajukan lewat HP, pengurus tinggal klik "Approve".
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-8">
                      <h4 className="font-black uppercase tracking-tight text-2xl text-slate-900 border-b-2 border-slate-100 pb-4">Apa manfaatnya bagi kita semua?</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Warga */}
                        <div className="space-y-4">
                          <div className="bg-blue-600 text-white p-3 rounded-xl inline-block font-black uppercase tracking-widest text-[10px]">Bagi Warga</div>
                          <ul className="space-y-3">
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Self-Service:</strong> Bisa update data profil sendiri, cek saldo iuran, dan akses layanan surat tanpa harus menunggu jam kerja pengurus.</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Ekonomi Lokal (Lapak):</strong> Bisa jualan produk UMKM atau jasa di fitur "Lapak" yang hanya bisa diakses oleh tetangga sendiri (pasar yang terpercaya).</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Suara Didengar:</strong> Ikut voting atau pemilihan ketua RT/RW secara digital, cepat, dan rahasia.</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Mading Digital:</strong> Aktifitas terdokumentasi dengan baik.</p>
                            </li>
                          </ul>
                        </div>

                        {/* Pengurus RT */}
                        <div className="space-y-4">
                          <div className="bg-emerald-600 text-white p-3 rounded-xl inline-block font-black uppercase tracking-widest text-[10px]">Bagi Pengurus RT</div>
                          <ul className="space-y-3">
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Data Rapi & Digital:</strong> Tidak ada lagi tumpukan buku atau file Excel yang rawan hilang. Data warga tersentralisasi dan aman.</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Monitoring Kolektif Iuran:</strong> Sistem otomatis menghitung siapa yang sudah bayar dan siapa yang menunggak. Penagihan jadi lebih objektif (berdasarkan sistem).</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Manajemen Darurat:</strong> Respon cepat terhadap laporan SOS warga di wilayahnya.</p>
                            </li>
                          </ul>
                        </div>

                        {/* Pengurus RW */}
                        <div className="space-y-4">
                          <div className="bg-rose-600 text-white p-3 rounded-xl inline-block font-black uppercase tracking-widest text-[10px]">Bagi Pengurus RW</div>
                          <ul className="space-y-3">
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Dashboard Wilayah:</strong> RW punya pandangan luas (helikopter view) terhadap kondisi seluruh RT di bawahnya (Prinsip Parent-Child).</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Audit Terpusat:</strong> Memastikan standar keamanan dan administrasi berjalan sama di setiap RT.</p>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600"><strong>Sinkronisasi Inventaris:</strong> Memantau aset atau fasilitas bersama di tingkat lingkungan secara lebih efisien.</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h4 className="font-black uppercase tracking-tight text-2xl text-slate-900">Hal apa yang menyatukan aktivitas kita di aplikasi ini?</h4>
                      <p className="text-slate-500 text-sm italic">Aplikasi ini bukan sekadar alat hitung, tapi Jembatan Interaksi Warga:</p>
                      
                      <div className="space-y-6">
                        <div className="flex gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-900/10">
                          <Heart className="w-8 h-8 text-rose-400 shrink-0" />
                          <div>
                            <h6 className="font-black text-sm uppercase tracking-[0.2em] mb-2">Gotong Royong Digital</h6>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              Melalui fitur SOS, kita kembali menghidupkan semangat saling menjaga. Saat satu warga kesulitan, teknologi ini menyatukan kita untuk membantu dengan cepat.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <Zap className="w-8 h-8 text-blue-500 shrink-0" />
                          <div>
                            <h6 className="font-black text-sm uppercase tracking-[0.2em] mb-2 text-slate-900">Satu Pintu Aktivitas</h6>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              Dari urusan bayar sampah, belanja di tetangga (Lapak), sampai urus administrasi, semuanya dilakukan di satu "rumah digital" yang sama. Ini membuat kita lebih sering berinteraksi meskipun secara virtual.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <Users className="w-8 h-8 text-emerald-500 shrink-0" />
                          <div>
                            <h6 className="font-black text-sm uppercase tracking-[0.2em] mb-2 text-slate-900">Inklusi Digital</h6>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              Dengan SmartRW AI, kita memastikan tidak ada warga yang tertinggal informasi. Pengumuman penting sampai ke tangan setiap warga secara bersamaan, menciptakan rasa setara dan adil di lingkungan.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-900 text-amber-100 p-8 rounded-3xl text-center space-y-4">
                        <h5 className="font-black text-amber-400 uppercase tracking-[0.3em] text-[10px]">Slogan Sosialisasi</h5>
                        <blockquote className="text-3xl font-black tracking-tight leading-none overflow-visible">
                          "Dari Warga, Oleh Warga, Untuk Lingkungan yang Pintar."
                        </blockquote>
                        <p className="text-sm text-amber-200/80 max-w-lg mx-auto">
                          Bahwa aplikasi ini adalah milik bersama untuk meningkatkan kualitas hidup kita di lingkungan RT/RW ini.
                        </p>
                      </div>
                    </section>

                    <section className="print:break-before-page pt-10 space-y-8">
                      <div className="space-y-2">
                        <h4 className="font-black uppercase tracking-tight text-2xl text-slate-900">Catatan Penting: Value Proposition</h4>
                        <p className="text-slate-500 text-sm">Poin mendasar tadi, ada beberapa aspek nilai tambah (Value Proposition) yang sangat krusial saat sosialisasi:</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-400 transition-colors">
                          <h6 className="font-black text-slate-900 mb-3 text-sm">1. Transparansi Finansial Real-Time (Tanpa Tunggu Laporan Bulanan)</h6>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "Dengan aplikasi ini, setiap Rupiah iuran yang masuk tercatat otomatis. Warga bisa melihat progres saldo kas lingkungan kapan saja. Ini membangun kepercayaan (trust) yang luar biasa antara warga dan pengurus."
                          </p>
                        </div>

                        <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-400 transition-colors">
                          <h6 className="font-black text-slate-900 mb-3 text-sm">2. Digitalisasi "Surat-Menyurat" dalam Genggaman</h6>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "Warga bisa mengajukan permohonan surat (Sket Domisili, Pengantar, dll) langsung secara digital. Pengurus tinggal melakukan approve lewat HP. Surat jadi lebih cepat, terdokumentasi rapi, dan mengurangi penggunaan kertas."
                          </p>
                        </div>

                        <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-400 transition-colors">
                          <h6 className="font-black text-slate-900 mb-3 text-sm">3. Membangun Ekosistem Ekonomi Lokal (Lapak Warga)</h6>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "Fitur Belanja/Toko di dalam aplikasi bukan sekadar pajangan. Ini adalah wadah untuk warga saling melariskan dagangan tetangga. Uang berputar di dalam lingkungan kita sendiri, memperkuat ekonomi komunitas."
                          </p>
                        </div>

                        <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-400 transition-colors">
                          <h6 className="font-black text-slate-900 mb-3 text-sm">4. Validitas dan Keamanan Data Warga</h6>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "Data kependudukan (NIK, KK) tersimpan di enkripsi standar keamanan industri. Memudahkan pengurus saat ada bantuan sosial atau pendataan mendadak dari Kelurahan karena data selalu up-to-date dan valid."
                          </p>
                        </div>

                        <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-400 transition-colors">
                          <h6 className="font-black text-slate-900 mb-3 text-sm">5. Jejak Digital Lingkungan (Digital Legacy)</h6>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "Aplikasi ini menjadi 'otak' bagi wilayah kita. Semua riwayat kegiatan, pembangunan, dan kebijakan terekam permanen. Siapapun yang menjadi pengurus berikutnya tidak perlu mulai dari nol karena semua datanya sudah ada di sistem."
                          </p>
                        </div>

                        <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-400 transition-colors">
                          <h6 className="font-black text-slate-900 mb-3 text-sm">6. Notifikasi Cerdas & Pengingat Otomatis</h6>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "Sistem akan memberikan pengingat lembut (friendly reminders) ke HP warga. Pengurus tidak perlu merasa tidak enak hati untuk menagih secara manual, karena sistem yang melakukannya secara profesional."
                          </p>
                        </div>
                      </div>
                    </section>

                    <div className="bg-slate-200 p-8 rounded-[40px] text-center border-2 border-dashed border-slate-300">
                      <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-slate-500 mb-4">Saran Strategi Sosialisasi:</h4>
                      <p className="text-xl font-black text-slate-900 leading-relaxed">
                        Saat berbicara dengan warga, gunakan istilah <span className="text-blue-600 underline">"Modernisasi Lingkungan"</span> atau <span className="text-blue-600 underline">"Kampung Digital"</span>.
                      </p>
                      <p className="text-sm text-slate-600 mt-4 max-w-md mx-auto">
                        Tekankan bahwa aplikasi ini bukan untuk menambah beban, tapi untuk menyederhanakan kesulitan yang selama ini kita anggap biasa.
                      </p>
                    </div>
                  </div>
                  
                  {/* Print Footer */}
                  <div className="hidden print:block mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">SmaRtRw AI • Digitalized for Harmony</p>
                    <p className="text-[8px] text-slate-400 mt-1">Dicetak oleh Admin Wilayah - SmartRW AI Management System</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'action' && (
              <div className="bg-white border text-emerald-800 border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 print:border-slate-900 print:mb-8">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 print:hidden">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 print:text-2xl print:font-black print:uppercase">Action Plan Implementasi</h3>
                    <p className="text-sm text-slate-500 mt-1 print:text-slate-700">Langkah praktis mengajak warga menggunakan aplikasi</p>
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
              <div className="bg-white border border-rose-200 p-6 md:p-8 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-rose-100 print:border-slate-900 print:mb-8">
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600 print:hidden">
                    <AlertOctagon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 print:text-2xl print:font-black print:uppercase">Peringatan Penting & Keamanan</h3>
                    <p className="text-sm text-slate-500 mt-1 print:text-slate-700">Hal yang harus dihindari demi keamanan sistem dan data warga</p>
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
