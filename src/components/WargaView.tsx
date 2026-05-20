import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Users, Trash2, Edit2, Download, Printer, UserPlus, 
  MapPin, Phone, Info, Search, X, CheckCircle, AlertCircle, Eye, EyeOff, ClipboardList, Trash, ShieldCheck, LogOut, Menu, Lock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

interface WargaViewProps {
  wargaData: any[];
  currentTenant?: any;
  setWargaData: any;
  userRole: string;
  tenantId: string;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  handleFileUpload: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUser: any;
  settings?: any;
}

const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
  const parts = tglLahir.split('-');
  if (parts.length !== 3) return "-";
  const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

function WargaView(props: WargaViewProps) { 
  const { 
      wargaData, 
      currentTenant, 
      setWargaData, 
      userRole, 
      tenantId, 
      setIsLoadingDB, 
      handleFirestoreError, 
      handleFileUpload, 
      showNotification, 
      currentUser,
      settings 
  } = props;
  const isApt = settings?.themeMode === 'apartemen';
  const tenant = currentTenant || {};
  const isFree = !tenant.status || tenant.status === "TRIAL" || tenant.status === "FREE";
  // The plan limits are stored in tenant or we just use hardcoded checks / maxWarga from the object. This is a bit rough but works for trial
  const maxWargaLimit = isFree ? 50 : (tenant?.maxWarga || 5000);
  const limitReached = wargaData.length >= maxWargaLimit;

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<any>(null);
  const [viewWarga, setViewWarga] = useState<any>(null);

  const isRTAdmin = currentUser?.role === 'RT';
  const myRT = currentUser?.rt || '01';

  // Auto-detect RT from tenant name (e.g. "RT 01 / RW 26") or from tenant identifier
  const detectedRT = useMemo(() => {
    if (!tenant?.name) return null;
    const match = tenant.name.match(/RT\s*(\d+)/i);
    if (match) {
      return match[1].padStart(2, '0');
    }
    return null;
  }, [tenant?.name]);

  const [filterRT, setFilterRT] = useState(isRTAdmin ? myRT : (detectedRT || "Semua"));

  useEffect(() => {
    if (isRTAdmin) {
      setFilterRT(myRT);
    } else if (detectedRT) {
      setFilterRT(detectedRT);
    } else {
      setFilterRT("Semua");
    }
  }, [isRTAdmin, myRT, detectedRT]);
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterKategoriUmur, setFilterKategoriUmur] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaIds, setSelectedWargaIds] = useState<string[]>([]);
  const [wargaToDelete, setWargaToDelete] = useState<any>(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredWargaData = useMemo(() => {
    const uniqueMap: Record<string, any> = {};
    wargaData.forEach(w => {
      const id = w.docId || w.nik || w.id || Math.random().toString();
      const existing = uniqueMap[id];
      if (!existing || (w.terverifikasi && !existing.terverifikasi)) {
        uniqueMap[id] = w;
      }
    });

    const uniqueWarga = Object.values(uniqueMap);
    return uniqueWarga.filter((w: any) => {
      const normalize = (val: string) => val ? val.toString().replace(/^0+/, '') : "";
      const filterRTNormalized = filterRT === "Semua" ? "Semua" : filterRT.replace(/^0+/, '');
      const filterRWNormalized = filterRW === "Semua" ? "Semua" : filterRW.replace(/^0+/, '');
      const matchRT = filterRT === "Semua" || normalize(w.rt || "") === filterRTNormalized;
      const matchRW = filterRW === "Semua" || normalize(w.rw || "") === filterRWNormalized;
      
      let matchUmur = true;
      if (filterKategoriUmur !== "Semua") {
        const ageResult = calculateAge(w.tglLahir);
        const age = typeof ageResult === 'number' ? ageResult : -1;
        if (age !== -1) {
          if (filterKategoriUmur === "Balita") matchUmur = age <= 5;
          else if (filterKategoriUmur === "Remaja") matchUmur = age >= 6 && age <= 17;
          else if (filterKategoriUmur === "Dewasa") matchUmur = age >= 18 && age < 60;
          else if (filterKategoriUmur === "Lansia") matchUmur = age >= 60;
        } else matchUmur = false;
      }
      
      const searchLower = searchQuery.toLowerCase();
      return matchRT && matchRW && matchUmur && (searchQuery === "" || 
        w.nama?.toLowerCase().includes(searchLower) ||
        w.nik?.toLowerCase().includes(searchLower) ||
        w.kk?.toLowerCase().includes(searchLower));
    }).sort((a: any, b: any) => (a.nama || "").localeCompare(b.nama || ""));
  }, [wargaData, filterRT, filterRW, filterKategoriUmur, searchQuery]);

  const displayedWarga = filteredWargaData;

  const startEdit = (warga: any) => {
    setEditingWarga(warga);
    setShowEditForm(true);
  };

  const promptBulkDelete = () => {
    if (selectedWargaIds.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = async () => {
    if (selectedWargaIds.length === 0) return;
    
    setIsDeletingWarga(true);
    try {
      const batch = writeBatch(db);
      selectedWargaIds.forEach(id => {
        batch.delete(doc(db, 'data_warga', id));
      });
      await batch.commit();
      setSelectedWargaIds([]);
      showNotification(`${selectedWargaIds.length} data warga berhasil dihapus`, 'success');
      setShowBulkDeleteModal(false);
    } catch (error: any) {
      handleFirestoreError(error, 'delete', '/data_warga');
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedWargaIds.length === displayedWarga.length && displayedWarga.length > 0) {
      setSelectedWargaIds([]);
    } else {
      setSelectedWargaIds(displayedWarga.map((w: any) => w.docId || w.nik || w.id));
    }
  };

  const toggleSelectWarga = (id: string) => {
    setSelectedWargaIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const processImport = (file: File) => {
    setIsUploading(true);
    
    // Fallback handler if not CSV or if we're using FileReader
    const handleParsedData = async (parsedData: any[]) => {
      try {
        let successCount = 0;
        let duplicateCount = 0;
        const CHUNK_SIZE = 450; // Firestore limit is 500, use 450 to be safe
        const uniqueIds = new Set();
        
        // Split data into chunks of 450
        for (let i = 0; i < parsedData.length; i += CHUNK_SIZE) {
          const chunk = parsedData.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          let opsInBatch = 0;

          chunk.forEach((row: any) => {
            const rawNik = (row.nik || row.NIK || row['No. KTP'] || row['NIK/No. KTP'] || row['NOMOR KTP'] || row['Nomor KTP'] || row['No KTP'] || row['NIK '] || row['nik '] || row['N.I.K'] || '')?.toString()?.trim();
            const nama = row.nama || row.Nama || row['Nama Lengkap'] || row['NAMA'] || row['Nama Warga'] || row['NAMA LENGKAP'];
            
            if (nama) {
              let nik = rawNik.replace(/[^0-9]/g, ''); 
              
              // STABLE ID: Use tenantId + NIK if available (>= 5 digits), 
              // otherwise use tenantId + sanitized Name + short NIK to maintain stability across imports.
              const cleanNama = nama.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              const id = nik && nik.length >= 5 
                ? `${tenantId}_${nik}` 
                : `${tenantId}_STABLE_${cleanNama}_${nik}`;
              
              if (!nik) nik = 'Belum Ada'; // Visual marker for missing NIK

              if (uniqueIds.has(id)) {
                duplicateCount++;
              }
              uniqueIds.add(id);

              const docRef = doc(db, 'data_warga', id);
              batch.set(docRef, {
                nik: nik,
                docId: id,
                nama: nama,
                kk: (row.kk || row['No. KK'] || row.KK || row['No KK'] || row['Nomor KK'] || row['KODE KK'] || '')?.toString()?.trim() || '',
                rt: (row.rt || row.RT || row['RT.'] || '')?.toString()?.padStart(2, '0') || '01',
                rw: (row.rw || row.RW || row['RW.'] || '')?.toString()?.padStart(2, '0') || '26',
                status: row.status || row.Status || 'Warga Tetap',
                tenantId: tenantId,
                tglLahir: row.tglLahir || row['Tanggal Lahir'] || row['Tanggal Lahir '] || '',
                tempatLahir: row.tempatLahir || row['Tempat Lahir'] || '',
                jenisKelamin: row.jenisKelamin || row['Jenis Kelamin'] || row.jk || row.JK || 'Laki-laki',
                agama: row.agama || row.Agama || 'Islam',
                pekerjaan: row.pekerjaan || row.Pekerjaan || row['Profesi/ Pekerjaan'] || '',
                pendidikan: row.pendidikan || row.Pendidikan || row['Pendidikan Terakhir'] || '',
                statusKawin: row.statusKawin || row['Status Kawin'] || row.pernikahan || '',
                posisiKeluarga: row.posisiKeluarga || row['Posisi Dalam Keluarga'] || row.posisi || '',
                kewarganegaraan: row.kewarganegaraan || row['WNi/ WNA'] || row.kwn || 'WNI',
                telepon: row.telepon || row.Telepon || row['No. Hp'] || row.hp || row.phone || '',
                email: row.email || row.Email || '',
                alamat: row.alamat || row.Alamat || row.blok || '',
                kelurahan: row.kelurahan || row.Kelurahan || '',
                kecamatan: row.kecamatan || row.Kecamatan || '',
                kabupaten: row.kabupaten || row.kota || row['Kabupaten/ Kota'] || row.kota_kab || ''
              }, { merge: true });
              successCount++;
              opsInBatch++;
            }
          });

          if (opsInBatch > 0) {
            await batch.commit();
          }
        }
        
        if (successCount > 0) {
          const finalCount = uniqueIds.size;
          if (duplicateCount > 0) {
            showNotification(`${finalCount} warga unik diimpor (${duplicateCount} data duplikat dilewati/diupdate)`, 'success');
          } else {
            showNotification(`${successCount} data berhasil diimpor`, 'success');
          }
        } else {
          showNotification('Tidak ada data valid yang ditemukan', 'error');
        }
      } catch (err) {
        console.error(err);
        showNotification('Gagal memproses file', 'error');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          handleParsedData(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          showNotification('Gagal memparsing CSV', 'error');
          setIsUploading(false);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          handleParsedData(parsedData);
        } catch (err) {
          console.error(err);
          showNotification('Gagal memproses file Excel', 'error');
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    setIsDeletingWarga(true);
    try {
      await deleteDoc(doc(db, 'data_warga', wargaToDelete.docId || wargaToDelete.nik));
      setWargaToDelete(null);
      showNotification("Data warga berhasil dihapus");
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/data_warga`);
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredWargaData.map((w: any) => ({
      'NIK': w.nik || '-',
      'Nama': w.nama || '-',
      'No. KK': w.kk || w.kodeKeluarga || '-',
      'Jenis Kelamin': w.jenisKelamin || w.jk || '-',
      'Kelurahan': w.kelurahan || '-',
      'Kecamatan': w.kecamatan || '-',
      'Kabupaten/ Kota': w.kabupaten || w.kota || w.kota_kab || '-',
      'No. Hp': w.telepon || w.phone || w.hp || w.noHp || '-',
      'Email': w.email || '-',
      'Foto KTP': w.ktpUrl || '-',
      'Foto KK': w.kkUrl || '-',
      'Agama': w.agama || '-',
      'Alamat': w.alamat || w.blok || '-',
      'RT': w.rt || '-',
      'RW': w.rw || '-',
      'Profesi/ Pekerjaan': w.pekerjaan || w.profesi || '-',
      'Posisi Dalam Keluarga': w.posisi || w.posisiKeluarga || '-',
      'Pendidikan Terakhir': w.pendidikan || w.pendidikanTerakhir || '-',
      'Status Kawin': w.statusKawin || w.pernikahan || '-',
      'Tempat Lahir': w.tempatLahir || '-',
      'Tanggal Lahir': w.tglLahir || '-',
      'WNi/ WNA': w.kewarganegaraan || w.kwn || '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");
    XLSX.writeFile(workbook, `Data_Warga_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase">
            <Users className="w-8 h-8 text-brand-blue" />
            Data {isApt ? "Penghuni" : "Warga"} {currentTenant?.name || ''}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total: {filteredWargaData.length} {isApt ? "Penghuni" : "Warga"} Terdaftar</p>
        </div>
        <div className="flex gap-2">
          {selectedWargaIds.length > 0 && (
            <button onClick={promptBulkDelete} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all">
              <Trash size={18} /> Hapus ({selectedWargaIds.length})
            </button>
          )}
          <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) processImport(e.target.files[0]); }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || limitReached} className="bg-gradient-to-tr from-amber-500 to-orange-600 text-white px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md shadow-amber-500/20 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <Download size={18} className="rotate-180" /> {isUploading ? 'Loading...' : 'Import Data'}
          </button>
          <button onClick={() => {
            if (limitReached) {
              showNotification(`Batas maksimal ${maxWargaLimit} warga untuk paket saat ini telah tercapai. Upgrade paket untuk menambah warga.`, 'error');
              return;
            }
            setShowAddForm(true);
          }} className="bg-gradient-to-tr from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <UserPlus size={18} /> {limitReached ? `Limit (${maxWargaLimit}) Penuh` : `Tambah ${isApt ? "Penghuni" : "Warga"}`}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input type="text" placeholder="Cari Nama / NIK..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors" />
            </div>
            <select 
              value={filterRT} 
              onChange={(e) => setFilterRT(e.target.value)} 
              disabled={!!detectedRT || isRTAdmin}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 outline-none text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {detectedRT || isRTAdmin ? (
                <option value={detectedRT || myRT} className="dark:bg-slate-800">{`RT ${detectedRT || myRT}`}</option>
              ) : (
                <>
                  <option value="Semua" className="dark:bg-slate-800">RT: Semua</option>
                  {Array.from({length: 10}, (_, i) => String(i+1).padStart(2, '0')).map(rt => (
                    <option key={rt} value={rt} className="dark:bg-slate-800">{`RT ${rt}`}</option>
                  ))}
                </>
              )}
            </select>
            <select value={filterRW} onChange={(e) => setFilterRW(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 outline-none text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
              <option value="Semua" className="dark:bg-slate-800">RW: Semua</option>
              {Array.from({length: 30}, (_, i) => String(i+1).padStart(2, '0')).map(rw => <option key={rw} value={rw} className="dark:bg-slate-800">{`RW ${rw}`}</option>)}
            </select>
            <div className="flex items-center gap-2">
               <button onClick={handleExportExcel} className="flex-1 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white h-full rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 py-4 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"> <Download size={14} /> Ekspor </button>
            </div>
         </div>

         <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 transition-colors">
                <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <th className="py-4 px-4 w-12 text-center">
                    <input type="checkbox" checked={selectedWargaIds.length === displayedWarga.length && displayedWarga.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded text-brand-blue border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-brand-blue" />
                  </th>
                  <th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em]">Nama / NIK</th>
                  <th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em]">RT/RW</th>
                  <th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em]">Status</th>
                  <th className="py-5 px-4 text-center font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {displayedWarga.map((w: any, idx: number) => {
                  const idWarga = w.docId || w.id || w.nik || `w-idx-${idx}`;
                  const isSelected = selectedWargaIds.includes(idWarga);
                  return (
                  <tr key={`wg-row-${idWarga}-${idx}`} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group transition-all ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                    <td className="py-5 px-4 text-center">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelectWarga(idWarga)} className="w-4 h-4 rounded text-brand-blue border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-brand-blue" />
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-blue font-black shadow-inner overflow-hidden transition-colors">
                            {w.foto ? <img src={w.foto} className="w-full h-full object-cover" /> : w.nama.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1 transition-colors">{w.nama}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tighter uppercase">{w.nik}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                       <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg text-[10px] font-black font-mono transition-colors">{w.rt}/{w.rw}</span>
                    </td>
                    <td className="py-5 px-4">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         w.status === 'Warga Tetap' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {w.status}
                       </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewWarga(w)} title="Lihat Profil" className="p-2 text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 shadow-sm border border-blue-100 rounded-xl transition-all"> <Eye size={16} /> </button>
                        {(['SUPER_ADMIN', 'ADMIN', 'RW', 'RT'].includes(currentUser?.role) || currentUser?.isSuperAdmin) && (
                          <>
                            <button onClick={() => startEdit(w)} title="Edit Warga" className="p-2 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 shadow-sm border border-emerald-100 rounded-xl transition-all"> <Edit2 size={16} /> </button>
                            <button onClick={() => setWargaToDelete(w)} title="Hapus Warga" className="p-2 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 shadow-sm border border-red-100 rounded-xl transition-all"> <Trash2 size={16} /> </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      </div>

      {/* ADD / EDIT WARGA MODAL */}
      <AnimatePresence>
        {(showAddForm || showEditForm) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-left">
                   <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-2">
                     {showEditForm ? <><Edit2 size={20} className="text-brand-blue" /> Edit Data Warga</> : <><UserPlus size={20} className="text-brand-blue" /> Tambah Warga Baru</>}
                   </h3>
                   <button onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingWarga(null); }} className="p-2 hover:bg-slate-200 text-slate-400 rounded-xl transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto w-full text-left">
                   <form id="wargaForm" onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget as HTMLFormElement);
                      setIsLoadingDB(true);
                      
                      try {
                        let fotoKTPUrl = editingWarga?.fotoKTP || '';
                        let fotoKKUrl = editingWarga?.fotoKK || '';

                        const fileKTP = fd.get('fileKTP') as File;
                        const fileKK = fd.get('fileKK') as File;

                        if (fileKTP && fileKTP.size > 0) {
                          fotoKTPUrl = await handleFileUpload(fileKTP, `warga_docs/KTP_${fd.get('nik')}`);
                        }
                        if (fileKK && fileKK.size > 0) {
                          fotoKKUrl = await handleFileUpload(fileKK, `warga_docs/KK_${fd.get('nik')}`);
                        }

                        const data = {
                          nik: fd.get('nik'),
                          nama: fd.get('nama'),
                          kk: fd.get('kk'),
                          tempatLahir: fd.get('tempatLahir'),
                          tglLahir: fd.get('tglLahir'),
                          jenisKelamin: fd.get('jenisKelamin'),
                          kewarganegaraan: fd.get('kewarganegaraan'),
                          agama: fd.get('agama'),
                          statusKawin: fd.get('statusKawin'),
                          pendidikan: fd.get('pendidikan'),
                          pekerjaan: fd.get('pekerjaan'),
                          posisiKeluarga: fd.get('posisiKeluarga'),
                          alamat: fd.get('alamat'),
                          rt: fd.get('rt'),
                          rw: fd.get('rw'),
                          kelurahan: fd.get('kelurahan'),
                          kecamatan: fd.get('kecamatan'),
                          kabupaten: fd.get('kabupaten'),
                          telepon: fd.get('telepon'),
                          email: fd.get('email'),
                          status: fd.get('status'),
                          fotoKTP: fotoKTPUrl,
                          fotoKK: fotoKKUrl,
                          tenantId,
                          role: 'WARGA'
                        };
                        
                        const rawNik = (data.nik as string || '').trim();
                        const nik = rawNik.replace(/[^0-9]/g, '');
                        const cleanNama = (data.nama as string || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        
                        // Use consistent ID logic with import process
                        const docId = nik && nik.length >= 5 
                          ? `${tenantId}_${nik}` 
                          : `${tenantId}_STABLE_${cleanNama}_${nik}`;
                        
                        const finalData = { ...data, docId, nik: nik || 'Belum Ada' };
                        
                        if (showEditForm && editingWarga) {
                          const targetId = editingWarga.docId || editingWarga.id || `${tenantId}_${editingWarga.nik}`;
                          await updateDoc(doc(db, 'data_warga', targetId), finalData);
                          setWargaData(wargaData.map((w: any) => (w.docId || w.id || `${tenantId}_${w.nik}`) === targetId ? { ...w, ...finalData } : w));
                          showNotification('Data warga berhasil diubah', 'success');
                        } else {
                          await setDoc(doc(db, 'data_warga', docId), finalData);
                          setWargaData([...wargaData, finalData]);
                          showNotification('Warga baru berhasil ditambahkan', 'success');
                        }
                        setShowAddForm(false);
                        setShowEditForm(false);
                        setEditingWarga(null);
                      } catch (err) {
                        handleFirestoreError(err, 'write', 'data_warga');
                      } finally {
                        setIsLoadingDB(false);
                      }
                   }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NIK <span className="text-red-500">*</span></label>
                            <input required name="nik" defaultValue={editingWarga?.nik} readOnly={!!showEditForm} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sesuai KTP: Nama Lengkap <span className="text-red-500">*</span></label>
                            <input required name="nama" defaultValue={editingWarga?.nama} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Kartu Keluarga (KK)</label>
                            <input name="kk" defaultValue={editingWarga?.kk} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telepon/WhatsApp</label>
                            <input name="telepon" defaultValue={editingWarga?.telepon} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempat Lahir</label>
                            <input name="tempatLahir" defaultValue={editingWarga?.tempatLahir} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                            <input type="date" name="tglLahir" defaultValue={editingWarga?.tglLahir} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                            <select name="jenisKelamin" defaultValue={editingWarga?.jenisKelamin || 'Laki-laki'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Laki-laki">Laki-laki</option>
                               <option value="Perempuan">Perempuan</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">kewarganegaraan <span className="text-red-500">*</span></label>
                            <select name="kewarganegaraan" defaultValue={editingWarga?.kewarganegaraan || 'WNI'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="WNI">WNI (Warga Negara Indonesia)</option>
                               <option value="WNA">WNA (Warga Negara Asing)</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left border-t border-slate-100 pt-4 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap KTP</label>
                            <textarea name="alamat" defaultValue={editingWarga?.alamat} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue"></textarea>
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-left">
                           <div className="flex flex-col">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RT KTP/Domisili <span className="text-red-500">*</span></label>
                              <input required name="rt" defaultValue={editingWarga?.rt || (isRTAdmin ? myRT : (detectedRT || '01'))} readOnly={!!detectedRT || isRTAdmin} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-blue read-only:bg-slate-100 read-only:text-slate-500" />
                           </div>
                           <div className="flex flex-col">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RW KTP/Domisili <span className="text-red-500">*</span></label>
                              <input required name="rw" defaultValue={editingWarga?.rw || '26'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                           </div>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kelurahan</label>
                            <input name="kelurahan" defaultValue={editingWarga?.kelurahan} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kecamatan</label>
                            <input name="kecamatan" defaultValue={editingWarga?.kecamatan} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kabupaten/Kota</label>
                            <input name="kabupaten" defaultValue={editingWarga?.kabupaten} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         
                         <div className="flex flex-col text-left border-t border-slate-100 pt-4 md:col-span-2"></div>
                         
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agama</label>
                            <select name="agama" defaultValue={editingWarga?.agama || 'Islam'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Islam">Islam</option>
                               <option value="Kristen">Kristen</option>
                               <option value="Katolik">Katolik</option>
                               <option value="Hindu">Hindu</option>
                               <option value="Buddha">Buddha</option>
                               <option value="Konghucu">Konghucu</option>
                               <option value="Lainnya">Lainnya</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Kawin</label>
                            <select name="statusKawin" defaultValue={editingWarga?.statusKawin || 'Belum Kawin'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Belum Kawin">Belum Kawin</option>
                               <option value="Kawin">Kawin</option>
                               <option value="Cerai Hidup">Cerai Hidup</option>
                               <option value="Cerai Mati">Cerai Mati</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pendidikan Terakhir</label>
                            <select name="pendidikan" defaultValue={editingWarga?.pendidikan || 'SMA'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="SD">SD</option>
                               <option value="SMP">SMP</option>
                               <option value="SMA">SMA</option>
                               <option value="S1">S1</option>
                               <option value="S2">S2</option>
                               <option value="S3">S3</option>
                               <option value="DIPLOMA 1">DIPLOMA 1</option>
                               <option value="DIPLOMA 2">DIPLOMA 2</option>
                               <option value="DIPLOMA 3">DIPLOMA 3</option>
                               <option value="DIPLOMA 4">DIPLOMA 4</option>
                               <option value="BELUM SEKOLAH">BELUM SEKOLAH</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Posisi Dalam Keluarga</label>
                            <select name="posisiKeluarga" defaultValue={editingWarga?.posisiKeluarga || 'Anak'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Kepala Keluarga">Kepala Keluarga</option>
                               <option value="Istri">Istri</option>
                               <option value="Suami">Suami</option>
                               <option value="Anak">Anak</option>
                               <option value="Mertua">Mertua</option>
                               <option value="Famili Lain">Famili Lain</option>
                            </select>
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profesi/Pekerjaan</label>
                            <input name="pekerjaan" defaultValue={editingWarga?.pekerjaan} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                            <input type="email" name="email" defaultValue={editingWarga?.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue" />
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Tinggal</label>
                            <select name="status" defaultValue={editingWarga?.status || 'Warga Tetap'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue">
                               <option value="Warga Tetap">Warga Tetap (Milik Sendiri)</option>
                               <option value="Warga Kontrakan">Warga Kontrakan/Kost</option>
                            </select>
                         </div>
                         
                         <div className="flex flex-col text-left border-t border-slate-100 pt-4 md:col-span-2"></div>

                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Foto KTP</label>
                            <input type="file" name="fileKTP" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90" />
                            {editingWarga?.fotoKTP && <p className="text-xs text-emerald-600 font-bold mt-2 truncate">File tersimpan: {editingWarga.fotoKTP.substring(0,25)}...</p>}
                         </div>
                         <div className="flex flex-col text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Foto KK</label>
                            <input type="file" name="fileKK" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90" />
                            {editingWarga?.fotoKK && <p className="text-xs text-emerald-600 font-bold mt-2 truncate">File tersimpan: {editingWarga.fotoKK.substring(0,25)}...</p>}
                         </div>
                      </div>
                   </form>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end items-center">
                   <button onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingWarga(null); }} className="px-6 py-3 font-black text-slate-400 bg-slate-200 border border-slate-300 rounded-xl hover:bg-slate-300 transition-colors uppercase text-[10px] tracking-widest">Batal</button>
                   <button form="wargaForm" type="submit" className="px-6 py-3 font-black text-white bg-brand-blue rounded-xl hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/30 transition-all uppercase text-[10px] tracking-widest">Simpan Data</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW WARGA MODAL */}
      <AnimatePresence>
        {viewWarga && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden p-6 relative">
                <button onClick={() => setViewWarga(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors z-10"><X size={20} /></button>
                <div className="flex flex-col items-center text-center mb-6 shrink-0">
                   <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-brand-blue text-4xl font-black shadow-inner mb-4 overflow-hidden">
                      {viewWarga.foto ? <img src={viewWarga.foto} className="w-full h-full object-cover" /> : viewWarga.nama.charAt(0)}
                   </div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">{viewWarga.nama}</h3>
                   <p className="text-sm font-bold text-slate-400 font-mono tracking-widest">{viewWarga.nik}</p>
                   {viewWarga.kk && <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest mt-1">KK: {viewWarga.kk}</p>}
                   <div className="flex gap-2 mt-2">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                       viewWarga.status === 'Warga Tetap' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                       {viewWarga.status}
                     </span>
                     {viewWarga.kewarganegaraan && (
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100`}>
                         {viewWarga.kewarganegaraan}
                       </span>
                     )}
                   </div>
                </div>
                <div className="overflow-y-auto pr-2 space-y-4 pt-4 border-t border-slate-100 flex-1">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. KK</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kk || viewWarga.kodeKeluarga || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempat, Tanggal Lahir</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.tempatLahir || '-'}, {viewWarga.tglLahir || '-'} ({calculateAge(viewWarga.tglLahir)}Th)</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Kelamin</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.jenisKelamin || viewWarga.jk || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agama</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.agama || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Kawin</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.statusKawin || viewWarga.pernikahan || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendidikan Terakhir</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.pendidikan || viewWarga.pendidikanTerakhir || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profesi/Pekerjaan</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.pekerjaan || viewWarga.profesi || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posisi Dalam Keluarga</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.posisiKeluarga || viewWarga.posisi || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.email || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Hp</span>
                        <span className="text-sm font-black text-slate-700 font-mono">{viewWarga.telepon || viewWarga.phone || viewWarga.hp || viewWarga.noHp || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RT / RW</span>
                        <span className="text-sm font-black text-slate-700">RT {viewWarga.rt || '-'} / RW {viewWarga.rw || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WNI / WNA</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kewarganegaraan || viewWarga.kwn || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Lengkap</span>
                        <span className="text-sm font-black text-slate-700 leading-relaxed">{viewWarga.alamat || viewWarga.blok || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelurahan</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kelurahan || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kecamatan</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kecamatan || '-'}</span>
                     </div>
                     <div className="flex flex-col py-2 border-b border-slate-50 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kabupaten/Kota</span>
                        <span className="text-sm font-black text-slate-700">{viewWarga.kabupaten || viewWarga.kota || viewWarga.kota_kab || '-'}</span>
                     </div>
                   </div>

                   {(viewWarga.fotoKTP || viewWarga.ktpUrl || viewWarga.fotoKK || viewWarga.kkUrl) && (
                     <div className="pt-4 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Dokumen Lampiran</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {(viewWarga.fotoKTP || viewWarga.ktpUrl) && (
                             <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-600">Foto KTP</span>
                                <a href={viewWarga.fotoKTP || viewWarga.ktpUrl} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-slate-200 block">
                                   <img src={viewWarga.fotoKTP || viewWarga.ktpUrl} alt="KTP" className="w-full h-32 object-cover hover:scale-105 transition-transform" />
                                </a>
                             </div>
                           )}
                           {(viewWarga.fotoKK || viewWarga.kkUrl) && (
                             <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-600">Foto KK</span>
                                <a href={viewWarga.fotoKK || viewWarga.kkUrl} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-slate-200 block">
                                   <img src={viewWarga.fotoKK || viewWarga.kkUrl} alt="KK" className="w-full h-32 object-cover hover:scale-105 transition-transform" />
                                </a>
                             </div>
                           )}
                        </div>
                     </div>
                   )}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE WARGA MODAL */}
      <AnimatePresence>
        {wargaToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Hapus Warga?</h3>
                <p className="text-sm font-medium text-slate-500 mb-6">Yakin ingin menghapus data <b>{wargaToDelete.nama}</b> secara permanen? Data yang dihapus tidak dapat dipulihkan.</p>
                <div className="flex gap-2 justify-center">
                   <button onClick={() => setWargaToDelete(null)} className="px-6 py-3 font-black text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest flex-1">Batal</button>
                   <button onClick={handleDeleteWarga} disabled={isDeletingWarga} className="px-6 py-3 font-black text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors uppercase text-[10px] tracking-widest flex-1">
                     {isDeletingWarga ? 'Menghapus...' : 'Hapus'}
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* BULK DELETE MODAL */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Hapus Sekaligus?</h3>
                <p className="text-sm font-medium text-slate-500 mb-6">Yakin ingin menghapus <b>{selectedWargaIds.length} data warga</b> terpilih secara permanen? Data yang dihapus tidak dapat dipulihkan.</p>
                <div className="flex gap-2 justify-center">
                   <button onClick={() => setShowBulkDeleteModal(false)} className="px-6 py-3 font-black text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest flex-1">Batal</button>
                   <button onClick={executeBulkDelete} disabled={isDeletingWarga} className="px-6 py-3 font-black text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors uppercase text-[10px] tracking-widest flex-1">
                     {isDeletingWarga ? 'Menghapus...' : 'Hapus'}
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WargaView;
