import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Search, 
  PlusCircle, 
  Download, 
  Upload, 
  Printer, 
  Edit, 
  Trash2, 
  Eye, 
  Info, 
  CheckCircle2, 
  X, 
  Image, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { ConfirmModal } from './ui/ConfirmModal';

interface KasViewProps {
  kasData: any[];
  setKasData: React.Dispatch<React.SetStateAction<any[]>>;
  iuranData: any[];
  setIuranData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData?: any[];
  userRole: string;
  currentUser: any;
  getSetting: (key: string) => any;
  rtId?: string;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  handleFileUpload: (file: File, path: string) => Promise<string>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function KasView({ 
  kasData, 
  setKasData, 
  iuranData, 
  setIuranData, 
  wargaData = [], 
  userRole, 
  currentUser, 
  getSetting, 
  rtId, 
  tenantId, 
  setIsLoadingDB, 
  handleFirestoreError, 
  handleFileUpload, 
  showNotification 
}: KasViewProps) {
  const [showMasukForm, setShowMasukForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [strukUrl, setStrukUrl] = useState("");
  const [trxType, setTrxType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (!showMasukForm) {
      setStrukUrl("");
    }
  }, [showMasukForm]);
  
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const [years] = useState([2024, 2025, 2026, 2027]);
  const [kasToDelete, setKasToDelete] = useState<any>(null);
  const [editingKas, setEditingKas] = useState<any>(null);
  const [viewingKas, setViewingKas] = useState<any>(null);
  const [isDeletingKas, setIsDeletingKas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleImportFileKas = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        processImportedKasData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedKasData(results.data);
        },
        error: (error) => {
          console.error("CSV Import Error (Kas):", error);
          showNotification("Gagal mengimpor data kas. Pastikan format CSV benar.", 'error');
        }
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedKasData = async (data: any[]) => {
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newData = data.map((row: any, idx: number) => {
      const debit = parseInt(row['Debit'] || row['debit'] || row['Masuk'] || row['masuk'] || "0");
      const kredit = parseInt(row['Kredit'] || row['kredit'] || row['Keluar'] || row['keluar'] || "0");
      const tipe = debit > 0 ? "Masuk" : "Keluar";
      
      return {
        tenantId: tenantId,
        id: row['ID Transaksi'] || row['id'] || `TRX-IMP-${Date.now()}-${idx}`,
        tanggal: row['Tanggal'] || row['tanggal'] || formattedDate,
        tipe: row['Tipe'] || row['tipe'] || tipe,
        transaksi: row['Transaksi'] || row['transaksi'] || (debit > 0 ? "Pemasukan Lainnya" : "Pengeluaran Lainnya"),
        nama: row['Nama'] || row['nama'] || "Umum",
        keterangan: row['Keterangan'] || row['keterangan'] || "Import Data",
        debit: debit,
        kredit: kredit,
        strukUrl: ""
      };
    });

    if (newData.length > 0) {
      setIsLoadingDB(true);
      try {
        for (const item of newData) {
          await setDoc(doc(db, 'kas', item.id), item);
        }
        setKasData((prev: any) => [...newData, ...prev]);
        showNotification(`Berhasil mengimpor ${newData.length} data transaksi kas.`, 'success');
      } catch (error: any) {
        console.error("Firebase Import Error (Kas):", error);
        handleFirestoreError(error, 'create', '/kas/import');
        showNotification("Gagal sinkronisasi data kas ke Firebase.", 'error');
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      showNotification("Tidak ada data transaksi valid yang ditemukan.", 'info');
    }
  };

  const exportSingleTrxPDF = (trx: any) => {
    const doc = new jsPDF();
    const settings = getSetting("KOP_SURAT") || {};
    
    // Header
    doc.setFontSize(16);
    doc.text(settings.nama_organisasi || "RW26 BERJUANG", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(settings.alamat || "Laporan Transaksi", 105, 26, { align: 'center' });
    doc.line(20, 32, 190, 32);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI TRANSAKSI", 105, 45, { align: 'center' });

    // Data
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const startY = 60;
    const lineH = 8;
    
    const data = [
      ["ID Transaksi", trx.id],
      ["Tanggal", trx.tanggal],
      ["Tipe", trx.tipe],
      ["Kategori", trx.transaksi],
      ["Nama", trx.nama],
      ["Keterangan", trx.keterangan],
      ["Nominal", formatRupiah(trx.debit || trx.kredit)],
    ];

    data.forEach((row, i) => {
      doc.text(row[0], 30, startY + (i * lineH));
      doc.text(": " + row[1], 70, startY + (i * lineH));
    });

    doc.line(20, startY + (data.length * lineH) + 5, 190, startY + (data.length * lineH) + 5);
    
    // Footer
    const footerY = 150;
    doc.text("Dicetak pada: " + new Date().toLocaleString('id-ID'), 20, footerY);
    doc.text("Bendahara,", 150, footerY);
    doc.text("( ____________________ )", 150, footerY + 30);

    doc.save(`Bukti_${trx.id}.pdf`);
    showNotification("PDF Berhasil diunduh");
  };

  const handleDeleteKas = async () => {
    if (!kasToDelete) return;
    
    setIsDeletingKas(true);
    try {
      await deleteDoc(doc(db, 'kas', kasToDelete.id));

      // Sync delete with Iuran if linked
      if (kasToDelete.iuranId) {
        await deleteDoc(doc(db, 'iuran', kasToDelete.iuranId));
        setIuranData((prev: any[]) => prev.filter(i => i.id !== kasToDelete.iuranId));
      }
    
      setKasData((prev: any[]) => prev.filter(t => t.id !== kasToDelete.id));
      setKasToDelete(null);
      showNotification("Catatan kas berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/kas/${kasToDelete.id}`);
      showNotification("Gagal menghapus catatan kas.", 'error');
      setKasToDelete(null);
    } finally {
      setIsDeletingKas(false);
    }
  };

  const handleSaveKas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newId = editingKas ? editingKas.id : `TRX-${Date.now()}`;
    let nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    
    const transaksi = formData.get('transaksi') as string;
    const nama = formData.get('nama') as string;
    const keterangan = formData.get('keterangan') as string;
    
    const newTrx = {
      tenantId: tenantId,
      rt: currentUser?.rt || '01',
      id: newId,
      tanggal: editingKas ? editingKas.tanggal : formattedDate,
      tipe: trxType,
      transaksi: transaksi,
      nama: nama,
      alamat: formData.get('alamat') as string || "-",
      keterangan: keterangan,
      debit: trxType === 'Masuk' ? nominal : 0,
      kredit: trxType === 'Keluar' ? nominal : 0,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      if (editingKas) {
        await updateDoc(doc(db, 'kas', editingKas.id), newTrx);
        setKasData((prev: any[]) => prev.map(t => t.id === editingKas.id ? newTrx : t));
        showNotification("Transaksi kas berhasil diperbarui", "success");
      } else {
        await setDoc(doc(db, 'kas', newId), newTrx);
        setKasData((prev: any[]) => [newTrx, ...prev]);
        showNotification("Transaksi kas berhasil ditambahkan", "success");
      }
      setShowMasukForm(false);
      setEditingKas(null);
    } catch (error: any) {
      handleFirestoreError(error, editingKas ? 'update' : 'create', `/kas/${newId}`);
      showNotification("Gagal menyimpan transaksi kas", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const currentMonthTransactions = kasData.filter(t => {
    // Assuming t.tanggal is formatted like "01 Jan 2026"
    // This part might need better parsing but let's keep original logic
    const matchesYear = t.tanggal.includes(selectedYear);
    const monthStr = months[selectedMonth].substring(0, 3);
    const matchesMonth = t.tanggal.includes(monthStr);
    return matchesYear && matchesMonth;
  });

  const totalMasuk = currentMonthTransactions.reduce((acc, t) => acc + (t.debit || 0), 0);
  const totalKeluar = currentMonthTransactions.reduce((acc, t) => acc + (t.kredit || 0), 0);
  const saldo = totalMasuk - totalKeluar;

  return (
    <div className="space-y-6">
       {/* Dashboard Ringkasan Kas */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
             <TrendingUp className="w-24 h-24 text-green-600" />
           </div>
           <div className="flex flex-col relative z-10">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
               <span className="bg-green-500 w-1.5 h-3 rounded-full"></span>
               Pemasukan Bulan Ini
             </span>
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{formatRupiah(totalMasuk)}</h3>
             <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2.5 py-1 rounded-full">
               <ArrowUpRight className="w-3.5 h-3.5" />
               <span>Total Dana Masuk</span>
             </div>
           </div>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
             <TrendingDown className="w-24 h-24 text-red-600" />
           </div>
           <div className="flex flex-col relative z-10">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
               <span className="bg-red-500 w-1.5 h-3 rounded-full"></span>
               Pengeluaran Bulan Ini
             </span>
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{formatRupiah(totalKeluar)}</h3>
             <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 w-fit px-2.5 py-1 rounded-full">
               <ArrowDownRight className="w-3.5 h-3.5" />
               <span>Biaya & Operasional</span>
             </div>
           </div>
         </div>

         <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-100 overflow-hidden relative group text-white">
           <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
             <Wallet className="w-24 h-24" />
           </div>
           <div className="flex flex-col relative z-10">
             <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
               <span className="bg-white w-1.5 h-3 rounded-full"></span>
               Saldo Akhir Kas
             </span>
             <h3 className="text-2xl font-black tracking-tighter">{formatRupiah(saldo)}</h3>
             <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-white w-fit px-2.5 py-1 rounded-full">
               <Info className="w-3.5 h-3.5" />
               <span>{months[selectedMonth]} {selectedYear}</span>
             </div>
           </div>
         </div>
       </div>

       {/* Tabel Kas */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <span className="bg-blue-600 w-1.5 h-4 rounded-full"></span>
             Buku Kas RT / RW
           </h3>
           <div className="flex flex-wrap gap-2">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={() => { setTrxType('Masuk'); setShowMasukForm(true); }} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-blue-700 shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" /> Entri Kas
              </button>
           </div>
         </div>

         <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Tipe</th>
                <th className="px-5 py-4">Nama / Pihak</th>
                <th className="px-5 py-4">Transaksi & Keterangan</th>
                <th className="px-5 py-4 text-right">Debit (Masuk)</th>
                <th className="px-5 py-4 text-right">Kredit (Keluar)</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {currentMonthTransactions.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic font-bold">Tidak ada data transaksi di bulan ini.</td></tr>
              )}
              {currentMonthTransactions.map((trx: any, idx: number) => (
                <tr key={`kas-trx-${trx.id || idx}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-xs">{trx.tanggal}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${trx.tipe === 'Masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {trx.tipe}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-slate-800">{trx.nama}</div>
                    <div className="text-[10px] text-slate-400">{trx.alamat || '-'}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-blue-600 truncate max-w-[200px]">{trx.transaksi}</div>
                    <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]" title={trx.keterangan}>{trx.keterangan || '-'}</div>
                  </td>
                  <td className="px-5 py-3 text-right font-black text-green-600">
                    {trx.debit > 0 ? formatRupiah(trx.debit) : '-'}
                  </td>
                  <td className="px-5 py-3 text-right font-black text-red-600">
                    {trx.kredit > 0 ? formatRupiah(trx.kredit) : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-center shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); exportSingleTrxPDF(trx); }} className="p-1 px-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-600" title="Cetak Slip">
                        <Printer className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setEditingKas(trx); setTrxType(trx.tipe); setShowMasukForm(true); }} className="p-1 px-2 border border-slate-200 rounded hover:bg-blue-50 text-blue-600" title="Edit">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button onClick={() => setKasToDelete(trx)} className="p-1 px-2 border border-slate-200 rounded hover:bg-red-50 text-red-600" title="Hapus">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
       </div>

       {/* Form Modal */}
       <AnimatePresence>
         {showMasukForm && (
           <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-black text-slate-800 flex items-center gap-2">
                   <div className="p-2 bg-blue-600 text-white rounded-xl">
                      <Wallet className="w-4 h-4" />
                   </div>
                   {editingKas ? 'Edit Transaksi Kas' : 'Entri Kas Baru'}
                 </h3>
                 <button onClick={() => { setShowMasukForm(false); setEditingKas(null); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleSaveKas} ref={formRef} className="p-6 overflow-y-auto space-y-5">
                 <div className="p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setTrxType('Masuk')}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${trxType === 'Masuk' ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-slate-400'}`}
                    >
                      Pemasukan
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTrxType('Keluar')}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${trxType === 'Keluar' ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-slate-400'}`}
                    >
                      Pengeluaran
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal</label>
                      <input name="tanggal" type="date" defaultValue={editingKas ? new Date(editingKas.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
                      <input name="nominal" type="text" defaultValue={editingKas ? (editingKas.debit || editingKas.kredit) : ""} placeholder="0" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kategori Transaksi</label>
                   <input name="transaksi" type="text" defaultValue={editingKas?.transaksi || ""} placeholder={trxType === 'Masuk' ? 'Iuran Warga, Donasi, dll' : 'Perbaikan Fasum, Listrik, dll'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama / Pihak Kedua</label>
                      <input name="nama" type="text" defaultValue={editingKas?.nama || ""} placeholder="Bpk. Budi / Toko Maju" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">No. Rumah / Alamat</label>
                      <input name="alamat" type="text" defaultValue={editingKas?.alamat || ""} placeholder="Blok A No. 1" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keterangan Detail</label>
                   <textarea name="keterangan" defaultValue={editingKas?.keterangan || ""} rows={3} placeholder="Penjelasan rincian penggunaan/sumber dana..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Upload Bukti / Struk (Opsional)</label>
                   <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await handleFileUpload(file, 'kas_struk');
                                setStrukUrl(url);
                              } catch (err) {
                                showNotification("Gagal upload struk", "error");
                              }
                            }
                          }}
                          className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" 
                        />
                      </div>
                      {(strukUrl || editingKas?.strukUrl) && (
                        <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50">
                          <img src={strukUrl || editingKas?.strukUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                   </div>
                 </div>

                 <div className="flex gap-2 pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setShowMasukForm(false); setEditingKas(null); }}
                      className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className={`flex-[2] py-3 text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 text-white ${trxType === 'Masuk' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                    >
                      {editingKas ? 'Simpan Perubahan' : 'Catat Transaksi'}
                    </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Delete Confirm Modal */}
       <AnimatePresence>
        {kasToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Catatan Kas"
            message={`Apakah Anda yakin ingin menghapus catatan "${kasToDelete?.transaksi}" oleh "${kasToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={handleDeleteKas}
            onCancel={() => setKasToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeletingKas}
          />
        )}
       </AnimatePresence>
    </div>
  );
}
