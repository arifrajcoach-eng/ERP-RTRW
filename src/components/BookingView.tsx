import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Building2, Check, X, Printer, ShieldCheck } from 'lucide-react';

export function BookingView({ currentUser, showNotification, handleFirestoreError, settings, bookingsData }: any) {
  const [namaFasilitas, setNamaFasilitas] = useState('Aula RW');
  const [tanggal, setTanggal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter bookings for regular users to only show their own, unless they are pengurus
  const isAtLeastPengurus = ['ADMIN', 'SUPER_ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser?.role);
  
  const myBookings = isAtLeastPengurus 
    ? bookingsData 
    : bookingsData.filter((b: any) => b.userId === (currentUser.uid || currentUser.id_user));

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid || currentUser.id_user
      });
      showNotification(`Booking berhasil ${newStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}!`, 'success');
    } catch (e) {
      handleFirestoreError(e, 'update', `bookings/${bookingId}`);
    }
  };

  const handlePrintBooking = (b: any) => {
    const kop = settings?.KOP_SURAT || {};
    const tenantName = settings?.nama_rt || settings?.namaLayout || `RUKUN TETANGGA ${currentUser.rt || kop.rt || '...'} / RUKUN WARGA ${currentUser.rw || kop.rw || '...'}`;
    const tagline = settings?.tagline || kop.tagline || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${tenantName} - ${tagline} - Bukti Peminjaman Fasilitas - ${b.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { margin: 1.5cm; }
              body { background: white; }
            }
          </style>
        </head>
        <body class="p-8 font-sans">
          <div class="max-w-2xl mx-auto border p-10 rounded-xl bg-white shadow-sm">
            <div class="flex items-center border-b-2 border-black pb-4 mb-6">
               ${kop.logo_url ? `<img src="${kop.logo_url}" class="w-16 h-16 object-contain mr-4" />` : ''}
               <div class="flex-1 text-center">
                 <h1 class="text-xl font-bold uppercase">${tenantName}</h1>
                 <p class="text-xs font-bold uppercase text-slate-500 italic">${tagline}</p>
                 <p class="text-sm font-bold uppercase mt-1">Kelurahan ${kop.kelurahan || '...'} - Kecamatan ${kop.kecamatan || '...'}</p>
                 <p class="text-[10px] mt-1 italic">${kop.alamat || ''}</p>
               </div>
            </div>

            <div class="text-center mb-8">
              <h2 class="text-lg font-bold underline uppercase">SURAT IZIN PEMAKAIAN FASILITAS / INVENTARIS</h2>
              <p class="text-xs font-mono mt-1">Nomor Booking: ${b.id}</p>
            </div>

            <p class="mb-6 leading-relaxed">
              Diterangkan bahwa permohonan peminjaman fasilitas/inventaris berikut telah <strong>DISETUJUI</strong> oleh Pengurus:
            </p>

            <div class="space-y-4 text-sm leading-relaxed mb-10">
              <div class="grid grid-cols-[180px_10px_1fr] gap-2">
                <span class="font-bold">Fasilitas / Barang</span><span>:</span><span>${b.namaFasilitas}</span>
                <span class="font-bold">Tanggal Pemakaian</span><span>:</span><span>${new Date(b.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                <span class="font-bold">Nama Peminjam</span><span>:</span><span>${b.namaWarga}</span>
                <span class="font-bold">Keperluan</span><span>:</span><span>${b.keperluan}</span>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 leading-relaxed italic mb-10">
              Catatan: Mohon menjaga kebersihan dan kelestarian fasilitas/barang yang dipinjam. Kerusakan yang diakibatkan oleh kelalaian pemakaian menjadi tanggung jawab peminjam.
            </div>
            
            <div class="flex justify-between items-start mt-12">
               <div class="text-center w-48">
                 <p class="mb-20 text-xs">Peminjam / Pemohon,</p>
                 <p class="font-bold underline text-sm">( ${b.namaWarga} )</p>
               </div>
               <div class="text-center w-64">
                 <p class="mb-2 text-xs">Mengesahkan,</p>
                 <p class="mb-16 text-xs">Ketua RT/RW, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                 <p class="font-bold underline text-sm">( _________________________ )</p>
                 <p class="text-[10px] uppercase tracking-widest mt-1">Stempel & TTD Basah</p>
               </div>
            </div>

            <div class="mt-8 text-center text-xs font-semibold text-slate-600 italic block border-t pt-4">
              "Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."
            </div>
            
            <div class="mt-8 text-[8px] text-slate-400 text-center border-t pt-4">
              Dokumen ini dicetak otomatis melalui Layanan SmaRtRw dan sah secara hukum sebagai izin internal pemakaian fasilitas warga.
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.tenantId) {
      showNotification('Gagal melakukan booking: Tenant ID tidak ditemukan. Hubungi pihak pengurus.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (!currentUser) {
        showNotification('Sesi anda telah berakhir. Silakan login kembali.', 'error');
        return;
      }

      await addDoc(collection(db, 'bookings'), {
        tenantId: currentUser.tenantId,
        userId: currentUser.uid || currentUser.id_user || 'anonymous',
        namaWarga: currentUser.name || currentUser.nama || 'Warga',
        namaFasilitas,
        tanggal,
        keperluan,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      showNotification('Booking berhasil dikirim!', 'success');
      setTanggal('');
      setKeperluan('');
    } catch (e) {
      handleFirestoreError(e, 'create', 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors"></div>
        
        <div className="flex items-center gap-5 mb-10">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover:rotate-6">
              <Building2 className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-2xl font-bold italic text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none" style={{ fontFamily: 'Outfit' }}>Reservasi Fasilitas</h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 opacity-80 italic">Peminjaman Gedung & Inventaris Lingkungan</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Pilih Objek / Lokasi</label>
              <div className="relative group/sel">
                <select 
                  value={namaFasilitas} 
                  onChange={(e) => setNamaFasilitas(e.target.value)}
                  className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl font-black text-sm text-slate-800 dark:text-slate-200 outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option>Aula Utama RW</option>
                  <option>Lapangan Serbaguna</option>
                  <option>Tenda & Panggung</option>
                  <option>Kursi Tamu (PCS/Set)</option>
                  <option>Sistem Suara (Audio)</option>
                  <option>Proyektor & Layar</option>
                  <option>Ambulans Warga</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 border-r-3 border-b-3 border-slate-300 rotate-45 pointer-events-none transition-colors group-hover/sel:border-emerald-500"></div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Tanggal Pemakaian</label>
              <div className="relative">
                <input 
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl font-black text-sm text-slate-800 dark:text-slate-200 outline-none transition-all uppercase tracking-widest cursor-pointer"
                  required
                />
                <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Tujuan Peminjaman</label>
            <textarea 
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Jelaskan jenis acara dan estimasi durasi penggunaan..."
              className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-3xl font-medium text-sm text-slate-700 dark:text-slate-300 outline-none transition-all placeholder:text-slate-300 italic min-h-[120px]"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 group/btn"
          >
            <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>AJUKAN RESERVASI SEKARANG</span>
          </button>
        </form>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-5 px-6 border-l-8 border-emerald-500">
           <div>
              <h3 className="text-2xl font-bold italic text-slate-800 dark:text-slate-100 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>Status Peminjaman</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{myBookings.length} Reservasi Terdaftar</p>
           </div>
        </div>
        
        {myBookings.length === 0 && (
          <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6 opacity-50" />
            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest font-elegant">Agenda Kosong</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Nampaknya belum ada yang mereservasi fasilitas pada periode ini.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          {myBookings.map((b: any, idx: number) => (
              <motion.div 
                key={b.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group/card relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-3 h-full bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.3)]"></div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                       <div className="px-6 py-2 bg-slate-900 dark:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                         {b.namaFasilitas}
                       </div>
                       <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                            {new Date(b.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-xl font-bold text-slate-800 dark:text-slate-100 italic tracking-tight leading-relaxed">
                         "{b.keperluan}"
                       </p>
                       <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-xs font-elegant shadow-lg">
                             {b.namaWarga?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{b.namaWarga}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{new Date(b.createdAt).toLocaleString('id-ID')}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 items-end shrink-0">
                    <div className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      b.status === 'APPROVED' || b.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      b.status === 'REJECTED' || b.status === 'Ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {b.status === 'APPROVED' || b.status === 'Disetujui' ? <CheckCircle2 className="w-4 h-4 fill-emerald-100" /> : <AlertCircle className="w-4 h-4" />}
                      {b.status}
                    </div>

                    <div className="flex gap-3">
                      {(b.status === 'APPROVED' || b.status === 'Disetujui') && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handlePrintBooking(b); }}
                           className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 hover:border-emerald-600/30 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-sm hover:shadow-xl active:scale-95"
                           title="Cetak Surat Izin"
                         >
                           <Printer className="w-5 h-5" />
                           Cetak Izin
                         </button>
                      )}

                      {isAtLeastPengurus && b.status === 'PENDING' && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                            className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Tolak Peminjaman"
                          >
                            <X className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(b.id, 'APPROVED')}
                            className="p-4 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-90"
                            title="Setujui Peminjaman"
                          >
                            <Check className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
      </div>
    </div>
  );
}
