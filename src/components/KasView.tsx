import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, PlusCircle, Download, Upload, FileText, 
  X, ArrowUpRight, ArrowDownLeft, Wallet, Filter, 
  Trash2, Search 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import ConfirmModal from './ConfirmModal';

export default function KasView({ 
  kasData, setKasData, iuranData, setIuranData, wargaData = [], 
  userRole, tenantId, setIsLoadingDB, handleFirestoreError, 
  handleFileUpload, showNotification, getSetting 
}: { 
  kasData: any[], 
  setKasData: any, 
  iuranData: any[], 
  setIuranData: any, 
  wargaData?: any[], 
  userRole: string, 
  tenantId: string, 
  setIsLoadingDB: any, 
  handleFirestoreError: any, 
  handleFileUpload: any, 
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void,
  getSetting: (k: string) => any
}) {
  const [showMasukForm, setShowMasukForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [strukUrl, setStrukUrl] = useState("");
  const [trxType, setTrxType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [kasToDelete, setKasToDelete] = useState<any>(null);
  const [isDeletingKas, setIsDeletingKas] = useState(false);

  useEffect(() => {
    if (!showMasukForm) {
      setStrukUrl("");
    }
  }, [showMasukForm]);
  
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const years = [2024, 2025, 2026, 2027];

  const handleDeleteKas = async () => {
    if (!kasToDelete) return;
    setIsDeletingKas(true);
    try {
      await deleteDoc(doc(db, 'kas', kasToDelete.id));
      setKasData((prev: any[]) => prev.filter(t => t.id !== kasToDelete.id));
      setKasToDelete(null);
      showNotification("Catatan kas berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/kas/\${kasToDelete.id}`);
      setKasToDelete(null);
    } finally {
      setIsDeletingKas(false);
    }
  };

  const handleAddPemasukan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newId = `TRX-\${Date.now()}`;
    let nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    
    if (nominal === 0 && trxType === 'Masuk') {
      const defaultNominalRaw = getSetting("NOMINAL_IURAN");
      const defaultNominal = parseInt(defaultNominalRaw ? defaultNominalRaw.toString().replace(/\D/g, '') : "0");
      if (defaultNominal) nominal = defaultNominal;
    }
    
    const transaksi = formData.get('transaksi') as string;
    
    const newTrx = {
      tenantId: tenantId,
      id: newId,
      tanggal: formattedDate,
      tipe: trxType,
      transaksi: transaksi,
      nama: formData.get('nama') as string,
      alamat: formData.get('alamat') as string || "-",
      keterangan: formData.get('keterangan') as string,
      debit: trxType === 'Masuk' ? nominal : 0,
      kredit: trxType === 'Keluar' ? nominal : 0,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'kas', newId), newTrx);

      if (trxType === 'Masuk' && (transaksi === 'Iuran Warga')) {
        const formattedDateTime = formattedDate + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        const newIuran = {
          tenantId: tenantId,
          id: `INV-\${Date.now()}-IUR`,
          tanggal: formattedDateTime,
          transaksi: formData.get('transaksi') as string,
          nama: formData.get('nama') as string,
          alamat: formData.get('alamat') as string || "-",
          periode: "Umum",
          nominal: nominal,
          status: "Lunas",
          keterangan: formData.get('keterangan') as string || "-",
          strukUrl: strukUrl
        };
        await setDoc(doc(db, 'iuran', newIuran.id), newIuran);
        setIuranData([newIuran, ...iuranData]);
      }

      setKasData([newTrx, ...kasData]);
      setShowMasukForm(false);
      showNotification(`\${trxType === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'} berhasil disimpan.`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/kas/\${newId}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  let cumulativeBalance = 0;
  const processedData = [...kasData].sort((a, b) => {
    const dateA = new Date(a.tanggal);
    const dateB = new Date(b.tanggal);
    return dateA.getTime() - dateB.getTime();
  }).map(trx => {
    cumulativeBalance = cumulativeBalance + (trx.debit || 0) - (trx.kredit || 0);
    return { ...trx, saldoAkhir: cumulativeBalance };
  });

  const monthShorts = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const filteredData = processedData.filter(trx => {
    const dateStr = trx.tanggal; // e.g. "28 Apr 2026"
    const parts = dateStr.split(' ');
    if (parts.length < 3) return false;
    const monthStr = parts[1];
    const yearStr = parts[2];
    
    const mIdx = monthShorts.indexOf(monthStr);
    const matchesMonth = selectedMonth === -1 || mIdx === selectedMonth;
    const matchesYear = yearStr === selectedYear.toString();
    
    return matchesMonth && matchesYear;
  }).reverse();

  const totalPemasukan = filteredData.reduce((sum, trx) => sum + (trx.debit || 0), 0);
  const totalPengeluaran = filteredData.reduce((sum, trx) => sum + (trx.kredit || 0), 0);
  const saldoTotal = processedData.length > 0 ? processedData[processedData.length - 1].saldoAkhir : 0;

  const handleExportExcelKas = () => {
    const headers = ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Nama', 'Keterangan', 'Debit', 'Kredit', 'Saldo'];
    const rows = filteredData.map(trx => 
      [trx.id, trx.tanggal, trx.tipe, `"\${trx.transaksi}"`, `"\${trx.nama}"`, `"\${trx.keterangan || ''}"`, trx.debit, trx.kredit, trx.saldoAkhir].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Laporan_Kas_\${selectedMonth === -1 ? 'Semua' : months[selectedMonth]}_\${selectedYear}.csv`;
    link.click();
  };

  const handleExportPDFKas = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`LAPORAN KAS - \${selectedMonth === -1 ? 'SEMUA BULAN' : months[selectedMonth].toUpperCase()} \${selectedYear}`, 14, 15);
    const tableColumn = ["ID", "Tanggal", "Tipe", "Kategori", "Debit", "Kredit", "Saldo"];
    const tableRows = filteredData.map(trx => [
      trx.id, trx.tanggal, trx.tipe, trx.transaksi, trx.debit, trx.kredit, trx.saldoAkhir
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    doc.save(`Laporan_Kas_\${selectedYear}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Kas Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                 <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saldo Total</span>
           </div>
           <p className="text-2xl font-black text-slate-900 tracking-tighter">Rp {new Intl.NumberFormat('id-ID').format(saldoTotal)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                 <ArrowUpRight className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pemasukan</span>
           </div>
           <p className="text-2xl font-black text-emerald-600 tracking-tighter">Rp {new Intl.NumberFormat('id-ID').format(totalPemasukan)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                 <ArrowDownLeft className="w-6 h-6 text-rose-600" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pengeluaran</span>
           </div>
           <p className="text-2xl font-black text-rose-600 tracking-tighter">Rp {new Intl.NumberFormat('id-ID').format(totalPengeluaran)}</p>
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-white/50 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Aliran Dana Kas</h3>
              <div className="flex gap-2">
                 <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20">
                    <option value={-1}>Semua Bulan</option>
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                 </select>
                 <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="flex gap-2">
              {userRole !== 'Viewer' && (
                <>
                  <button onClick={() => { setTrxType('Masuk'); setShowMasukForm(true); }} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Pemasukan
                  </button>
                  <button onClick={() => { setTrxType('Keluar'); setShowMasukForm(true); }} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Pengeluaran
                  </button>
                </>
              )}
              <div className="flex bg-slate-50 p-1 rounded-xl">
                 <button onClick={handleExportExcelKas} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white transition-all"><Download className="w-4 h-4"/></button>
                 <button onClick={handleExportPDFKas} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-all"><FileText className="w-4 h-4"/></button>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                 <tr>
                    <th className="px-8 py-5">Info</th>
                    <th className="px-8 py-5">Kategori & Nama</th>
                    <th className="px-8 py-5 text-right">Debit</th>
                    <th className="px-8 py-5 text-right">Kredit</th>
                    <th className="px-8 py-5 text-right">Saldo</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredData.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/30 transition-colors">
                       <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                             <p className="text-[11px] font-black text-slate-800 leading-tight">{trx.id}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trx.tanggal}</p>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                             <p className="text-[11px] font-black text-slate-900 leading-tight">{trx.transaksi}</p>
                             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter truncate max-w-[150px]">{trx.nama}</p>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right font-mono font-black text-emerald-600 text-[11px]">
                          {trx.debit > 0 ? `+ Rp ${new Intl.NumberFormat('id-ID').format(trx.debit)}` : '-'}
                       </td>
                       <td className="px-8 py-5 text-right font-mono font-black text-rose-600 text-[11px]">
                          {trx.kredit > 0 ? `- Rp ${new Intl.NumberFormat('id-ID').format(trx.kredit)}` : '-'}
                       </td>
                       <td className="px-8 py-5 text-right font-mono font-black text-slate-900 text-[11px]">
                          Rp {new Intl.NumberFormat('id-ID').format(trx.saldoAkhir)}
                       </td>
                       <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                             {trx.strukUrl && (
                               <a href={trx.strukUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white transition-all">
                                 <FileText className="w-4 h-4" />
                               </a>
                             )}
                             {userRole !== 'Viewer' && (
                               <button onClick={() => setKasToDelete(trx)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-white transition-all">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {showMasukForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-slate-100">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Catat {trxType}</h4>
                 <button onClick={() => setShowMasukForm(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleAddPemasukan} className="p-8 space-y-5 overflow-y-auto">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Kategori Transaksi</label>
                    <select name="transaksi" required className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20">
                       <option value="Iuran Warga">Iuran Warga</option>
                       <option value="Sumbangan Sosial">Sumbangan Sosial</option>
                       <option value="Operasional Kantor">Operasional Kantor</option>
                       <option value="Perbaikan Infrastruktur">Perbaikan Infrastruktur</option>
                       <option value="Lain-lain">Lain-lain</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Penyetor / Penerima</label>
                    <input name="nama" required placeholder="Nama" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Tanggal</label>
                       <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Nominal (Rp)</label>
                       <input name="nominal" required type="number" placeholder="50.000" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 font-mono" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Unggah Bukti (Pilihan)</label>
                    <div className="relative group">
                       <input 
                         type="file" 
                         accept="image/*" 
                         onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             try {
                               const url = await handleFileUpload(file, 'struk_kas');
                               setStrukUrl(url);
                               showNotification("Bukti berhasil diunggah", "success");
                             } catch (err) {
                               showNotification("Gagal mengunggah bukti.", "error");
                             }
                           }
                         }}
                         className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                       />
                       <div className="w-full px-5 py-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between group-hover:bg-blue-100 transition-all">
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{strukUrl ? 'BERHASIL' : 'AMBIL FOTO / FILE'}</span>
                          <Upload className="w-4 h-4 text-blue-400" />
                       </div>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 mt-4">Simpan {trxType}</button>
              </form>
           </motion.div>
        </div>
      )}

      {kasToDelete && (
        <ConfirmModal 
          isOpen={true}
          title="Hapus Catatan"
          message={`Hapus catatan kas "${kasToDelete.transaksi}"? Data tidak dapat dipulihkan.`}
          onConfirm={handleDeleteKas}
          onCancel={() => setKasToDelete(null)}
          isLoading={isDeletingKas}
        />
      )}
    </div>
  );
}
