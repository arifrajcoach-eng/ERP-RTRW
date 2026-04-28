import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Search, User, Eye, X, Check, XCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, writeBatch, getDoc } from 'firebase/firestore';

export default function VerifikasiAdminView({ 
  verifikasiData, wargaData, tenantId, setIsLoadingDB, 
  showNotification, handleFirestoreError, currentUser 
}: { 
  verifikasiData: any[], wargaData: any[], tenantId: string, 
  setIsLoadingDB: any, showNotification: any, handleFirestoreError: any, 
  currentUser: any 
}) {
  const [filter, setFilter] = useState<'All' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak'>('Menunggu Persetujuan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [catatan, setCatatan] = useState('');

  const filteredData = verifikasiData.filter(v => {
    const matchFilter = filter === 'All' || v.status === filter;
    const matchSearch = String(v.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(v.nik || '').includes(searchQuery);
    return matchFilter && matchSearch;
  });

  const handleApprove = async (item: any) => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      const vRef = doc(db, 'verifikasi_warga', item.id);
      batch.update(vRef, {
        status: 'Disetujui',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.displayName || currentUser.email,
        catatan: 'Disetujui oleh admin'
      });

      const wargaId = item.nik || item.id;
      const wargaRef = doc(db, 'data_warga', wargaId);
      const wargaSnap = await getDoc(wargaRef);

      const updatedData = {
        ...item,
        terverifikasi: true,
        updatedAt: new Date().toISOString(),
        tenantId
      };
      delete updatedData.id;
      delete updatedData.status;
      delete updatedData.submittedAt;

      if (wargaSnap.exists()) {
        batch.update(wargaRef, updatedData);
      } else {
        batch.set(wargaRef, updatedData, { merge: true });
      }

      await batch.commit();
      showNotification(`Data \${item.nama} telah disetujui.`, "success");
      setSelectedItem(null);
    } catch (err) {
      handleFirestoreError(err, 'update', 'verifikasi/approve');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
               <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            Verifikasi Data Mandiri
          </h1>
          <p className="text-xs font-medium text-slate-400">Tinjau dan setujui perbaikan data yang diajukan warga secara mandiri.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {['All', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak'].map((f: any) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${filter === f ? 'bg-white shadow-lg shadow-slate-200/50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f === 'Menunggu Persetujuan' ? 'Antrean' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-white/50 backdrop-blur-md">
           <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Cari NIK atau Nama warga..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                 <tr>
                    <th className="px-8 py-5">Info Warga</th>
                    <th className="px-8 py-5">NIK / Status</th>
                    <th className="px-8 py-5">Tgl Pengajuan</th>
                    <th className="px-8 py-5 text-right">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredData.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 opacity-20" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Antrean Kosong</p>
                        </div>
                     </td>
                   </tr>
                 ) : filteredData.map((item) => (
                   <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                               {item.ktpUrl ? <img src={item.ktpUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-200" />}
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-slate-900 leading-tight">{item.nama}</p>
                               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">{item.posisi || 'Warga'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-[11px] font-bold text-slate-500 font-mono">{item.nik}</p>
                         <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase border tracking-tighter mt-1 inline-block \${item.status === 'Disetujui' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                            {item.status}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button onClick={() => setSelectedItem(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl hover:bg-white hover:shadow-xl transition-all">
                            <Eye className="w-5 h-5" />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                   <div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">Tinjau Pengajuan: {selectedItem.nama}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-1">Lakukan validasi data fisik dengan data digital yang diajukan.</p>
                   </div>
                   <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-200/50 hover:bg-slate-200 rounded-2xl transition-all"><X className="w-6 h-6"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="aspect-[1.6/1] w-full bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                         {selectedItem.ktpUrl ? <img src={selectedItem.ktpUrl} alt="Foto KTP/Bukti" className="w-full h-full object-contain" /> : <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tidak ada foto bukti</div>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                         <div className="space-y-4">
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIK</p><p className="text-xs font-bold text-slate-800 font-mono tracking-wider">{selectedItem.nik}</p></div>
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Kawin</p><p className="text-xs font-bold text-slate-800">{selectedItem.kawin || '-'}</p></div>
                         </div>
                         <div className="space-y-4">
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat / Blok</p><p className="text-xs font-bold text-slate-800">{selectedItem.alamat || selectedItem.blok || '-'}</p></div>
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pekerjaan</p><p className="text-xs font-bold text-slate-800">{selectedItem.profesi || '-'}</p></div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="space-y-8 flex flex-col justify-between">
                      <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50">
                         <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Catatan Validasi</h5>
                         <textarea 
                           className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 text-sm font-medium text-slate-700 min-h-[150px] focus:ring-0 focus:border-blue-400"
                           placeholder="Tambahkan catatan jika diperlukan..."
                           value={catatan}
                           onChange={(e) => setCatatan(e.target.value)}
                         />
                      </div>
                      
                      <div className="flex gap-4">
                         <button onClick={() => handleApprove(selectedItem)} className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3">
                            <Check className="w-5 h-5" /> Setujui Data
                         </button>
                         <button onClick={() => {/* Reject logic */}} className="p-5 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 hover:bg-rose-100 transition-all">
                            <XCircle className="w-6 h-6" />
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
