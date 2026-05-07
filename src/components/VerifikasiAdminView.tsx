import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  User, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2, 
  X, 
  ShieldAlert
} from 'lucide-react';
import { doc, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

interface VerifikasiAdminViewProps {
  verifikasiData: any[];
  wargaData: any[];
  tenantId: string;
  isLoadingDB: boolean;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  currentUser: any;
}

export function VerifikasiAdminView({ 
  verifikasiData, 
  wargaData, 
  tenantId, 
  isLoadingDB, 
  setIsLoadingDB, 
  showNotification, 
  handleFirestoreError, 
  currentUser 
}: VerifikasiAdminViewProps) {
  const [filter, setFilter] = useState<'All' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak'>('Menunggu Persetujuan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [catatan, setCatatan] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      const latest = verifikasiData.find(v => v.id === selectedItem.id);
      if (latest && JSON.stringify(latest) !== JSON.stringify(selectedItem)) {
        setSelectedItem(latest);
      }
    }
  }, [verifikasiData, selectedItem]);

  const filteredData = useMemo(() => {
    const uniqueMap: Record<string, any> = {};
    
    verifikasiData.forEach(item => {
      const nik = item.nik || 'unknown';
      const existing = uniqueMap[nik];
      
      if (!existing) {
        uniqueMap[nik] = item;
      } else {
        const isNewer = (item.submittedAt || '') > (existing.submittedAt || '');
        const itemPrio = item.status === 'Menunggu Persetujuan' ? 2 : (!item.status || item.status === '-' ? 0 : 1);
        const existingPrio = existing.status === 'Menunggu Persetujuan' ? 2 : (!existing.status || existing.status === '-' ? 0 : 1);
        
        if (itemPrio > existingPrio || (itemPrio === existingPrio && isNewer)) {
          uniqueMap[nik] = item;
        }
      }
    });

    const dedupedData = Object.values(uniqueMap);

    return dedupedData.filter((v: any) => {
      const matchFilter = filter === 'All' || v.status === filter;
      const matchSearch = String(v.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(v.nik || '').includes(searchQuery);
      return matchFilter && matchSearch;
    });
  }, [verifikasiData, filter, searchQuery]);

  const handleApprove = async (item: any) => {
    if (actionLoading) return;
    if (!item.nik) {
      showNotification("NIK tidak valid. Data tidak bisa disetujui.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const batch = writeBatch(db);
      const docId = item.id;
      if (!docId) throw new Error("ID data verifikasi tidak ditemukan.");

      const vRef = doc(db, 'verifikasi_warga', docId);
      const approveNote = catatan.trim() || 'Disetujui oleh admin';
      batch.update(vRef, {
        status: 'Disetujui',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.name || currentUser.displayName || 'Admin',
        catatan: approveNote
      });

      const standardDocId = `${tenantId}_${item.nik}`;
      const targetRef = doc(db, 'data_warga', standardDocId);
      const targetSnap = await getDoc(targetRef);
      
      const legacyRef = doc(db, 'data_warga', item.nik);
      const legacySnap = (item.nik !== standardDocId) ? await getDoc(legacyRef) : null;
      const legacyData = legacySnap?.exists() ? legacySnap.data() : null;

      const updatedData = {
        nama: item.nama || targetSnap.data()?.nama || legacyData?.nama || "",
        kk: item.kk || targetSnap.data()?.kk || legacyData?.kk || "",
        blok: item.alamat || item.blok || targetSnap.data()?.blok || legacyData?.blok || "",
        hp: item.hp || targetSnap.data()?.hp || legacyData?.hp || "",
        profesi: item.pekerjaan || item.profesi || targetSnap.data()?.profesi || legacyData?.profesi || "",
        pendidikanTerakhir: item.pendidikan || item.pendidikanTerakhir || targetSnap.data()?.pendidikanTerakhir || legacyData?.pendidikanTerakhir || "",
        kawin: item.statusKawin || item.kawin || targetSnap.data()?.kawin || legacyData?.kawin || "",
        foto: item.ktpUrl || targetSnap.data()?.foto || legacyData?.foto || "",
        ktpUrl: item.ktpUrl || targetSnap.data()?.ktpUrl || legacyData?.ktpUrl || "",
        rt: item.rt || targetSnap.data()?.rt || legacyData?.rt || "01",
        rw: item.rw || targetSnap.data()?.rw || legacyData?.rw || "05",
        tempatLahir: item.tempatLahir || targetSnap.data()?.tempatLahir || legacyData?.tempatLahir || "",
        tglLahir: item.tglLahir || targetSnap.data()?.tglLahir || legacyData?.tglLahir || "",
        jk: item.jk || targetSnap.data()?.jk || legacyData?.jk || "",
        agama: item.agama || targetSnap.data()?.agama || legacyData?.agama || "Islam",
        posisi: item.posisi || targetSnap.data()?.posisi || legacyData?.posisi || "",
        kewarganegaraan: item.kewarganegaraan || targetSnap.data()?.kewarganegaraan || legacyData?.kewarganegaraan || "WNI",
        terverifikasi: true,
        keteranganVerifikasi: approveNote,
        updatedAt: new Date().toISOString()
      };

      batch.set(targetRef, {
        tenantId: tenantId,
        status: 'Warga Tetap',
        ...updatedData
      }, { merge: true });

      if (legacySnap?.exists() && standardDocId !== item.nik) {
        batch.delete(legacyRef);
      }

      await batch.commit();
      showNotification(`Data ${item.nama} telah disetujui.`, "success");
      setSelectedItem(null);
      setCatatan('');
    } catch (err) {
      console.error("Approve Error:", err);
      handleFirestoreError(err, 'update', 'verifikasi_warga');
      showNotification("Gagal memproses persetujuan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item: any) => {
    if (actionLoading) return;
    
    const isAlreadyApproved = item.status === 'Disetujui';
    const isModalOpen = selectedItem && selectedItem.id === item.id;
    let reason = isModalOpen ? catatan.trim() : "";
    
    if (!reason) {
      if (isModalOpen) {
        showNotification("Harap isi Catatan Verifikasi di atas untuk alasan penolakan.", "error");
        return;
      }
      
      const promptTitle = isAlreadyApproved 
        ? `ALASAN BATALKAN PERSETUJUAN (${item.nama}):` 
        : `ALASAN PENOLAKAN (${item.nama}):`;
      
      const promptReason = prompt(promptTitle, "");
      if (promptReason === null) return;
      if (promptReason.trim().length === 0) {
        showNotification("Alasan penolakan wajib diisi.", "error");
        return;
      }
      reason = promptReason.trim();
    }

    setActionLoading(true);
    try {
      const batch = writeBatch(db);
      const vRef = doc(db, 'verifikasi_warga', item.id);
      
      batch.update(vRef, {
        status: 'Ditolak',
        catatan: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser?.name || currentUser?.displayName || 'Admin'
      });

      if (isAlreadyApproved) {
        const citizenDocId = `${tenantId}_${item.nik}`;
        const wargaRef = doc(db, 'data_warga', citizenDocId);
        batch.update(wargaRef, {
          terverifikasi: false,
          keteranganVerifikasi: `Persetujuan dibatalkan: ${reason}`,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();
      showNotification(`Pengajuan ${item.nama} telah ditolak.`, "info");
      setSelectedItem(null);
      setCatatan('');
    } catch (err) {
      console.error("Reject Error:", err);
      handleFirestoreError(err, 'update', 'verifikasi_warga');
      showNotification("Gagal memproses penolakan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (actionLoading) return;
    if (!confirm("Hapus data verifikasi ini secara permanen?")) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'verifikasi_warga', itemId));
      showNotification("Data verifikasi berhasil dihapus permanen.", "success");
      if (selectedItem?.id === itemId) setSelectedItem(null);
    } catch (err) {
      handleFirestoreError(err, 'delete', 'verifikasi_warga');
    } finally {
      setActionLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Menunggu Persetujuan': 'bg-yellow-100 text-yellow-700',
    'Disetujui': 'bg-green-100 text-green-700',
    'Ditolak': 'bg-red-100 text-red-700'
  };

  const handleMassSync = async () => {
    const approvedNotSynced = verifikasiData.filter(v => v.status === 'Disetujui' && !v.isFinalized);
    if (approvedNotSynced.length === 0) {
      showNotification("Semua data terverifikasi sudah sinkron.", "info");
      return;
    }

    setIsLoadingDB(true);
    let successCount = 0;
    try {
      const batch = writeBatch(db);
      for (const item of approvedNotSynced) {
        const targetDocId = `${tenantId}_${item.nik}`;
        const wargaRef = doc(db, 'data_warga', targetDocId);
        const vRef = doc(db, 'verifikasi_warga', item.id);
        
        batch.set(wargaRef, {
          nama: item.nama || "",
          nik: item.nik,
          kk: item.kk || "",
          hp: item.hp || "",
          blok: item.blok || item.alamat || "",
          rt: item.rt || "01",
          rw: item.rw || "05",
          terverifikasi: true,
          tenantId: tenantId,
          lastSyncedAt: new Date().toISOString()
        }, { merge: true });

        batch.update(vRef, { isFinalized: true, finalizedAt: new Date().toISOString() });
        successCount++;
      }
      await batch.commit();
      showNotification(`Berhasil menyinkronkan ${successCount} data ke warga utama.`, "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'mass_sync');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 w-full">
        <div className="w-full">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
            Verifikasi Data Mandiri
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Kelola pengajuan perbaikan data dari warga secara mandiri.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleMassSync}
            disabled={!verifikasiData.some(v => v.status === 'Disetujui' && !v.isFinalized)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:grayscale whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sinkronkan
          </button>
          
          <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1 shrink-0" />
          
          <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {['All', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak'].map((f: any) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-orange-400 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden w-full">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari NIK atau Nama..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Warga</th>
                <th className="px-6 py-4">Agama</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Diajukan</th>
                <th className="px-6 py-4">Terakhir Oleh</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr key="empty-verifikasi">
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">Tidak ada pengajuan data.</td>
                </tr>
              ) : (
                filteredData.map((item: any, idx: number) => (
                  <tr key={`verif-row-${item.id || idx}-${idx}`} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {item.ktpUrl ? <img src={item.ktpUrl} alt="KTP" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.nama}</p>
                          <p className="text-[10px] font-medium text-slate-400">NIK: {item.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {item.agama || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">
                      {item.approvedBy || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(!item.isFinalized && (item.status === 'Menunggu Persetujuan' || item.status === 'Disetujui')) && (
                          <>
                            {item.status === 'Menunggu Persetujuan' && (
                              <button 
                                onClick={() => handleApprove(item)}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100 disabled:opacity-50"
                                title="Setujui"
                              >
                                {actionLoading ? <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                              </button>
                            )}
                            <button 
                              onClick={() => handleReject(item)}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                              title={item.status === 'Disetujui' ? 'Batalkan & Tolak' : 'Tolak'}
                            >
                              {actionLoading ? <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div> : <XCircle className="w-5 h-5" />}
                            </button>
                          </>
                        )}
                          <button 
                            onClick={() => {
                              setCatatan('');
                              setSelectedItem(item);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoading}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent disabled:opacity-50"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/40 "
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Detail Verifikasi: {selectedItem.nama}</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(selectedItem.id)}
                    disabled={actionLoading}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    title="Hapus Permanen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setSelectedItem(null); setCatatan(''); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Perubahan Data</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Nama Lengkap Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.nama}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">KK Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.kk}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Alamat / Blok Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.blok}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Agama Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.agama || 'Islam'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Jenis Kelamin</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.jk || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tempat Lahir</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.tempatLahir || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tanggal Lahir</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.tglLahir || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">HP Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.hp}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Pekerjaan</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.profesi}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Pendidikan</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.pendidikanTerakhir}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Status Kawin</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.kawin}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Posisi Keluarga</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.posisi}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Kewarganegaraan</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.kewarganegaraan}</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="text-[10px] text-slate-400 uppercase mb-2 block font-black">Catatan Verifikasi</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 h-24"
                        placeholder="Berikan alasan jika menolak..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => handleApprove(selectedItem)}
                        disabled={actionLoading || selectedItem.status === 'Disetujui'}
                        className="flex-1 bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Memproses...' : 'Setujui Data'}
                      </button>
                      <button 
                        onClick={() => handleReject(selectedItem)}
                        disabled={actionLoading || selectedItem.status === 'Ditolak' || selectedItem.isFinalized}
                        className="flex-1 bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Memproses...' : (selectedItem.status === 'Disetujui' ? 'Batalkan & Tolak' : 'Tolak')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Dokumen Pendukung</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase mb-2">Foto KTP / Profil</p>
                        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-56 flex items-center justify-center">
                          {selectedItem.ktpUrl ? (
                            <img src={selectedItem.ktpUrl} alt="KTP" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-[9px] text-slate-400 italic font-black">Tidak Ada File</p>
                            </div>
                          )}
                          {selectedItem.ktpUrl && (
                            <a href={selectedItem.ktpUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="text-white w-8 h-8" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase mb-2">Kartu Keluarga (KK)</p>
                        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-56 flex items-center justify-center">
                          {selectedItem.kkUrl ? (
                            <img src={selectedItem.kkUrl} alt="KK" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-[9px] text-slate-400 italic font-black">Tidak Ada File</p>
                            </div>
                          )}
                          {selectedItem.kkUrl && (
                            <a href={selectedItem.kkUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="text-white w-8 h-8" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
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
