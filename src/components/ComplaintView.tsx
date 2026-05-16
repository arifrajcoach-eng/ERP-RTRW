import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Check, X, Printer } from 'lucide-react';

export function ComplaintView({ currentUser, showNotification, handleFirestoreError, settings, complaintsData }: any) {
  const [jenisKeluhan, setJenisKeluhan] = useState('Kebersihan');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter complaints for regular users to only show their own, unless they are pengurus
  const isAtLeastPengurus = ['ADMIN', 'SUPER_ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser?.role);
  
  const complaints = isAtLeastPengurus 
    ? complaintsData 
    : complaintsData.filter((c: any) => c.userId === currentUser.uid || c.userId === currentUser.id_user);

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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Bukti Tindak Lanjut Keluhan - ${c.id}</title>
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
                 <h1 class="text-xl font-bold uppercase">RUKUN TETANGGA ${currentUser.rt || kop.rt || '...'} / RUKUN WARGA ${currentUser.rw || kop.rw || '...'}</h1>
                 <p class="text-sm font-bold uppercase">Kelurahan ${kop.kelurahan || '...'} - Kecamatan ${kop.kecamatan || '...'}</p>
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
            
            <div class="mt-12 text-[8px] text-slate-400 text-center border-t pt-4">
              Dokumen ini dicetak secara digital melalui Sistem SmartRW dan sah sebagai bukti administrasi internal.
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
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        tenantId: currentUser.tenantId || 'RW26_SMART',
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Lapor Keluhan
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kategori Keluhan</label>
              <select 
                value={jenisKeluhan} 
                onChange={(e) => setJenisKeluhan(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Kebersihan</option>
                <option>Keamanan</option>
                <option>Fasilitas</option>
                <option>Penerangan Jalan</option>
                <option>Saluran Air</option>
                <option>Lainnya</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Detail Keluhan</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsikan keluhan Anda secara detail agar dapat segera ditindaklanjuti..."
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#0cbb97] text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest hover:opacity-90 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]">
            {isSubmitting ? 'Mengirim...' : 'Kirim Keluhan'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">Riwayat Keluhan</h3>
        <div className="space-y-4">
          {complaints.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada riwayat keluhan</p>
            </div>
          )}
          {complaints.map((c) => (
            <div key={c.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all hover:shadow-md border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{c.jenisKeluhan}</span>
                  <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  c.status === 'DONE' || c.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                  c.status === 'PROCESS' || c.status === 'Diproses' ? 'bg-orange-100 text-orange-700' :
                  c.status === 'REJECTED' || c.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {c.status === 'DONE' || c.status === 'Selesai' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {c.status}
                </div>
                {(c.status === 'DONE' || c.status === 'Selesai') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrintComplaint(c); }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 shadow-sm"
                    title="Cetak Bukti Tindak Lanjut"
                  >
                    <Printer className="w-3 h-3" />
                    Cetak
                  </button>
                )}
              </div>
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{c.deskripsi}</p>
                  {c.resolutionNote && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                       <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1 mb-1">
                         <CheckCircle2 className="w-3 h-3" />
                         Tindak Lanjut Pengurus:
                       </p>
                       <p className="text-xs text-emerald-800 italic font-medium">"{c.resolutionNote}"</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                    Laporan: {c.namaWarga} • {new Date(c.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {isAtLeastPengurus && (
                  <div className="flex gap-2 ml-4">
                    {c.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-red-100"
                          title="Tolak"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(c.id, 'PROCESS')}
                          className="px-3 py-2 bg-[#0cbb97] text-white rounded-lg hover:opacity-90 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm"
                          title="Setujui"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                      </>
                    )}
                    {(c.status === 'PROCESS' || c.status === 'Diproses') && (
                      <button 
                        onClick={() => handleUpdateStatus(c.id, 'DONE')}
                        className="px-4 py-2 bg-[#008bb5] text-white rounded-lg hover:opacity-90 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md shadow-blue-100"
                        title="Selesaikan"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Selesaikan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
