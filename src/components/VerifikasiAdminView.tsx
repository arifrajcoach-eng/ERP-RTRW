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
  ShieldAlert,
  Clock
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
      
      // Use the tenantId from the item itself to ensure it stays in the correct RT/RW node
      const recordTenantId = item.tenantId || tenantId;

      batch.update(vRef, {
        status: 'Disetujui',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.name || currentUser.displayName || 'Admin',
        catatan: approveNote
      });

      const standardDocId = `${recordTenantId}_${item.nik}`;
      const targetRef = doc(db, 'data_warga', standardDocId);
      const targetSnap = await getDoc(targetRef);
      
      const legacyRef = doc(db, 'data_warga', item.nik);
      const legacySnap = (item.nik !== standardDocId) ? await getDoc(legacyRef) : null;
      const legacyData = legacySnap?.exists() ? legacySnap.data() : null;

      const updatedData = {
        nama: item.nama || targetSnap.data()?.nama || legacyData?.nama || "",
        email: item.email || targetSnap.data()?.email || legacyData?.email || "",
        kk: item.kk || targetSnap.data()?.kk || legacyData?.kk || "",
        blok: item.alamat || item.blok || targetSnap.data()?.blok || legacyData?.blok || "",
        hp: item.hp || targetSnap.data()?.hp || legacyData?.hp || "",
        profesi: item.pekerjaan || item.profesi || targetSnap.data()?.profesi || legacyData?.profesi || "",
        pendidikanTerakhir: item.pendidikan || item.pendidikanTerakhir || targetSnap.data()?.pendidikanTerakhir || legacyData?.pendidikanTerakhir || "",
        kawin: item.statusKawin || item.kawin || targetSnap.data()?.kawin || legacyData?.kawin || "",
        foto: item.ktpUrl || targetSnap.data()?.foto || legacyData?.foto || "",
        ktpUrl: item.ktpUrl || targetSnap.data()?.ktpUrl || legacyData?.ktpUrl || "",
        rt: item.rt || targetSnap.data()?.rt || legacyData?.rt || "01",
        rw: item.rw || targetSnap.data()?.rw || legacyData?.rw || "26",
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
        tenantId: recordTenantId,
        status: 'Warga Tetap',
        ...updatedData
      }, { merge: true });

      if (legacySnap?.exists() && standardDocId !== item.nik) {
        batch.delete(legacyRef);
      }

      // Sync verified status to user auth document immediately
      if (item.authUid) {
        const userRef = doc(db, 'users', item.authUid);
        batch.set(userRef, {
          terverifikasi: true,
          status: 'Disetujui',
          nik: item.nik || "",
          name: item.nama || "",
          linkedResidentId: standardDocId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
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
    let reason = catatan.trim() || "Ditolak oleh admin";
    
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
        const recordTenantId = item.tenantId || tenantId;
        const citizenDocId = `${recordTenantId}_${item.nik}`;
        const wargaRef = doc(db, 'data_warga', citizenDocId);
        batch.update(wargaRef, {
          terverifikasi: false,
          keteranganVerifikasi: `Persetujuan dibatalkan: ${reason}`,
          updatedAt: new Date().toISOString()
        });
      }

      // Sync rejection status to user auth document immediately
      if (item.authUid) {
        const userRef = doc(db, 'users', item.authUid);
        batch.set(userRef, {
          terverifikasi: false,
          status: 'Ditolak',
          updatedAt: new Date().toISOString()
        }, { merge: true });
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

  const statusColors: Record<string, string> = {
    'Menunggu Persetujuan': 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-transparent shadow-lg shadow-orange-500/20',
    'Disetujui': 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-transparent shadow-lg shadow-emerald-500/20',
    'Ditolak': 'bg-gradient-to-br from-rose-400 to-red-500 text-white border-transparent shadow-lg shadow-red-500/20'
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  const pendingCount = useMemo(() => {
    return filteredData.filter(v => v.status === 'Menunggu Persetujuan' && !v.isFinalized).length;
  }, [filteredData]);

  const handleApproveAllSelected = async () => {
    if (selectedIds.length === 0 || isBulkApproving) return;
    
    setIsBulkApproving(true);
    let successCount = 0;
    try {
      const CHUNK_SIZE = 450;
      for (let i = 0; i < selectedIds.length; i += CHUNK_SIZE) {
        const chunk = selectedIds.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        for (const id of chunk) {
          const item = filteredData.find(v => v.id === id);
          if (!item || item.status === 'Disetujui' || item.isFinalized) continue;
          
          const vRef = doc(db, 'verifikasi_warga', id);
          batch.update(vRef, {
            status: 'Disetujui',
            approvedAt: new Date().toISOString(),
            approvedBy: currentUser.name || currentUser.displayName || 'Admin',
            catatan: 'Disetujui secara masal'
          });
          
          const recordTenantId = item.tenantId || tenantId;
          const standardDocId = `${recordTenantId}_${item.nik}`;
          const targetRef = doc(db, 'data_warga', standardDocId);
          
          // Extensive fields mapping to ensure absolute consistency
          const updatedFields: any = {
            terverifikasi: true,
            updatedAt: new Date().toISOString(),
            nama: item.nama || "",
            nik: item.nik || "",
            rt: item.rt || "01",
            rw: item.rw || "26",
          };
          if (item.kk) updatedFields.kk = item.kk;
          if (item.email) updatedFields.email = item.email;
          if (item.hp) updatedFields.hp = item.hp;
          if (item.alamat || item.blok) updatedFields.blok = item.alamat || item.blok;
          if (item.pekerjaan || item.profesi) updatedFields.profesi = item.pekerjaan || item.profesi;
          if (item.pendidikan || item.pendidikanTerakhir) updatedFields.pendidikanTerakhir = item.pendidikan || item.pendidikanTerakhir;
          if (item.statusKawin || item.kawin) updatedFields.kawin = item.statusKawin || item.kawin;
          if (item.jk) updatedFields.jk = item.jk;
          if (item.agama) updatedFields.agama = item.agama;
          if (item.tempatLahir) updatedFields.tempatLahir = item.tempatLahir;
          if (item.tglLahir) updatedFields.tglLahir = item.tglLahir;
          if (item.posisi) updatedFields.posisi = item.posisi;
          if (item.kewarganegaraan) updatedFields.kewarganegaraan = item.kewarganegaraan;
          if (item.ktpUrl) {
            updatedFields.ktpUrl = item.ktpUrl;
            updatedFields.foto = item.ktpUrl;
          }

          batch.set(targetRef, {
            tenantId: recordTenantId,
            status: 'Warga Tetap',
            ...updatedFields
          }, { merge: true });

          // Sync verified status for bulk approval
          if (item.authUid) {
            const userRef = doc(db, 'users', item.authUid);
            batch.set(userRef, {
              terverifikasi: true,
              status: 'Disetujui',
              nik: item.nik || "",
              name: item.nama || "",
              linkedResidentId: standardDocId,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          
          successCount++;
        }
        await batch.commit();
      }
      showNotification(`${successCount} data berhasil disetujui secara masal.`, 'success');
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk Approve Error:", err);
      showNotification("Gagal memproses persetujuan masal.", "error");
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handleBulkApproveAllPending = async () => {
    const pendingItems = filteredData.filter(v => v.status === 'Menunggu Persetujuan' && !v.isFinalized);
    if (pendingItems.length === 0) {
      showNotification("Tidak ada data warga dengan status 'Menunggu Persetujuan' saat ini.", "info");
      return;
    }

    const confirmMsg = `Apakah Anda yakin ingin menyetujui seluruh ${pendingItems.length} data warga yang berstatus 'Menunggu Persetujuan' saat ini untuk menghemat waktu?`;
    if (!confirm(confirmMsg)) return;

    setIsBulkApproving(true);
    let successCount = 0;
    try {
      const CHUNK_SIZE = 450;
      const idsToApprove = pendingItems.map(v => v.id);
      
      for (let i = 0; i < idsToApprove.length; i += CHUNK_SIZE) {
        const chunk = idsToApprove.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        for (const id of chunk) {
          const item = pendingItems.find(v => v.id === id);
          if (!item) continue;
          
          const vRef = doc(db, 'verifikasi_warga', id);
          batch.update(vRef, {
            status: 'Disetujui',
            approvedAt: new Date().toISOString(),
            approvedBy: currentUser.name || currentUser.displayName || 'Admin',
            catatan: 'Disetujui secara masal'
          });
          
          const recordTenantId = item.tenantId || tenantId;
          const standardDocId = `${recordTenantId}_${item.nik}`;
          const targetRef = doc(db, 'data_warga', standardDocId);
          
          // Extensive fields mapping to ensure absolute consistency
          const updatedFields: any = {
            terverifikasi: true,
            updatedAt: new Date().toISOString(),
            nama: item.nama || "",
            nik: item.nik || "",
            rt: item.rt || "01",
            rw: item.rw || "26",
          };
          if (item.kk) updatedFields.kk = item.kk;
          if (item.email) updatedFields.email = item.email;
          if (item.hp) updatedFields.hp = item.hp;
          if (item.alamat || item.blok) updatedFields.blok = item.alamat || item.blok;
          if (item.pekerjaan || item.profesi) updatedFields.profesi = item.pekerjaan || item.profesi;
          if (item.pendidikan || item.pendidikanTerakhir) updatedFields.pendidikanTerakhir = item.pendidikan || item.pendidikanTerakhir;
          if (item.statusKawin || item.kawin) updatedFields.kawin = item.statusKawin || item.kawin;
          if (item.jk) updatedFields.jk = item.jk;
          if (item.agama) updatedFields.agama = item.agama;
          if (item.tempatLahir) updatedFields.tempatLahir = item.tempatLahir;
          if (item.tglLahir) updatedFields.tglLahir = item.tglLahir;
          if (item.posisi) updatedFields.posisi = item.posisi;
          if (item.kewarganegaraan) updatedFields.kewarganegaraan = item.kewarganegaraan;
          if (item.ktpUrl) {
            updatedFields.ktpUrl = item.ktpUrl;
            updatedFields.foto = item.ktpUrl;
          }

          batch.set(targetRef, {
            tenantId: recordTenantId,
            status: 'Warga Tetap',
            ...updatedFields
          }, { merge: true });

          // Sync verified status for bulk approval
          if (item.authUid) {
            const userRef = doc(db, 'users', item.authUid);
            batch.set(userRef, {
              terverifikasi: true,
              status: 'Disetujui',
              nik: item.nik || "",
              name: item.nama || "",
              linkedResidentId: standardDocId,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          
          successCount++;
        }
        await batch.commit();
      }
      showNotification(`${successCount} data berhasil disetujui secara masal.`, 'success');
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk Approve Error:", err);
      showNotification("Gagal memproses persetujuan masal.", "error");
    } finally {
      setIsBulkApproving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.filter(v => !v.isFinalized && v.status !== 'Disetujui').map(v => v.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
        const recordTenantId = item.tenantId || tenantId;
        const targetDocId = `${recordTenantId}_${item.nik}`;
        const wargaRef = doc(db, 'data_warga', targetDocId);
        const vRef = doc(db, 'verifikasi_warga', item.id);
        
        batch.set(wargaRef, {
          nama: item.nama || "",
          nik: item.nik,
          email: item.email || "",
          kk: item.kk || "",
          hp: item.hp || "",
          blok: item.blok || item.alamat || "",
          rt: item.rt || "01",
          rw: item.rw || "26",
          terverifikasi: true,
          tenantId: recordTenantId,
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

  const handlePeriodicCleanup = async () => {
    if (!confirm("Peringatan: Aksi ini akan menghapus semua data verifikasi (Disetujui/Ditolak) yang berusia lebih dari 30 hari secara permanen. Lanjutkan?")) return;

    setIsLoadingDB(true);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleData = verifikasiData.filter(v => 
      (v.status === 'Disetujui' || v.status === 'Ditolak') &&
      new Date(v.submittedAt || v.approvedAt || v.rejectedAt || 0) < thirtyDaysAgo
    );

    if (staleData.length === 0) {
      showNotification("Tidak ada data lama yang ditemukan untuk dibersihkan.", "info");
      setIsLoadingDB(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      staleData.forEach(item => {
        batch.delete(doc(db, 'verifikasi_warga', item.id));
      });
      await batch.commit();
      showNotification(`Berhasil membersihkan ${staleData.length} data lama.`, "success");
    } catch (err) {
      handleFirestoreError(err, 'delete', 'periodic_cleanup');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-12 w-full max-w-full overflow-hidden space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
        <div className="w-full relative group">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-[2rem] shadow-2xl shadow-blue-500/30 ring-4 ring-white/50">
                <ShieldCheck className="w-8 h-8 text-white shrink-0" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500 mb-1 block">Administrative Hub</span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-tight">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Verifikasi</span> <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Data</span>
                </h1>
              </div>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
              Otorisasi and sinkronisasi perubahan identitas warga. Pastikan data yang diajukan sesuai dengan dokumen resmi kependudukan.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
          {selectedIds.length > 0 ? (
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ y: -10, scale: 1.05, boxShadow: "0 25px 50px -12px rgba(16,185,129,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApproveAllSelected}
              disabled={isBulkApproving}
              className="px-8 py-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center gap-3 disabled:opacity-50 group ring-1 ring-white/20 whitespace-nowrap"
            >
              <CheckCircle className={`w-5 h-5 ${isBulkApproving ? 'animate-spin' : ''}`} />
              {isBulkApproving ? 'PROSES...' : `SETUJUI SELEKSI (${selectedIds.length})`}
            </motion.button>
          ) : (
            pendingCount > 0 && (
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ y: -10, scale: 1.05, boxShadow: "0 25px 50px -12px rgba(16,185,129,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkApproveAllPending}
                disabled={isBulkApproving}
                className="px-8 py-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center gap-3 disabled:opacity-50 group ring-1 ring-white/20 whitespace-nowrap"
              >
                <CheckCircle className={`w-5 h-5 ${isBulkApproving ? 'animate-spin' : ''}`} />
                {isBulkApproving ? 'PROSES...' : `SETUJU MASAL (${pendingCount})`}
              </motion.button>
            )
          )}
          
          <motion.button 
            whileHover={{ y: -10, scale: 1.05, boxShadow: "0 25px 50px -12px rgba(79,70,229,0.5)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={handleMassSync}
            disabled={!verifikasiData.some(v => v.status === 'Disetujui' && !v.isFinalized)}
            className="px-8 py-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] flex items-center gap-3 disabled:opacity-50 disabled:grayscale whitespace-nowrap shrink-0 group relative overflow-hidden ring-1 ring-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
            SINKRONKAN
          </motion.button>
          
          <motion.button 
            whileHover={{ y: -10, scale: 1.05, boxShadow: "0 25px 50px -12px rgba(244,63,94,0.2)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={handlePeriodicCleanup}
            className="px-8 py-5 bg-white/80 backdrop-blur-md text-rose-500 border-2 border-rose-100/50 hover:border-rose-200/80 rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(244,63,94,0.1)] flex items-center gap-3 whitespace-nowrap shrink-0 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trash2 className="w-5 h-5 group-hover:animate-bounce transition-transform" />
            BERSIHKAN DATA
          </motion.button>
          
          <div className="hidden lg:block h-10 w-px bg-slate-200/60 mx-2 shrink-0" />
          
          <div className="flex bg-slate-900/5 backdrop-blur-xl p-2 rounded-[2.5rem] overflow-x-auto gap-1 w-full sm:w-auto pb-2 sm:pb-2 scrollbar-hide border border-slate-200/50 shadow-inner group">
            {['All', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak'].map((f: any) => {
              const isActive = filter === f;
              return (
                <motion.button
                  key={f}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f)}
                  className={`relative whitespace-nowrap shrink-0 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-wider transition-all duration-500 z-10 ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterIndicator"
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.8rem] shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] border border-blue-400/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-20">{f}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100/50 overflow-hidden w-full transition-all">
        <div className="p-8 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <input 
            type="text" 
            placeholder="Cari NIK atau Nama..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-base font-bold text-slate-600 placeholder:text-slate-300 placeholder:font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-gradient-to-r from-slate-50/80 to-transparent">
                <th className="px-8 py-7 text-center">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredData.filter(v => !v.isFinalized && v.status !== 'Disetujui').length}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-8 py-7">Informasi Warga</th>
                <th className="px-8 py-7">Agama</th>
                <th className="px-8 py-7">Status Verifikasi</th>
                <th className="px-8 py-7">Tgl Pengajuan</th>
                <th className="px-8 py-7">Petugas</th>
                <th className="px-8 py-7 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr key="empty-verifikasi">
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white">
                        <User className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tidak ada pengajuan data.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any, idx: number) => (
                  <tr key={`verif-row-${item.id || idx}-${idx}`} className="hover:bg-blue-50/20 transition-all duration-300 group border-b border-slate-50/50 last:border-0">
                    <td className="px-8 py-6 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        disabled={item.isFinalized || item.status === 'Disetujui'}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-30 cursor-pointer"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 ring-4 ring-slate-50/30 group-hover:ring-blue-50 transition-all">
                          {item.ktpUrl ? <img src={item.ktpUrl} alt="KTP" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-slate-200" />}
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{item.nama}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">NIK: {item.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[11px] font-black text-slate-500 bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-200/50 shadow-sm uppercase tracking-wide">
                        {item.agama || '-'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-2 w-fit ${statusColors[item.status]}`}>
                        {item.status === 'Disetujui' && <CheckCircle className="w-3.5 h-3.5" />}
                        {item.status === 'Ditolak' && <XCircle className="w-3.5 h-3.5" />}
                        {item.status === 'Menunggu Persetujuan' && <Clock className="w-3.5 h-3.5" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-2.5 group-hover:text-slate-700 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:animate-pulse shadow-sm" />
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-500">
                          <User className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.approvedBy || '-'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {!item.isFinalized && (
                          <>
                            {item.status !== 'Disetujui' && (
                              <motion.button 
                                whileHover={{ scale: 1.2, rotate: 8 }}
                                whileTap={{ scale: 0.8 }}
                                onClick={() => handleApprove(item)}
                                disabled={actionLoading}
                                className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 hover:from-emerald-500 hover:to-teal-600 hover:text-white rounded-2xl transition-all border border-emerald-100/50 shadow-sm hover:shadow-emerald-200/50 disabled:opacity-50"
                                title="Setujui"
                              >
                                {actionLoading ? <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                              </motion.button>
                            )}
                            {item.status !== 'Ditolak' && (
                              <motion.button 
                                whileHover={{ scale: 1.2, rotate: -8 }}
                                whileTap={{ scale: 0.8 }}
                                onClick={() => handleReject(item)}
                                disabled={actionLoading}
                                className="p-3.5 bg-gradient-to-br from-rose-50 to-red-50 text-rose-600 hover:from-rose-500 hover:to-red-600 hover:text-white rounded-2xl transition-all border border-rose-100/50 shadow-sm hover:shadow-rose-200/50 disabled:opacity-50"
                                title={item.status === 'Disetujui' ? 'Batalkan & Tolak' : 'Tolak'}
                              >
                                {actionLoading ? <div className="w-5 h-5 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div> : <XCircle className="w-5 h-5" />}
                              </motion.button>
                            )}
                          </>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => {
                            setCatatan('');
                            setSelectedItem(item);
                          }}
                          className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-500 hover:to-indigo-600 hover:text-white rounded-2xl transition-all border border-blue-100/50 shadow-sm hover:shadow-blue-200/50"
                          title="Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
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
                  <button onClick={() => { setSelectedItem(null); setCatatan(''); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Perubahan Data</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">NIK</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.nik}</p>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Nama Lengkap</label>
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

                    <div className="flex flex-col sm:flex-row gap-6 pt-8">
                      <motion.button 
                        whileHover={{ y: -5, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(5, 150, 105, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApprove(selectedItem)}
                        disabled={actionLoading || selectedItem.status === 'Disetujui'}
                        className="flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white font-black uppercase tracking-[0.2em] text-[11px] py-6 rounded-3xl shadow-[0_20px_40px_-10px_rgba(5,150,105,0.3)] disabled:opacity-50 flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        )}
                        <span className="relative z-10">{actionLoading ? 'MEMPROSES...' : 'SETUJUI PERUBAHAN'}</span>
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ y: -5, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(225, 29, 72, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(selectedItem)}
                        disabled={actionLoading || selectedItem.status === 'Ditolak' || selectedItem.isFinalized}
                        className="flex-1 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white font-black uppercase tracking-[0.2em] text-[11px] py-6 rounded-3xl shadow-[0_20px_40px_-10px_rgba(225,29,72,0.3)] disabled:opacity-50 flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        )}
                        <span className="relative z-10">{actionLoading ? 'MEMPROSES...' : (selectedItem.status === 'Disetujui' ? 'BATALKAN & TOLAK' : 'TOLAK PENGAJUAN')}</span>
                      </motion.button>
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
