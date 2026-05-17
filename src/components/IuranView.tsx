import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Users, 
  Search, 
  PlusCircle, 
  Download, 
  Image, 
  CheckCircle2, 
  X, 
  Upload, 
  QrCode, 
  Wallet, 
  Store, 
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  Printer
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface IuranViewProps {
  iuranData: any[];
  setIuranData: React.Dispatch<React.SetStateAction<any[]>>;
  kasData: any[];
  setKasData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData?: any[];
  userRole: string;
  currentUser: any;
  getSetting: (key: string) => any;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  handleFileUpload: (file: File, path: string) => Promise<string>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function IuranView({ 
  iuranData, 
  setIuranData, 
  kasData, 
  setKasData, 
  wargaData = [], 
  userRole, 
  currentUser, 
  getSetting, 
  tenantId, 
  setIsLoadingDB, 
  handleFirestoreError, 
  handleFileUpload, 
  showNotification 
}: IuranViewProps) {
  const isApt = getSetting("themeMode") === "apartemen";
  const [activeSubTab, setActiveSubTab] = useState<'pembayaran' | 'rekap'>('pembayaran');
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [buktiUrl, setBuktiUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jenisPembayaran, setJenisPembayaran] = useState('Iuran Warga');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaId, setSelectedWargaId] = useState<string>("");

  React.useEffect(() => {
    if (wargaData && wargaData.length > 0 && currentUser) {
      const u = wargaData.find(w => w.nik === currentUser.nik || w.id === currentUser.id_user || w.id === currentUser.uid);
      if (u) {
        setSelectedWargaId(u.docId || u.id || u.nik);
      }
    }
  }, [wargaData, currentUser]);
  
  // Simulated PG States
  const [showPgModal, setShowPgModal] = useState(false);
  const [pgStep, setPgStep] = useState(1);
  const [pgMethod, setPgMethod] = useState('');
  const [pgFormState, setPgFormState] = useState<any>(null);
  const [pgVirtualAccount, setPgVirtualAccount] = useState('');
  
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const years = [2024, 2025, 2026, 2027];

  const canApprove = (userRole?.toLowerCase() === 'admin' || 
                      userRole?.toLowerCase() === 'rw' || 
                      userRole?.toLowerCase() === 'rt' || 
                      userRole?.toLowerCase() === 'bendahara' || 
                      userRole?.toLowerCase() === 'super_admin' ||
                      userRole?.toLowerCase() === 'super admin' ||
                      currentUser?.isSuperAdmin);
  const isPengurus = canApprove;
  
  const sortedData = [...iuranData].sort((a: any, b: any) => {
    const dateA = new Date(a.tanggal || a.createdAt || 0).getTime();
    const dateB = new Date(b.tanggal || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const myTransactions = isPengurus ? sortedData : sortedData.filter((i: any) => i.nik === currentUser.nik || i.userId === currentUser.uid || i.userId === currentUser.id_user);
  
  const filteredTransactions = myTransactions.filter((i: any) => {
    const dateStr = i.tanggal || i.createdAt;
    if (!dateStr) return false;
    
    const d = new Date(dateStr);
    const matchesMonth = selectedMonth === -1 || d.getMonth() === selectedMonth;
    const matchesYear = d.getFullYear() === selectedYear;
    
    if (!matchesMonth || !matchesYear) return false;
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      i.namaPenyetor?.toLowerCase().includes(query) ||
      i.jenis?.toLowerCase().includes(query) ||
      i.keterangan?.toLowerCase().includes(query) ||
      i.nik?.toLowerCase().includes(query) ||
      i.alamat?.toLowerCase().includes(query)
    );
  });

  const [editingTrx, setEditingTrx] = useState<any>(null);
  const [viewingTrx, setViewingTrx] = useState<any>(null);

  const handleEdit = (trx: any) => {
    setEditingTrx(trx);
    setJenisPembayaran(trx.jenis);
    setBuktiUrl(trx.buktiUrl || '');
    
    // Find matching wargaId for the dropdown
    if (wargaData && wargaData.length > 0) {
      const matchingWarga = wargaData.find(w => 
        (trx.nik && w.nik === trx.nik) || 
        (trx.userId && (w.id === trx.userId || w.uid === trx.userId || w.docId === trx.userId)) ||
        (trx.namaPenyetor?.toLowerCase() === w.nama?.toLowerCase())
      );
      if (matchingWarga) {
        setSelectedWargaId(matchingWarga.docId || matchingWarga.id || matchingWarga.nik);
      } else {
        setSelectedWargaId("");
      }
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus transaksi ini secara permanen? Data di buku kas mungkin perlu disesuaikan secara manual.")) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'iuran', id));
      setIuranData(prev => prev.filter(t => t.id !== id));
      showNotification('Transaksi berhasil dihapus', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'delete', 'iuran');
      showNotification('Gagal menghapus transaksi', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleViewDetails = (trx: any) => {
    setViewingTrx(trx);
  };

  const handlePrint = (trx: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedNominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(trx.nominal);
    const dateStr = new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    printWindow.document.write(`
      <html>
        <head>
          <title>Bukti Pembayaran - ${trx.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .content { max-width: 600px; margin: 0 auto; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            .label { font-weight: bold; color: #64748b; font-size: 14px; }
            .value { font-weight: 600; color: #1e293b; }
            .amount { font-size: 24px; font-weight: 900; color: #3b82f6; text-align: center; margin: 30px 0; }
            .status { text-align: center; margin-top: 40px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SMART RW</h1>
            <p>Bukti Transaksi Digital Keuangan</p>
          </div>
          <div class="content">
            <div class="amount">${formattedNominal}</div>
            <div class="row"><span class="label">ID Transaksi</span><span class="value">${trx.id}</span></div>
            <div class="row"><span class="label">Tanggal</span><span class="value">${dateStr}</span></div>
            <div class="row"><span class="label">Penyetor</span><span class="value">${trx.namaPenyetor}</span></div>
            <div class="row"><span class="label">Alamat / NIK</span><span class="value">${trx.alamat} / ${trx.nik}</span></div>
            <div class="row"><span class="label">Jenis Pembayaran</span><span class="value">${trx.jenis}</span></div>
            <div class="row"><span class="label">Keterangan</span><span class="value">${trx.keterangan || '-'}</span></div>
            <div class="status" style="color: ${trx.status === 'Lunas' ? '#10b981' : '#f59e0b'}">${trx.status}</div>
          </div>
          <div class="footer">
            <p>Terima kasih telah melakukan pembayaran tepat waktu.<br/>Dokumen ini sah dihasilkan secara elektronik oleh Sistem SmartRW.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingTrx ? editingTrx.id : `IURAN-${Date.now()}`;
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const keterangan = formData.get('keterangan') as string;
    
    let nik = (currentUser?.nik || '-').toString();
    let nama = currentUser?.nama || currentUser?.name || "Anonim";
    let alamat = wargaData.find((w:any) => w.nik === nik)?.alamat || "-";
    let targetUserId = currentUser?.uid || currentUser?.id_user || null;
    
    if (isPengurus) {
      const selectedWargaIdFromForm = formData.get('wargaId') as string;
      const w = wargaData.find((warga:any) => warga.id === selectedWargaIdFromForm || warga.docId === selectedWargaIdFromForm || warga.nik === selectedWargaIdFromForm);
      if (w) {
        nik = (w.nik || '-').toString();
        nama = w.nama || "Anonim";
        alamat = w.alamat || "-";
        targetUserId = w.id || w.uid || w.id_user || null;
      } else {
        const inputNama = formData.get('namaPenyetor') as string;
        if (inputNama) nama = inputNama;
      }
    }

    const payload = JSON.parse(JSON.stringify({
      ...(editingTrx || {}),
      id,
      tenantId,
      rt: currentUser.rt || '01',
      tanggal: dateObj.toISOString(),
      jenis: jenisPembayaran,
      nominal,
      keterangan: keterangan || "",
      nik: nik || "-",
      namaPenyetor: nama || "Anonim",
      alamat: alamat || "-",
      buktiUrl: buktiUrl || "",
      status: editingTrx ? editingTrx.status : (isPengurus ? 'Lunas' : 'Menunggu Verifikasi'),
      userId: targetUserId || null,
      recordedBy: editingTrx?.recordedBy || currentUser.uid || currentUser.id_user || 'System',
      updatedAt: new Date().toISOString()
    }));

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'iuran', id), payload);
      setIuranData((prev: any) => {
        if (editingTrx) {
          return prev.map((item: any) => item.id === id ? payload : item);
        }
        if (prev.some((i: any) => i.id === id)) return prev;
        return [payload, ...prev];
      });
      
      // Auto create Kas if status is Lunas (only for new entries)
      if (payload.status === 'Lunas' && !editingTrx) {
        const kasId = `TRX-${Date.now()}`;
        const kasPayload = {
          id: kasId,
          tenantId,
          rt: payload.rt,
          tanggal: dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          tipe: 'Masuk',
          transaksi: payload.jenis,
          nama: payload.namaPenyetor,
          keterangan: payload.keterangan || `Pembayaran ${payload.jenis}`,
          debit: payload.nominal,
          kredit: 0,
          strukUrl: payload.buktiUrl,
          iuranId: id
        };
        await setDoc(doc(db, 'kas', kasId), kasPayload);
        setKasData((prev: any) => {
          if (prev.some((k:any) => k.id === kasId)) return prev;
          return [kasPayload, ...prev];
        });
      }
      
      showNotification(editingTrx ? 'Pembayaran berhasil diperbarui' : 'Pembayaran berhasil dicatat', 'success');
      setShowForm(false);
      setEditingTrx(null);
      setBuktiUrl('');
      setJenisPembayaran('Iuran Warga');
    } catch (e: any) {
      handleFirestoreError(e, editingTrx ? 'update' : 'create', 'iuran');
      showNotification(editingTrx ? 'Gagal memperbarui pembayaran' : 'Gagal mencatat pembayaran', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleStartPg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Get nominal from form using state or ref if possible, but let's just make it more robust
    const form = e.currentTarget.closest('form');
    if (!form) {
      showNotification("Sistem Error: Form tidak ditemukan", "error");
      return;
    }
    
    const formData = new FormData(form);
    const nominalString = formData.get('nominal') as string;
    const nominalRaw = parseInt(nominalString?.replace(/\D/g, '') || "0");
    const labelSakit = formData.get('nominal'); // debug
    
    // Validation
    if (!nominalRaw || nominalRaw < 10000) {
      showNotification("Nominal tidak valid. Minimal pembayaran online adalah Rp 10.000", "error");
      return;
    }

    const wargaId = formData.get('wargaId') as string;
    const namaPenyetor = formData.get('namaPenyetor') as string;
    
    if (isPengurus && !wargaId && !namaPenyetor) {
      showNotification("Harap pilih warga atau isi nama penyetor", "error");
      return;
    }

    setPgFormState({
      tanggal: formData.get('tanggal'),
      nominal: nominalRaw,
      jenis: formData.get('jenis'),
      keterangan: formData.get('keterangan'),
      wargaId,
      namaPenyetor
    });
    setPgStep(1);
    setPgMethod('');
    setShowPgModal(true);
  };

  const handlePgSuccess = async () => {
    const id = `IURAN-${Date.now()}`;
    const dateObj = (pgFormState.tanggal && !isNaN(new Date(pgFormState.tanggal).getTime())) ? new Date(pgFormState.tanggal) : new Date();
    
    let nik = currentUser.nik || currentUser.uid || currentUser.id_user;
    let nama = currentUser.nama || currentUser.name || "Warga";
    let alamat = currentUser.alamat || "-";
    let targetUserId = currentUser.uid || currentUser.id_user || null;

    if (isPengurus && pgFormState.wargaId) {
      const selectedWarga = wargaData.find((w:any) => w.id === pgFormState.wargaId || w.docId === pgFormState.wargaId || w.nik === pgFormState.wargaId);
      if (selectedWarga) {
        nik = selectedWarga.nik;
        nama = selectedWarga.nama;
        alamat = selectedWarga.alamat || selectedWarga.blok || "-";
        targetUserId = selectedWarga.id || selectedWarga.uid || selectedWarga.id_user || null;
      }
    } else if (isPengurus && pgFormState.namaPenyetor) {
      nama = pgFormState.namaPenyetor;
      nik = "-";
    }

    const payload = {
      id,
      tenantId,
      rt: currentUser.rt || '01',
      tanggal: dateObj.toISOString(),
      jenis: pgFormState.jenis,
      nominal: pgFormState.nominal,
      keterangan: pgFormState.keterangan || `Pembayaran ${pgFormState.jenis} (via ${pgMethod})`,
      nik,
      namaPenyetor: nama,
      alamat,
      buktiUrl: 'Sistem Payment Gateway TRIPAY',
      status: 'Lunas',
      userId: targetUserId,
      verifiedBy: 'Sistem',
      verifiedAt: new Date().toISOString()
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'iuran', id), payload);
      setIuranData((prev: any) => [payload, ...prev]);
      
      const kasId = `TRX-${Date.now()}`;
      const kasPayload = {
        id: kasId,
        tenantId,
        rt: payload.rt,
        tanggal: dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        tipe: 'Masuk',
        transaksi: payload.jenis,
        nama: payload.namaPenyetor,
        keterangan: payload.keterangan,
        debit: payload.nominal,
        kredit: 0,
        strukUrl: 'Sistem Payment Gateway TRIPAY',
        iuranId: id
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => [kasPayload, ...prev]);
      
      showNotification('Pembayaran Online Berhasil!', 'success');
      setShowPgModal(false);
      setShowForm(false);
      setBuktiUrl('');
      setJenisPembayaran('Iuran Warga');
    } catch (e: any) {
      handleFirestoreError(e, 'create', 'iuran');
      showNotification('Gagal mencatat pembayaran online', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleApprove = async (trx: any) => {
    if (!window.confirm("Verifikasi dan terima pembayaran ini?")) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'iuran', trx.id), { status: 'Lunas', verifiedBy: currentUser.nama || currentUser.name, verifiedAt: new Date().toISOString() });
      setIuranData((prev: any) => prev.map((t: any) => t.id === trx.id ? { ...t, status: 'Lunas' } : t));
      
      const kasId = `TRX-${Date.now()}`;
      const kasPayload = {
        id: kasId,
        tenantId,
        rt: trx.rt || '01',
        tanggal: new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        tipe: 'Masuk',
        transaksi: trx.jenis,
        nama: trx.namaPenyetor,
        keterangan: trx.keterangan || `Pembayaran ${trx.jenis}`,
        debit: trx.nominal,
        kredit: 0,
        strukUrl: trx.buktiUrl,
        iuranId: trx.id
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => {
        if (prev.some((k:any) => k.id === kasId)) return prev;
        return [kasPayload, ...prev];
      });
      
      showNotification('Pembayaran diverifikasi dan dicatat ke kas', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'update', 'iuran');
      showNotification('Gagal verifikasi', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };
  
  const handleReject = async (trx: any) => {
    if (!window.confirm("Tolak pembayaran ini?")) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'iuran', trx.id), { status: 'Ditolak' });
      setIuranData((prev: any) => prev.map((t: any) => t.id === trx.id ? { ...t, status: 'Ditolak' } : t));
      showNotification('Pembayaran ditolak', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'update', 'iuran');
      showNotification('Gagal menolak pembayaran', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[1.8rem] border border-white/60 w-fit shadow-sm">
        <button
          onClick={() => setActiveSubTab('pembayaran')}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[13px] font-black transition-all duration-300 uppercase tracking-widest ${activeSubTab === 'pembayaran' ? 'bg-[#008bb5] text-white shadow-lg shadow-[#008bb5]/20 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CreditCard className="w-4 h-4" />
          Riwayat
        </button>
        {isPengurus && (
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[13px] font-black transition-all duration-300 uppercase tracking-widest ${activeSubTab === 'rekap' ? 'bg-[#0cbb97] text-white shadow-lg shadow-[#0cbb97]/20 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Users className="w-4 h-4" />
            Rekap Iuran
          </button>
        )}
      </div>

      {activeSubTab === 'pembayaran' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-600 w-1.5 h-4 rounded-full"></span>
              {isPengurus ? "Semua Transaksi Masuk" : "Riwayat Pembayaran Saya"}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 text-xs font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64"
                />
              </div>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value={-1}>Semua Bulan</option>
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#008bb5] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 shadow-lg shadow-[#008bb5]/25">
                <PlusCircle className="w-4 h-4" /> Entri Pembayaran
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Penyetor</th>
                  <th className="px-5 py-4">Jenis Pembayaran</th>
                  <th className="px-5 py-4 text-right">Nominal</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Bukti</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredTransactions.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic font-bold">Tidak ada data.</td></tr>
                )}
                {filteredTransactions.map((trx: any, idx: number) => (
                  <tr key={`iuran-row-${trx.id || idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-xs">{new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800">{trx.namaPenyetor}</div>
                      <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={trx.alamat}>{trx.alamat}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-blue-600">{trx.jenis}</div>
                      <div className="text-[10px] text-slate-400 italic max-w-[200px] truncate" title={trx.keterangan}>{trx.keterangan || '-'}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-black">
                      Rp {new Intl.NumberFormat('id-ID').format(trx.nominal)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${trx.status === 'Lunas' ? 'bg-green-100 text-green-700' : trx.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {trx.strukUrl ? (
                        <a href={trx.strukUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded px-2 py-1 hover:bg-slate-200 transition-colors text-[10px] font-bold" title="Lihat Bukti">
                          <Image className="w-3 h-3" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(trx); }} 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 shadow-sm" 
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePrint(trx); }} 
                          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 shadow-sm" 
                          title="Cetak Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {isPengurus && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEdit(trx); }} 
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100 shadow-sm" 
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(trx.id); }} 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm" 
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isPengurus && trx.status === 'Menunggu Verifikasi' && (
                          <div className="flex gap-1 border-l border-slate-100 pl-2 ml-1">
                            <button onClick={(e) => { e.stopPropagation(); handleApprove(trx); }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-100 transition-colors" title="Terima">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleReject(trx); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100 transition-colors" title="Tolak">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'rekap' && isPengurus && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-2">Rekapitulasi Iuran Wajib Warga</h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">Tabel di bawah menunjukkan status pembayaran iuran wajib bulanan untuk warga (Kepala Keluarga) di tahun {selectedYear}.</p>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-4 py-3 border border-slate-100 sticky left-0 bg-slate-50 z-10 w-48 shadow-[1px_0_0_#f1f5f9]">Data Kepala Keluarga</th>
                  {months.map((m, i) => (
                    <th key={i} className="px-2 py-3 border border-slate-100 text-center min-w-[60px]">{m.substring(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium text-slate-600 text-xs">
                {wargaData.filter((w:any) => {
                  const p = (w.posisi || w.posisiKeluarga || w.status_keluarga || "").toLowerCase();
                  return p.includes('kepala keluarga') || p.includes('kk') || p.includes('pemilik');
                }).sort((a:any, b:any) => (a.nama || "").localeCompare(b.nama || "")).map((w: any, index: number) => (
                  <tr key={`kk-${index}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 border border-slate-100 sticky left-0 bg-white group-hover:bg-blue-50/10 z-10 shadow-[1px_0_0_#f1f5f9]">
                      <div className="font-bold text-slate-800">{w.nama}</div>
                      <div className="text-[9px] text-slate-400 truncate max-w-[180px]">{w.alamat}</div>
                    </td>
                    {months.map((m, i) => {
                      const paid = iuranData.some((trx: any) => {
                        if (trx.status !== 'Lunas') return false;
                        
                        // Check if it's a mandatory fee payment
                        const isIuranWajib = 
                          trx.jenis === 'Iuran Warga' || 
                          trx.jenis?.toLowerCase().includes('iuran wajib') || 
                          trx.keterangan?.toLowerCase().includes('iuran wajib');
                        
                        if (!isIuranWajib) return false;

                        // Match logic: NIK (strong), UserId (strong), or Name (fallback)
                        const matchNik = trx.nik && w.nik && trx.nik !== '-' && trx.nik === w.nik;
                        const matchUserId = trx.userId && (trx.userId === w.id || trx.userId === w.uid || trx.userId === w.id_user || trx.userId === w.docId);
                        
                        // Robust name matching for fallback
                        const cleanTrxNama = trx.namaPenyetor?.toLowerCase().replace(/\s+/g, ' ').trim();
                        const cleanWargaNama = w.nama?.toLowerCase().replace(/\s+/g, ' ').trim();
                        const matchNama = cleanTrxNama && cleanWargaNama && cleanTrxNama === cleanWargaNama;

                        if (!matchNik && !matchUserId && !matchNama) return false;

                        const d = new Date(trx.tanggal);
                        return d.getMonth() === i && d.getFullYear() === selectedYear;
                      });
                      return (
                        <td key={i} className={`px-2 py-2 border border-slate-100 text-center ${paid ? 'bg-green-50/50' : 'bg-slate-50/30'}`}>
                          {paid ? (
                            <div className="w-5 h-5 rounded-md bg-green-500 text-white flex items-center justify-center mx-auto shadow-sm shadow-green-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-auto"></div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                {editingTrx ? 'Edit Transaksi' : 'Entri Pembayaran'}
              </h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingTrx(null);
                }} 
                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="p-6 overflow-y-auto space-y-5">
              {isPengurus && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <label className="block text-xs font-black text-blue-800 uppercase tracking-widest">Identitas Penyetor (Admin Mode)</label>
                  <select 
                    name="wargaId" 
                    value={selectedWargaId} 
                    onChange={(e) => setSelectedWargaId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Bukan warga terdaftar --</option>
                    {[...wargaData].sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '')).map((w:any, index: number) => <option key={`w-iuran-opt-${w.docId || w.id || w.nik || index}-${index}`} value={w.docId || w.id || w.nik}>{w.nama} ({w.nik})</option>)}
                  </select>
                  <input type="text" name="namaPenyetor" defaultValue={editingTrx?.namaPenyetor || ""} placeholder="Tulis manual nama penyetor (jika luar warga)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Bayar</label>
                  <input name="tanggal" required type="date" defaultValue={editingTrx ? new Date(editingTrx.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
                  <input name="nominal" defaultValue={editingTrx?.nominal || ""} required type="text" placeholder="Contoh: 50000" className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Jenis Pembayaran & Peruntukkan</label>
                <select value={jenisPembayaran} onChange={(e) => setJenisPembayaran(e.target.value)} name="jenis" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                  <option value="Iuran Warga">Iuran Wajib Bulanan Warga</option>
                  <option value="Retribusi Sampah / Keamanan">Retribusi Sampah / Keamanan</option>
                  <option value="Pajak Bumi Bangunan">Pembayaran Pajak (PBB)</option>
                  <option value="Listrik, Air & Fasum">Biaya Listrik, Air & Fasilititas Umum</option>
                  <option value="Donasi / ZIS / Qurban">Donasi / Zakat / Qurban</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keterangan Detail (Opsional)</label>
                <input name="keterangan" defaultValue={editingTrx?.keterangan || ""} type="text" placeholder="Misal: Bayar Iuran Warga bulan Mei 2026 via QRIS" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                  <span>Bukti Pembayaran / Struk (Wajib U/Warga)</span>
                </label>
                {buktiUrl ? (
                  <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner group">
                    <img src={buktiUrl} alt="Bukti" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setBuktiUrl('')} className="absolute top-3 right-3 p-2 bg-red-600/90 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="w-full">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploading(true);
                        try {
                          const url = await handleFileUpload(e.target.files[0], 'iuran_bukti');
                          if (url) setBuktiUrl(url);
                        } catch (err) {
                          showNotification("Gagal upload bukti", "error");
                        }
                        setUploading(false);
                      }
                    }} />
                    <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-3 bg-slate-50/50 outline-none group focus:ring-2 disabled:opacity-50 disabled:cursor-wait">
                      {uploading ? (
                        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 group-hover:border-blue-200 group-hover:shadow-blue-100 transition-all">
                          <Upload className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <span className="text-xs font-black block">{uploading ? 'Sedang Mengunggah...' : 'Upload/Foto Bukti Transaksi'}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5 max-w-[200px] leading-tight block">Format Gambar (JPG/PNG). Bisa foto dari kamera HP.</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="py-4 px-6 text-[11px] font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all border border-slate-100 uppercase tracking-widest"
                >
                  Batal
                </button>
                <div className="flex-1 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={uploading} 
                    className="flex-1 py-4 text-[11px] font-black border-2 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5 rounded-2xl transition-all disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Manual
                  </button>
                  <button 
                    type="button" 
                    onClick={handleStartPg} 
                    disabled={uploading} 
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                    Bayar Online
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showPgModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative"
          >
            <div className="bg-blue-600 p-6 flex flex-col items-center justify-center text-white relative">
              <button onClick={() => setShowPgModal(false)} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-black tracking-widest uppercase text-xs text-blue-200 mb-1">Simulasi Payment Gateway</h3>
              <div className="text-3xl font-black font-mono">
                Rp {new Intl.NumberFormat('id-ID').format(pgFormState?.nominal || 0)}
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {pgStep === 1 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pilih Metode Pembayaran</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setPgMethod('QRIS'); setPgVirtualAccount(''); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-700">QRIS</span>
                    </button>
                    <button onClick={() => { setPgMethod('VA BCA'); setPgVirtualAccount('014' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-700">VA BCA</span>
                    </button>
                    <button onClick={() => { setPgMethod('VA Mandiri'); setPgVirtualAccount('895' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-700">VA Mandiri</span>
                    </button>
                    <button onClick={() => { setPgMethod('Alfamart'); setPgVirtualAccount('ALF' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                        <Store className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-700">Alfamart</span>
                    </button>
                  </div>
                </div>
              )}

              {pgStep === 2 && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pgMethod}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Selesaikan Pembayaran</p>
                  </div>

                  {pgMethod === 'QRIS' ? (
                    <div className="w-48 h-48 bg-slate-100 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center p-4">
                      <QrCode className="w-full h-full text-slate-800" />
                    </div>
                  ) : (
                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Virtual Account</p>
                      <p className="text-2xl font-mono font-black text-blue-600 tracking-wider select-all">{pgVirtualAccount}</p>
                    </div>
                  )}

                  <div className="w-full pt-4 border-t border-slate-100">
                    <button onClick={handlePgSuccess} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                      <CheckCircle2 className="w-5 h-5" /> Simulasi Bayar Sukses
                    </button>
                    <button onClick={() => setPgStep(1)} className="w-full mt-3 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                      Kembali Pilih Metode
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Watermark */}
            <div className="py-3 bg-slate-50 text-center border-t border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Powered by Tripay Simulation
              </span>
            </div>
          </motion.div>
        </div>
      )}
      {viewingTrx && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Detail Transaksi
              </h3>
              <button 
                onClick={() => setViewingTrx(null)} 
                className="text-white/70 hover:text-white transition-colors"
                id="close-detail-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</div>
                <div className="text-3xl font-black text-slate-800">
                  Rp {new Intl.NumberFormat('id-ID').format(viewingTrx.nominal)}
                </div>
                <div className={`mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${viewingTrx.status === 'Lunas' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {viewingTrx.status}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tanggal</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(viewingTrx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Jenis</p>
                    <p className="text-sm font-bold text-blue-600">{viewingTrx.jenis}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Penyetor</p>
                  <p className="text-sm font-bold text-slate-700">{viewingTrx.namaPenyetor}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{viewingTrx.alamat}</p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Keterangan</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{viewingTrx.keterangan || '-'}</p>
                </div>

                {viewingTrx.buktiUrl && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Bukti Pembayaran</p>
                    <div className="rounded-xl overflow-hidden border border-slate-200">
                      <img src={viewingTrx.buktiUrl} alt="Bukti" className="w-full max-h-48 object-contain bg-slate-50" />
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setViewingTrx(null)}
                className="w-full py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
