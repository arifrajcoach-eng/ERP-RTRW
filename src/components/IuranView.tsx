import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  PlusCircle, Upload, Download, FileText, Edit, Trash2, MessageCircle, X, CreditCard 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { formatRupiah } from '../utils/helpers';
import ConfirmModal from './ConfirmModal';

interface IuranViewProps {
  iuranData: any[];
  setIuranData: any;
  kasData: any[];
  setKasData: any;
  wargaData?: any[];
  userRole: string;
  tenantId: string;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  handleFileUpload: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

function PaymentModal({ amount, onClose, onConfirm }: { amount: number, onClose: () => void, onConfirm: (method: string) => void }) {
  const [method, setMethod] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <h3 className="text-2xl font-black mb-2 text-slate-800">Pembayaran Digital</h3>
        <p className="text-slate-600 mb-6">Total Tagihan: <span className="font-bold text-blue-600 font-mono">{formatRupiah(amount)}</span></p>
        
        <div className="space-y-3 mb-8">
          <button onClick={() => setMethod('QRIS')} className={`w-full p-4 border rounded-xl flex items-center justify-between ${method === 'QRIS' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
            <span className="font-bold">QRIS (E-Wallet)</span>
            <div className={`w-5 h-5 rounded-full border-2 ${method === 'QRIS' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
          </button>
          <button onClick={() => setMethod('VA')} className={`w-full p-4 border rounded-xl flex items-center justify-between ${method === 'VA' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
            <span className="font-bold">Virtual Account (Bank)</span>
            <div className={`w-5 h-5 rounded-full border-2 ${method === 'VA' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
          </button>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Batal</button>
          <button 
            disabled={!method}
            onClick={() => onConfirm(method)} 
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IuranView({
  iuranData, setIuranData, kasData, setKasData, wargaData = [],
  userRole, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification
}: IuranViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrx, setEditingTrx] = useState<any>(null);
  const [trxType, setTrxType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [trxToDelete, setTrxToDelete] = useState<any>(null);
  const [isDeletingTrx, setIsDeletingTrx] = useState(false);
  const [strukUrl, setStrukUrl] = useState("");
  const [showPaymentId, setShowPaymentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showAddForm) {
      setStrukUrl("");
    } else if (editingTrx) {
      setStrukUrl(editingTrx.strukUrl || "");
    }
  }, [showAddForm, editingTrx]);

  const handleDeleteTransaction = async () => {
    if (!trxToDelete) return;
    setIsDeletingTrx(true);
    try {
      await deleteDoc(doc(db, 'iuran', trxToDelete.id));
      setIuranData((prev: any[]) => prev.filter(t => t.id !== trxToDelete.id));
      setTrxToDelete(null);
      showNotification("Data berhasil dihapus dari sistem.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/iuran/${trxToDelete.id}`);
      setTrxToDelete(null);
    } finally {
      setIsDeletingTrx(false);
    }
  };

  const handlePrintKwitansi = (trx: any) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(20);
    doc.text("KWITANSI PEMBAYARAN", 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`PROJECT - ${tenantId}`, 105, 30, { align: 'center' });
    doc.line(10, 35, 200, 35);
    doc.setFontSize(10);
    doc.text(`No: ${trx.id}`, 180, 10);
    doc.setFontSize(12);
    let y = 50;
    const drawRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`: ${value}`, 60, y);
      y += 10;
    };
    drawRow("Telah Terima Dari", trx.nama);
    drawRow("Untuk Pembayaran", trx.transaksi);
    drawRow("Periode", trx.periode);
    drawRow("Keterangan", trx.keterangan || '-');
    drawRow("Tanggal", trx.tanggal);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.rect(20, y, 90, 15);
    doc.text(formatRupiah(trx.nominal), 25, y + 10);
    y += 40;
    doc.setFontSize(12);
    doc.text("Penyetor", 40, y);
    doc.text("Penerima / Bendahara", 150, y, { align: 'center' });
    y += 30;
    doc.text(`( ${trx.nama} )`, 40, y);
    doc.text("( ..................... )", 150, y, { align: 'center' });
    doc.save(`Kwitansi_${trx.id}.pdf`);
  };

  const notifyIuranViaWA = (trx: any) => {
    const message = `*KONFIRMASI PEMBAYARAN - ${tenantId}*%0A%0A` +
      `Halo ${trx.nama},%0A` +
      `Pembayaran Anda telah kami verifikasi:%0A%0A` +
      `📜 *No Kwitansi:* ${trx.id}%0A` +
      `📦 *Transaksi:* ${trx.transaksi}%0A` +
      `💰 *Nominal:* ${formatRupiah(trx.nominal)}%0A` +
      `📅 *Tanggal:* ${trx.tanggal}%0A` +
      `✅ *Status:* BERHASIL%0A%0A` +
      `Terima kasih!`;
    const waUrl = `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
    showNotification("Notifikasi WhatsApp disiapkan.");
  };

  const handleEditTransaction = (trx: any) => {
    setEditingTrx(trx);
    setTrxType(trx.tipe === 'Kredit' ? 'Keluar' : 'Masuk');
    setShowAddForm(true);
  };

  const handleImportFileIuran = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        processImportedIuranData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedIuranData(results.data);
        },
        error: (error) => {
          console.error("CSV Merge Error (Iuran):", error);
          showNotification("Gagal mengimpor data transaksi. Pastikan format CSV benar.", 'error');
        }
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedIuranData = async (data: any[]) => {
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedDateTime = formattedDate + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');

    const newData = data.map((row: any, idx: number) => ({
      tenantId: tenantId,
      id: row['ID Bayar'] || row['id'] || `INV-IMP-${Date.now()}-${idx}`,
      tanggal: row['Tanggal'] || row['tanggal'] || formattedDateTime,
      transaksi: row['Transaksi'] || row['transaksi'] || "Iuran Lainnya",
      nama: row['Nama'] || row['nama'] || "Umum",
      tipe: row['Tipe'] || row['tipe'] || "Debit",
      periode: row['Periode'] || row['periode'] || "Apr 2026",
      nominal: parseInt(row['Nominal'] || row['nominal'] || row['amount'] || "0"),
      status: row['Status'] || row['status'] || "Lunas",
      keterangan: row['Keterangan'] || row['keterangan'] || "Import Data"
    }));

    if (newData.length > 0) {
      setIsLoadingDB(true);
      try {
        for (const item of newData) {
          await setDoc(doc(db, 'iuran', item.id), item);
        }
        setIuranData((prev: any) => [...newData, ...prev]);
        showNotification(`Berhasil mengimpor ${newData.length} data transaksi.`, 'success');
      } catch (error: any) {
        handleFirestoreError(error, 'create', '/iuran/import');
        showNotification("Gagal sinkronisasi data iuran ke Firebase.", 'error');
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      showNotification("Tidak ada data transaksi valid yang ditemukan.", 'info');
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedDateTime = formattedDate + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
    
    const nominalRaw = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const transaksi = formData.get('transaksi') as string;
    const nama = formData.get('nama') as string;
    const alamat = formData.get('alamat') as string || "-";
    const keterangan = formData.get('keterangan') as string || "-";
    const status = formData.get('status') as string;
    const periodeRaw = formData.get('periode') as string;
    const periodeDate = new Date(periodeRaw);
    const periode = periodeDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    const transactionId = editingTrx ? editingTrx.id : `INV-${dateObj.getFullYear().toString().slice(-2)}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${String(iuranData.length + 1).padStart(3, '0')}`;
    const warga = wargaData.find(w => w.nama === nama);
    const rt = warga?.rt || "";

    const newPayment = {
      tenantId: tenantId,
      id: transactionId,
      rt: rt,
      tanggal: editingTrx ? editingTrx.tanggal : formattedDateTime,
      transaksi: transaksi,
      nama: nama,
      alamat: alamat,
      tipe: trxType === 'Masuk' ? 'Debit' : 'Kredit',
      periode: periode,
      nominal: nominalRaw,
      status: status,
      keterangan: keterangan,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      if (editingTrx) {
        await updateDoc(doc(db, 'iuran', editingTrx.id), newPayment);
        setIuranData((prev: any[]) => prev.map(t => t.id === editingTrx.id ? newPayment : t));
        showNotification("Data berhasil diperbarui.", 'success');
      } else {
        await setDoc(doc(db, 'iuran', newPayment.id), newPayment);
        const newKasEntry = {
          tenantId: tenantId,
          id: `TRX-${Date.now()}`,
          tanggal: formattedDate,
          tipe: trxType,
          transaksi: transaksi,
          nama: nama,
          keterangan: keterangan,
          debit: trxType === 'Masuk' ? nominalRaw : 0,
          kredit: trxType === 'Keluar' ? nominalRaw : 0,
          strukUrl: strukUrl
        };
        await setDoc(doc(db, 'kas', newKasEntry.id), newKasEntry);
        setKasData([newKasEntry, ...kasData]);
        setIuranData([newPayment, ...iuranData]);
        showNotification(`${trxType === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat.`, 'success');
      }
    } catch (error: any) {
      handleFirestoreError(error, editingTrx ? 'update' : 'create', `/iuran/${editingTrx?.id || 'new'}`);
      showNotification(`Gagal menyimpan data ${trxType}.`, 'error');
    } finally {
      setIsLoadingDB(false);
      setShowAddForm(false);
      setEditingTrx(null);
      setTrxType('Masuk');
    }
  };

  const handleExportExcelIuran = () => {
    const headers = ['ID Bayar', 'Tanggal Waktu', 'Transaksi', 'Nama', 'Debit/ Kredit', 'Nominal', 'Status', 'Keterangan'];
    const rows = iuranData.map(trx => 
      [trx.id, `"${trx.tanggal}"`, trx.transaksi, trx.nama, trx.tipe || (trx.periode ? 'Debit' : '-'), trx.nominal, trx.status, `"${trx.keterangan}"`].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Transaksi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDFIuran = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Transaksi - ${tenantId}`, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["ID Bayar", "Tanggal", "Transaksi", "Nama", "Debit/ Kredit", "Nominal", "Status"];
    const tableRows = iuranData.map(trx => [
      trx.id,
      trx.tanggal.split(',')[0],
      trx.transaksi,
      trx.nama,
      trx.tipe || (trx.periode ? 'Debit' : '-'),
      formatRupiah(trx.nominal),
      trx.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`Laporan_Transaksi_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Catatan Transaksi
        </h3>
        <div className="flex flex-wrap gap-2">
          {userRole !== 'Viewer' && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleImportFileIuran} className="hidden" accept=".csv, .xlsx, .xls" />
              <button title="Upload" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold"><Upload className="w-3.5 h-3.5 text-blue-600" /> Upload</button>
              <button title="Excel" onClick={handleExportExcelIuran} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold"><Download className="w-3.5 h-3.5 text-green-600" /> Excel</button>
              <button title="PDF" onClick={handleExportPDFIuran} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold"><FileText className="w-3.5 h-3.5 text-red-500" /> PDF</button>
              <button 
                onClick={() => { setTrxType('Masuk'); setShowAddForm(true); }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" /> Catat
              </button>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">ID Bayar</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Transaksi</th>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3 text-right">Nominal</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {iuranData.map((trx, idx) => (
              <tr key={trx.id || `trx-${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-mono text-xs text-slate-500">{trx.id}</td>
                <td className="px-6 py-3 text-xs">{trx.tanggal}</td>
                <td className="px-6 py-3 text-xs font-semibold">{trx.transaksi}</td>
                <td className="px-6 py-3">{trx.nama}</td>
                <td className="px-6 py-3 text-right font-mono text-xs">{formatRupiah(trx.nominal)}</td>
                <td className="px-6 py-3 text-center">
                   <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${trx.status === 'Lunas' ? 'border-green-200 bg-green-50 text-green-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
                     {trx.status}
                   </span>
                </td>
                <td className="px-6 py-3 text-center whitespace-nowrap">
                   <div className="flex gap-1.5 justify-center">
                    {trx.status !== 'Lunas' && (
                       <button onClick={() => setShowPaymentId(trx.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">Bayar</button>
                    )}
                    <button onClick={() => handlePrintKwitansi(trx)} className="p-2 text-red-500 border border-slate-100 rounded-lg"><FileText className="w-4 h-4" /></button>
                    {userRole !== 'Viewer' && (
                      <>
                        <button onClick={() => handleEditTransaction(trx)} className="p-2 text-orange-600 border border-slate-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => notifyIuranViaWA(trx)} className="p-2 text-green-600 border border-slate-100 rounded-lg"><MessageCircle className="w-4 h-4" /></button>
                        <button onClick={() => setTrxToDelete(trx)} className="p-2 text-red-600 border border-slate-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPaymentId && iuranData.find(t => t.id === showPaymentId) && (
        <PaymentModal 
          amount={iuranData.find(t => t.id === showPaymentId).nominal} 
          onClose={() => setShowPaymentId(null)}
          onConfirm={(method) => {
            showNotification(`Memproses via ${method}...`, 'info');
            setShowPaymentId(null);
          }}
        />
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Catat Transaksi</h3>
              <button onClick={() => { setShowAddForm(false); setEditingTrx(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddPayment} className="p-5 overflow-y-auto space-y-4">
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Transaksi</label>
                  <select name="transaksi" defaultValue={editingTrx?.transaksi} required className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50">
                    <option value="Iuran Rutin Warga">Iuran Rutin Warga</option>
                    <option value="Donasi & Bantuan Sosial">Donasi & Bantuan Sosial</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama</label>
                  <input name="nama" defaultValue={editingTrx?.nama} required type="text" list="wargaListIuran" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal</label>
                    <input name="periode" required type="date" defaultValue={editingTrx?.periode ? new Date(editingTrx.periode).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal</label>
                    <input name="nominal" required type="number" defaultValue={editingTrx?.nominal || "20000"} className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-slate-50" />
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
                  <select name="status" defaultValue={editingTrx?.status || 'Lunas'} required className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50">
                    <option value="Lunas">Lunas</option>
                    <option value="Pending">Pending</option>
                  </select>
               </div>
               <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-bold border rounded-lg">Batal</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg">{editingTrx ? 'Update' : 'Simpan'}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {trxToDelete && (
        <ConfirmModal 
          isOpen={true}
          title="Hapus Transaksi"
          message={`Hapus transaksi "${trxToDelete.transaksi}"?`}
          onConfirm={handleDeleteTransaction}
          onCancel={() => setTrxToDelete(null)}
          confirmText="Hapus"
          isLoading={isDeletingTrx}
          type="danger"
        />
      )}

      <datalist id="wargaListIuran">
        {wargaData.map((w, idx) => <option key={idx} value={w.nama} />)}
      </datalist>
    </div>
  );
}
