import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Check, X, Printer, RefreshCw } from 'lucide-react';

export function ComplaintView({ currentUser, showNotification, handleFirestoreError, settings, complaintsData }: any) {
  const [jenisKeluhan, setJenisKeluhan] = useState('Kebersihan');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter complaints for regular users to only show their own, unless they are pengurus
  const isAtLeastPengurus = ['ADMIN', 'SUPER_ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser?.role);
  
  const complaints = isAtLeastPengurus 
    ? (complaintsData || [])
    : (complaintsData || []).filter((c: any) => c.userId === currentUser.uid || c.userId === currentUser.id_user);

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    try {
      let resolutionNote = '';
      if (newStatus === 'DONE') {
        resolutionNote = window.prompt('Masukkan Catatan Tindak Lanjut (Opsional):') || 'Keluhan telah ditindaklanjuti dan diselesaikan.';
      }

      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, {
        status: newStatus,
        resolutionNote: resolutionNote,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid || currentUser.id_user
      });
      
      let msg = `Keluhan status berhasil diperbarui!`;
      if (newStatus === 'PROCESS') msg = 'Keluhan sedang diproses.';
      if (newStatus === 'DONE') msg = 'Keluhan dinyatakan selesai.';
      if (newStatus === 'REJECTED') msg = 'Keluhan ditolak.';
      
      showNotification(msg, 'success');
    } catch (e) {
      handleFirestoreError(e, 'update', `complaints/${complaintId}`);
    }
  };

  const handlePrintComplaint = (c: any) => {
    const kop = settings?.KOP_SURAT || {};
    const tenantName = settings?.nama_rt || settings?.namaLayout || `RUKUN TETANGGA ${currentUser.rt || kop.rt || '...'} / RUKUN WARGA ${currentUser.rw || kop.rw || '...'}`;
    const tagline = settings?.tagline || kop.tagline || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${tenantName} - ${tagline} - Bukti Tindak Lanjut Keluhan - ${c.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { margin: 1cm; }
              body { background: white; }
            }
          </style>
        </head>
        <body class="p-8 font-sans">
          <div class="max-w-2xl mx-auto border p-8 rounded-xl bg-white shadow-sm">
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
              <h2 class="text-lg font-bold underline uppercase">BUKTI TINDAK LANJUT KELUHAN</h2>
              <p class="text-xs font-mono mt-1">Ref ID: ${c.id}</p>
            </div>

            <div class="space-y-4 text-sm leading-relaxed">
              <div class="grid grid-cols-[150px_10px_1fr] gap-2">
                <span class="font-bold">Tanggal Laporan</span><span>:</span><span>${new Date(c.createdAt).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                <span class="font-bold">Pelapor</span><span>:</span><span>${c.namaWarga}</span>
                <span class="font-bold">Kategori</span><span>:</span><span>${c.jenisKeluhan}</span>
              </div>

              <div class="mt-6 border-t border-slate-100 pt-4">
                <p class="font-bold mb-1">Isi Keluhan:</p>
                <div class="bg-slate-50 p-4 rounded-lg italic text-slate-700">"${c.deskripsi}"</div>
              </div>

              <div class="mt-6 border-t border-slate-100 pt-4">
                <p class="font-bold mb-1 ml-1">Hasil Tindak Lanjut:</p>
                <div class="flex flex-col gap-2 bg-green-50 p-4 rounded-lg">
                   <div class="flex items-center gap-2 text-green-700 font-bold">
                     <span class="px-2 py-1 bg-green-600 text-white rounded text-[10px] uppercase">SELESAI</span>
                     <span>Telah Selesai Ditangani</span>
                   </div>
                   <p class="text-xs text-green-800 italic mt-1 font-medium">"${c.resolutionNote || 'Keluhan telah ditindaklanjuti dan diselesaikan.'}"</p>
                </div>
              </div>
              
              <div class="mt-10 flex justify-end">
                <div class="text-center w-64">
                  <p class="mb-16">Sekretariat RT/RW, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                  <p class="font-bold underline">( _________________________ )</p>
                  <p class="text-[10px] uppercase tracking-widest mt-1">Petugas Administrasi</p>
                </div>
              </div>
            </div>

            <div class="mt-8 text-center text-xs font-semibold text-slate-600 italic block border-t pt-4">
              "Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."
            </div>
            
            <div class="mt-8 text-[8px] text-slate-400 text-center border-t pt-4">
              Dokumen ini dicetak secara digital melalui Sistem SmaRtRw dan sah sebagai bukti administrasi internal.
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
      showNotification('Gagal mengirim keluhan: Tenant ID tidak ditemukan. Hubungi pihak pengurus.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        tenantId: currentUser.tenantId,
        userId: currentUser.uid || 'anonymous',
        namaWarga: currentUser.name || currentUser.nama || 'Warga',
        jenisKeluhan,
        deskripsi,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      showNotification('Keluhan berhasil dikirim!', 'success');
      setDeskripsi('');
    } catch (e) {
      handleFirestoreError(e, 'create', 'complaints');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
        
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <MessageSquare className="w-7 h-7" />
           </div>
           <div>
              <h2 className="text-2xl font-outfit font-bold italic text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none">LAPOR PAK</h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 opacity-70">Sampaikan aspirasi demi kenyamanan bersama</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Kategori Laporan</label>
              <div className="relative group/sel">
                <select 
                  value={jenisKeluhan} 
                  onChange={(e) => setJenisKeluhan(e.target.value)}
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option>Kebersihan</option>
                  <option>Keamanan</option>
                  <option>Fasilitas umum</option>
                  <option>Penerangan Jalan</option>
                  <option>Saluran Air</option>
                  <option>Ketertiban</option>
                  <option>Lainnya</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45 pointer-events-none transition-colors group-hover/sel:border-brand-blue"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Detail Kejadian / Keluhan</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan secara detail lokasi dan masalah yang terjadi agar segera kami tinjau..."
              className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white dark:focus:bg-slate-900 rounded-3xl font-medium text-sm text-slate-700 dark:text-slate-300 outline-none transition-all placeholder:text-slate-400 placeholder:italic min-h-[160px]"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-slate-900 dark:bg-brand-blue text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:shadow-[0_20px_40px_-5px_rgba(30,41,59,0.3)] dark:hover:shadow-brand-blue/20 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-4 group/btn overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Kirim Laporan Resmi</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 px-4 border-l-4 border-brand-blue">
          <h3 className="text-xl font-outfit font-bold italic text-slate-800 dark:text-slate-100 uppercase tracking-tight">Arsip Laporan</h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{complaints.length} Laporan Terdata</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {complaints.length === 0 && (
            <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6 opacity-50" />
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest font-elegant">Kotak Aspirasi Kosong</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Belum ada keluhan yang tercatat untuk saat ini.</p>
            </div>
          )}
          
          {complaints.map((c: any, i: number) => (
            <div 
              key={c.id} 
              className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-brand-blue/30 group/card relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-4 h-full bg-brand-blue/5 group-hover:bg-brand-blue/10 transition-colors"></div>
              
              <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="px-5 py-2 bg-slate-900 dark:bg-brand-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                      {c.jenisKeluhan}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      <Clock className="w-4 h-4 opacity-50" />
                      {new Date(c.createdAt).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    </div>
                  </div>

                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{c.deskripsi}"
                  </p>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-blue font-black text-xs uppercase font-elegant">
                          {c.namaWarga?.charAt(0) || 'W'}
                       </div>
                       <div>
                          <p className="text-[12px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{c.namaWarga}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID PELAPOR: {c.userId?.substring(0,8)}...</p>
                       </div>
                    </div>
                  </div>

                  {c.resolutionNote && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 relative overflow-hidden">
                       <div className="absolute top-0 right-0 bg-emerald-500 text-white p-2 rounded-bl-2xl">
                          <Check className="w-4 h-4" />
                       </div>
                       <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-3 mb-3">
                         <CheckCircle2 className="w-4 h-4" />
                         Tindak Lanjut Administrasi:
                       </p>
                       <p className="text-sm text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed italic">
                         "{c.resolutionNote}"
                       </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 min-w-[200px] items-end">
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border-2 ${
                    c.status === 'DONE' || c.status === 'Selesai' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-white/20 shadow-emerald-500/20' :
                    c.status === 'PROCESS' || c.status === 'Diproses' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-white/20 shadow-amber-500/20' :
                    c.status === 'REJECTED' || c.status === 'Ditolak' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-white/20 shadow-rose-500/20' :
                    'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
                  }`}>
                    {c.status === 'DONE' || c.status === 'Selesai' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{c.status}</span>
                  </div>

                  <div className="flex gap-2">
                    {(c.status === 'DONE' || c.status === 'Selesai') && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handlePrintComplaint(c); }}
                        className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-brand-blue hover:border-brand-blue/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3"
                      >
                        <Printer size={18} />
                        Cetak Payload
                      </motion.button>
                    )}

                    {isAtLeastPengurus && (
                      <div className="flex gap-3">
                        {c.status === 'PENDING' && (
                          <>
                            <motion.button 
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                              className="w-14 h-14 bg-rose-50 text-rose-600 rounded-[1.5rem] flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-xl shadow-rose-500/10"
                              title="Tolak Laporan"
                            >
                              <X className="w-6 h-6" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdateStatus(c.id, 'PROCESS')}
                              className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[1.5rem] flex items-center justify-center hover:shadow-2xl hover:shadow-emerald-500/30 transition-all border border-white/20 shadow-xl"
                              title="Terima & Proses"
                            >
                              <Check className="w-6 h-6" />
                            </motion.button>
                          </>
                        )}
                        {(c.status === 'PROCESS' || c.status === 'Diproses') && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(c.id, 'DONE')}
                            className="px-10 py-5 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-white/10 text-white rounded-[2rem] hover:from-black hover:to-slate-800 transition-all text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-slate-900/40"
                            title="Selesaikan Laporan"
                          >
                            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
                               <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            Selesaikan Laporan
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
