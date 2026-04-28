import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, Upload, Trash2, AlertTriangle, PlusCircle, 
  Edit, Eye, CheckCircle, X, User 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { calculateAge } from '../utils/helpers';
import ConfirmModal from './ConfirmModal';

interface WargaViewProps {
  wargaData: any[];
  setWargaData: any;
  userRole: string;
  tenantId: string;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  handleFileUpload: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function WargaView({ 
  wargaData, setWargaData, userRole, tenantId, setIsLoadingDB, 
  handleFirestoreError, handleFileUpload, showNotification 
}: WargaViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<any>(null);
  const [viewWarga, setViewWarga] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRT, setFilterRT] = useState("Semua");
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterKategoriUmur, setFilterKategoriUmur] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaIds, setSelectedWargaIds] = useState<string[]>([]);
  const [wargaToDelete, setWargaToDelete] = useState<any>(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic for detecting duplicates ---
  const findDuplicates = () => {
    const nikCount: Record<string, string[]> = {};
    wargaData.forEach(w => {
      if (!w.nik) return;
      if (!nikCount[w.nik]) nikCount[w.nik] = [];
      nikCount[w.nik].push(w.docId);
    });
    
    const duplicateNiks = Object.keys(nikCount).filter(nik => nikCount[nik].length > 1);
    const docsToDelete: string[] = [];
    duplicateNiks.forEach(nik => {
      const ids = nikCount[nik];
      docsToDelete.push(...ids.slice(1));
    });
    return { duplicateNiks, docsToDelete };
  };

  const { duplicateNiks, docsToDelete } = findDuplicates();
  const [isCleaning, setIsCleaning] = useState(false);

  const handleCleanupDuplicates = async () => {
    if (docsToDelete.length === 0) return;
    if (!window.confirm(`Ditemukan ${duplicateNiks.length} NIK ganda dengan total ${docsToDelete.length} dokumen redundant. Hapus data redundant?`)) return;

    setIsCleaning(true);
    try {
      const batch = writeBatch(db);
      docsToDelete.forEach(id => {
        batch.delete(doc(db, "data_warga", id));
      });
      await batch.commit();
      showNotification(`Berhasil membersihkan ${docsToDelete.length} data ganda.`, 'success');
    } catch (error: any) {
      console.error("Cleanup error:", error);
      showNotification("Gagal membersihkan data ganda.", 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedWargaIds.length === filteredWargaData.length) {
      setSelectedWargaIds([]);
    } else {
      setSelectedWargaIds(filteredWargaData.map(w => w.docId));
    }
  };

  const toggleSelectWarga = (docId: string) => {
    if (selectedWargaIds.includes(docId)) {
      setSelectedWargaIds(selectedWargaIds.filter(id => id !== docId));
    } else {
      setSelectedWargaIds([...selectedWargaIds, docId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWargaIds.length === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedWargaIds.length} data terpilih?`)) return;

    setIsDeletingWarga(true);
    try {
      const uniqueIds = Array.from(new Set(selectedWargaIds));
      const totalCount = uniqueIds.length;
      const chunks = [];
      for (let i = 0; i < totalCount; i += 500) {
        chunks.push(uniqueIds.slice(i, i + 500));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(id => {
          if (id) {
            batch.delete(doc(db, "data_warga", id));
          }
        });
        await batch.commit();
      }

      setSelectedWargaIds([]);
      showNotification(`Berhasil menghapus ${totalCount} data warga.`, "success");
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      handleFirestoreError(error, "delete", "/data_warga");
      showNotification("Gagal menghapus data warga. Pastikan Anda memiliki akses yang cukup.", "error");
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processImportedData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedData(results.data);
        },
        error: (error) => {
          console.error("CSV Merge Error (Warga):", error);
          showNotification("Gagal mengimpor data warga. Pastikan format CSV benar.", 'error');
        }
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedData = async (data: any[]) => {
    const validData = data.filter((row: any) => {
      const nik = row['NIK'] || row['nik'];
      const nama = row['Nama Lengkap'] || row['nama'];
      return nik && nik.toString().trim() !== "" && nama && nama.toString().trim() !== "";
    });

    if (validData.length === 0) {
      showNotification("Tidak ada data warga valid yang ditemukan (NIK dan Nama wajib ada).", "error");
      return;
    }

    const newData = validData.map((row: any) => ({
      tenantId: tenantId,
      nama: (row['Nama Lengkap'] || row['nama'] || "").toString(),
      nik: (row['NIK'] || row['nik'] || "").toString(),
      kk: (row['No. KK'] || row['no_kk'] || row['kk'] || "").toString(),
      tempatLahir: (row['Tempat Lahir'] || row['tempat_lahir'] || "").toString(),
      tglLahir: (row['Tgl Lahir'] || row['tgl_lahir'] || "").toString(),
      jk: (row['Jenis Kelamin'] || row['jk'] || "").toString(),
      posisi: (row['Posisi dalam Keluarga'] || row['posisi'] || "").toString(),
      profesi: (row['Profesi / Pekerjaan'] || row['profesi'] || "").toString(),
      pendidikanTerakhir: (row['Pendidikan Terakhir'] || row['pendidikanTerakhir'] || "").toString(),
      kawin: (row['Status Kawin'] || row['kawin'] || "").toString(),
      kewarganegaraan: (row['Kewarganegaraan'] || row['kewarganegaraan'] || "").toString(),
      agama: (row['Agama'] || row['agama'] || "Islam").toString(),
      rt: (row['RT'] || row['rt'] || "01").toString(),
      rw: (row['RW'] || row['rw'] || "05").toString(),
      blok: (row['Alamat/Blok'] || row['alamat'] || row['blok'] || "").toString(),
      kelurahan: (row['Kelurahan'] || row['kelurahan'] || "").toString(),
      kecamatan: (row['Kecamatan'] || row['kecamatan'] || "").toString(),
      kota_kab: (row['Kota/Kabupaten'] || row['kota_kab'] || "").toString(),
      status: (row['Status Warga'] || row['status'] || "Warga Tetap").toString(),
      hp: (row['No. HP (WA)'] || row['hp'] || "").toString(),
      email: (row['Email'] || row['email'] || "").toString(),
      foto: row['Foto Profil'] || "",
      ktpUrl: row['Foto KTP'] || "",
      tglDaftar: new Date().toISOString().split('T')[0]
    }));

    try {
      const batchSize = 400;
      for (let i = 0; i < newData.length; i += batchSize) {
        const chunk = newData.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docId = `${tenantId}_${item.nik}`;
          const docRef = doc(db, 'data_warga', docId);
          batch.set(docRef, item);
        });
        await batch.commit();
      }
      showNotification(`Berhasil mengimpor ${newData.length} data warga.`, 'success');
    } catch (error: any) {
      console.error("Firebase Import Error Detail:", error);
      showNotification("Gagal sinkronisasi data ke Firebase: " + (error.message || error), 'error');
    }
  };

  const [formData, setFormData] = useState({
    nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", email: "", foto: "", ktpUrl: "", posisi: "", profesi: "", pendidikanTerakhir: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI", agama: "Islam"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'nik' || name === 'kk') {
      value = value.replace(/\D/g, '');
      if (value.length > 16) value = value.slice(0, 16);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nik && formData.nik.length !== 16) {
      showNotification("NIK harus terdiri dari tepat 16 digit angka.", 'error');
      return;
    }
    
    const newWarga = { ...formData, tenantId: tenantId, tglDaftar: new Date().toISOString().split('T')[0] };
    
    setIsLoadingDB(true);
    try {
      const docId = `${tenantId}_${newWarga.nik}`;
      await setDoc(doc(db, 'data_warga', docId), newWarga);
      setShowAddForm(false);
      resetForm();
      showNotification("Data warga berhasil ditambahkan!", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/data_warga/${newWarga.nik}`);
      showNotification("Gagal menambahkan data warga.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nik && formData.nik.length !== 16) {
      showNotification("NIK harus terdiri dari tepat 16 digit angka.", 'error');
      return;
    }

    setIsLoadingDB(true);
    try {
      const originalId = editingWarga.docId || `${tenantId}_${editingWarga.nik}`;
      const newId = `${tenantId}_${formData.nik}`;

      if (originalId !== newId) {
        await setDoc(doc(db, 'data_warga', newId), { ...formData, tenantId: tenantId });
        await deleteDoc(doc(db, 'data_warga', originalId));
      } else {
        await updateDoc(doc(db, 'data_warga', originalId), { ...formData, tenantId: tenantId });
      }

      setShowEditForm(false);
      setEditingWarga(null);
      resetForm();
      showNotification("Perubahan data warga berhasil disimpan!", 'success');
    } catch (error: any) {
      const targetId = editingWarga.docId || editingWarga.nik;
      handleFirestoreError(error, 'update', `/data_warga/${targetId}`);
      showNotification("Gagal memperbarui data warga.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    setIsDeletingWarga(true);
    try {
      const docId = wargaToDelete.docId || wargaToDelete.nik;
      await deleteDoc(doc(db, 'data_warga', docId));
      setWargaToDelete(null);
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/warga/${wargaToDelete.nik}`);
      showNotification("Gagal menghapus data warga.", 'error');
      setWargaToDelete(null);
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const startEdit = (warga: any) => {
    setEditingWarga(warga);
    setFormData(warga);
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", email: "", foto: "", ktpUrl: "", posisi: "", profesi: "", pendidikanTerakhir: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI", agama: "Islam"
    });
  };

  const foundRTs = Array.from(new Set(wargaData.map(w => w.rt))).filter(rt => rt).sort();
  const foundRWs = Array.from(new Set(wargaData.map(w => w.rw))).filter(rw => rw).sort();
  const uniqueRTs = ["Semua", ...(foundRTs.length > 0 ? foundRTs : Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0')))];
  const uniqueRWs = ["Semua", ...(foundRWs.length > 0 ? foundRWs : Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0')))];

  const filteredWargaData = useMemo(() => {
    return wargaData.filter(w => {
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
        } else {
          matchUmur = false;
        }
      }
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = searchQuery === "" || 
        w.nama?.toLowerCase().includes(searchLower) ||
        w.nik?.includes(searchQuery) ||
        w.kk?.includes(searchQuery) ||
        w.hp?.includes(searchQuery);

      return matchRT && matchRW && matchUmur && matchSearch;
    });
  }, [wargaData, filterRT, filterRW, filterKategoriUmur, searchQuery]);

  const totalPages = Math.ceil(filteredWargaData.length / itemsPerPage);
  const paginatedWarga = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWargaData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWargaData, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleExportExcel = () => {
    const dataToExport = filteredWargaData.map(w => ({
      'Nama Lengkap': w.nama || '',
      'NIK': w.nik || '',
      'No. KK': w.kk || '',
      'Agama': w.agama || '',
      'Tempat Lahir': w.tempatLahir || '',
      'Tgl Lahir': w.tglLahir || '',
      'Jenis Kelamin': w.jk || '',
      'Posisi Keluarga': w.posisi || '',
      'Profesi': w.profesi || '',
      'Pendidikan': w.pendidikanTerakhir || '',
      'Status Kawin': w.kawin || '',
      'Kewarganegaraan': w.kewarganegaraan || '',
      'RT': w.rt || '',
      'RW': w.rw || '',
      'Alamat/Blok': w.blok || '',
      'Kelurahan': w.kelurahan || '',
      'Kecamatan': w.kecamatan || '',
      'Kota/Kabupaten': w.kota_kab || '',
      'Status Warga': w.status || '',
      'No. HP (WA)': w.hp || '',
      'Email': w.email || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Warga");
    XLSX.writeFile(wb, `Data_Warga_Lengkap_${tenantId}.xlsx`);
    showNotification('Data berhasil diekspor ke Excel', 'success');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    filteredWargaData.forEach((warga, index) => {
      if (index > 0) doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BIODATA WARGA", pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`SMART RW - ${tenantId}`, pageWidth / 2, 26, { align: 'center' });
      doc.line(14, 30, pageWidth - 14, 30);

      let currentY = 40;
      const fields = [
        { label: "Nama Lengkap", value: warga.nama },
        { label: "NIK", value: warga.nik },
        { label: "No. KK", value: warga.kk },
        { label: "Tempat Lahir", value: warga.tempatLahir },
        { label: "Tanggal Lahir", value: warga.tglLahir },
        { label: "Jenis Kelamin", value: warga.jk },
        { label: "Agama", value: warga.agama },
        { label: "Profesi", value: warga.profesi },
        { label: "Pendidikan", value: warga.pendidikanTerakhir },
        { label: "Status Kawin", value: warga.kawin },
        { label: "Kewarganegaraan", value: warga.kewarganegaraan },
        { label: "Posisi Keluarga", value: warga.posisi },
        { label: "Status Warga", value: warga.status },
        { label: "RT / RW", value: `${warga.rt || '-'} / ${warga.rw || '-'}` },
        { label: "Alamat", value: warga.blok },
        { label: "Kelurahan", value: warga.kelurahan },
        { label: "Kecamatan", value: warga.kecamatan },
        { label: "Kota/Kabupaten", value: warga.kota_kab },
        { label: "No. HP (WA)", value: warga.hp },
        { label: "Email", value: warga.email },
      ];

      doc.setFontSize(10);
      fields.forEach((field) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${field.label}`, 14, currentY);
        doc.setFont("helvetica", "normal");
        const val = field.value || '-';
        doc.text(`: ${val}`, 55, currentY);
        currentY += 8;
      });

      currentY += 20;
      doc.setFontSize(10);
      doc.text("Ketua RT / RW", 140, currentY);
      doc.text("( ____________________ )", 135, currentY + 25);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 285);
      doc.setTextColor(0);
    });
    doc.save(`Biodata_Warga_Lengkap_${tenantId}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative print:border-none print:shadow-none print:overflow-visible">
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:justify-between lg:items-center bg-white print:hidden gap-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Data Warga
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama/NIK/KK/HP..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-48 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Filter:</span>
              <select 
                value={filterRW}
                onChange={(e) => { setFilterRW(e.target.value); setCurrentPage(1); }}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {uniqueRWs.map(rw => <option key={`rw-${rw}`} value={rw}>{rw === 'Semua' ? 'RW' : 'RW ' + rw}</option>)}
              </select>
              <select 
                value={filterRT}
                onChange={(e) => { setFilterRT(e.target.value); setCurrentPage(1); }}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {uniqueRTs.map(rt => <option key={`rt-${rt}`} value={rt}>{rt === 'Semua' ? 'RT' : 'RT ' + rt}</option>)}
              </select>
              <select 
                value={filterKategoriUmur}
                onChange={(e) => { setFilterKategoriUmur(e.target.value); setCurrentPage(1); }}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Semua">Usia</option>
                <option value="Balita">Balita (0-5)</option>
                <option value="Remaja">Remaja (6-17)</option>
                <option value="Dewasa">Dewasa (18-59)</option>
                <option value="Lansia">Lansia ({'>'}= 60)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button onClick={handleExportPDF} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm" title="Download PDF">
                <Download className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden xl:inline">PDF</span>
              </button>
              <button onClick={handleExportExcel} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm" title="Download Excel">
                <Download className="w-3.5 h-3.5 text-green-600" />
                <span className="hidden xl:inline">Excel</span>
              </button>
              {userRole !== 'Viewer' && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    title="Upload Data"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden xl:inline">Upload</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportFile} 
                    accept=".csv, .xlsx, .xls" 
                    className="hidden" 
                  />
                  {selectedWargaIds.length > 0 && (
                    <button 
                      onClick={handleBulkDelete}
                      disabled={isDeletingWarga}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ring-2 ring-red-400 ring-offset-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeletingWarga ? 'Menghapus...' : `Hapus (${selectedWargaIds.length})`}</span>
                    </button>
                  )}
                  {docsToDelete.length > 0 && (
                    <button 
                      onClick={handleCleanupDuplicates}
                      disabled={isCleaning}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                      title={`Ada ${docsToDelete.length} data ganda`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isCleaning ? 'Membersihkan...' : `Bersihkan (${docsToDelete.length})`}</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                    className="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block p-4 mb-4 text-center border-b-2 border-slate-800">
        <h2 className="text-xl font-bold text-slate-900">DATA WARGA - {tenantId}</h2>
        <p className="text-sm text-slate-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-sm print:text-xs">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider print:bg-white print:text-slate-800 print:border-b-2 print:border-slate-800">
            <tr>
              <th className="px-6 py-3 print:px-2">
                <input 
                  type="checkbox" 
                  checked={selectedWargaIds.length > 0 && selectedWargaIds.length === filteredWargaData.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 print:px-2">Nama Lengkap</th>
              <th className="px-6 py-3 print:px-2">NIK & No. KK</th>
              <th className="px-6 py-3 print:px-2">Tempat/Tgl Lahir</th>
              <th className="px-6 py-3 print:px-2">JK</th>
              <th className="px-6 py-3 print:px-2">Agama</th>
              <th className="px-6 py-3 print:px-2">Posisi</th>
              <th className="px-6 py-3 print:px-2 text-center">RT/RW</th>
              <th className="px-6 py-3 print:px-2">Alamat</th>
              <th className="px-6 py-3 text-center print:px-2">Status</th>
              <th className="px-6 py-3 text-right print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
            {paginatedWarga.length > 0 ? paginatedWarga.map((warga, idx) => (
              <tr key={warga.docId || warga.nik || idx} className="hover:bg-slate-50 transition-colors print:break-inside-avoid whitespace-nowrap">
                <td className="px-6 py-3 print:px-2">
                  <input 
                    type="checkbox" 
                    checked={selectedWargaIds.includes(warga.docId)}
                    onChange={() => toggleSelectWarga(warga.docId)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-3 font-semibold text-slate-800 print:px-2">
                  <div className="flex items-center gap-1.5">
                    {warga.nama}
                    {warga.terverifikasi && (
                      <div className="bg-green-100 text-green-600 p-0.5 rounded-full" title="Terverifikasi Mandiri">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">
                  <div className="font-mono text-slate-700">{warga.nik || '-'}</div>
                  <div className="font-mono text-slate-400">KK: {warga.kk || '-'}</div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">
                  <div>{warga.tempatLahir || '-'}, {warga.tglLahir || '-'}</div>
                  <div className="text-[10px] text-slate-400">Umur: {calculateAge(warga.tglLahir)}</div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.jk}</td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.agama || '-'}</td>
                <td className="px-6 py-3 text-xs text-slate-500 font-medium print:px-2">{warga.posisi}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 text-center">{warga.rt}/{warga.rw}</td>
                <td className="px-6 py-3 text-xs print:px-2">{warga.blok}</td>
                <td className="px-6 py-3 text-center print:px-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${warga.status === 'Warga Tetap' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'} print:border-0 print:p-0 print:bg-transparent print:text-slate-800`}>
                    {warga.status}
                  </span>
                </td>
                {userRole !== 'Viewer' && (
                  <td className="px-6 py-3 text-right print:hidden">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => setViewWarga(warga)} className="text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => startEdit(warga)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      {(userRole === 'ADMIN' || userRole === 'RT' || userRole === 'Admin') && (
                        <button onClick={() => setWargaToDelete(warga)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={11} className="px-6 py-8 text-center text-slate-500 text-xs font-medium">
                  Oops, data warga tidak ditemukan untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 bg-slate-50 print:hidden gap-3">
        <div className="flex items-center gap-3">
          <p>Menampilkan {paginatedWarga.length > 0 ? startIndex + 1 : 0} - {startIndex + paginatedWarga.length} dari {filteredWargaData.length} warga</p>
          <div className="flex items-center gap-1.5">
            <span>Tampilkan:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[10, 25, 50, 100, 500].map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 text-slate-600 font-medium disabled:opacity-50 transition-colors">Sebelumnya</button>
           <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 text-slate-600 font-medium disabled:opacity-50 transition-colors">Selanjutnya</button>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{showAddForm ? 'Tambah Data Warga' : 'Edit Data Warga'}</h3>
              <button onClick={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form className="p-4 space-y-4 overflow-y-auto" onSubmit={showAddForm ? handleAddSubmit : handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">NIK</label>
                  <input required name="nik" value={formData.nik} onChange={handleInputChange} type="text" minLength={16} maxLength={16} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">No. KK</label>
                  <input required name="kk" value={formData.kk} onChange={handleInputChange} type="text" minLength={16} maxLength={16} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                <input required name="nama" value={formData.nama} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tempat Lahir</label>
                  <input required name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal Lahir</label>
                  <input required name="tglLahir" value={formData.tglLahir} onChange={handleInputChange} type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Kelamin</label>
                  <select required name="jk" value={formData.jk} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Agama</label>
                  <select required name="agama" value={formData.agama} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Budha">Budha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">RT</label>
                  <input required name="rt" value={formData.rt} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">RW</label>
                  <input required name="rw" value={formData.rw} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat/Blok</label>
                <input required name="blok" value={formData.blok} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">{showAddForm ? 'Simpan' : 'Perbarui'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profil Warga Detail Modal */}
      <AnimatePresence>
        {viewWarga && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Detail Profil</h3>
                <button onClick={() => setViewWarga(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {viewWarga.foto ? <img src={viewWarga.foto} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-slate-300" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{viewWarga.nama}</h2>
                    <p className="text-sm text-slate-500">{viewWarga.nik}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div><p className="text-[10px] uppercase font-bold text-slate-400">KK</p><p className="font-medium text-slate-800">{viewWarga.kk || '-'}</p></div>
                   <div><p className="text-[10px] uppercase font-bold text-slate-400">Umur</p><p className="font-medium text-slate-800">{calculateAge(viewWarga.tglLahir)} Tahun</p></div>
                   <div><p className="text-[10px] uppercase font-bold text-slate-400">RT/RW</p><p className="font-medium text-slate-800">{viewWarga.rt}/{viewWarga.rw}</p></div>
                   <div><p className="text-[10px] uppercase font-bold text-slate-400">Status</p><p className="font-medium text-slate-800">{viewWarga.status}</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wargaToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Data Warga"
            message={`Apakah Anda yakin ingin menghapus data "${wargaToDelete?.nama}"?`}
            onConfirm={handleDeleteWarga}
            onCancel={() => setWargaToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeletingWarga}
            type="danger"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
