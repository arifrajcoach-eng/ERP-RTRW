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
  ShieldCheck
} from 'lucide-react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
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

  const canApprove = userRole === 'Admin' || userRole === 'RW' || userRole === 'RT' || userRole === 'Bendahara' || currentUser?.isSuperAdmin;
  const isPengurus = canApprove;
  
  const myTransactions = isPengurus ? iuranData : iuranData.filter((i: any) => i.nik === currentUser.nik || i.userId === currentUser.uid || i.userId === currentUser.id_user);
  
  const filteredTransactions = myTransactions.filter((i: any) => {
    const d = new Date(i.tanggal);
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

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `IURAN-${Date.now()}`;
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const keterangan = formData.get('keterangan') as string;
    
    let nik = currentUser.nik || '-';
    let nama = currentUser.nama || currentUser.name || "Anonim";
    let alamat = wargaData.find((w:any) => w.nik === nik)?.alamat || "-";
    
    if (isPengurus) {
      const selectedWargaId = formData.get('wargaId') as string;
      const w = wargaData.find((warga:any) => warga.id === selectedWargaId);
      if (w) {
        nik = w.nik || '-';
        nama = w.nama;
        alamat = w.alamat || "-";
      } else {
        const inputNama = formData.get('namaPenyetor') as string;
        if (inputNama) nama = inputNama;
      }
    }

    const payload = {
      id,
      tenantId,
      rt: currentUser.rt || '01',
      tanggal: dateObj.toISOString(),
      jenis: jenisPembayaran,
      nominal,
      keterangan,
      nik,
      namaPenyetor: nama,
      alamat,
      buktiUrl,
      status: isPengurus ? 'Lunas' : 'Menunggu Verifikasi',
      userId: currentUser.uid || currentUser.id_user || null,
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'iuran', id), payload);
      setIuranData((prev: any) => {
        if (prev.some((i: any) => i.id === id)) return prev;
        return [payload, ...prev];
      });
      
      // Auto create Kas if status is Lunas
      if (payload.status === 'Lunas') {
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
      
      showNotification('Pembayaran berhasil dicatat', 'success');
      setShowForm(false);
      setBuktiUrl('');
      setJenisPembayaran('Iuran Warga');
    } catch (e: any) {
      handleFirestoreError(e, 'create', 'iuran');
      showNotification('Gagal mencatat pembayaran', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleStartPg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;
    const formData = new FormData(form);
    const nominalString = formData.get('nominal') as string;
    const nominalRaw = parseInt(nominalString?.replace(/\D/g, '') || "0");
    if (nominalRaw <= 0) {
      showNotification("Sistem: Minimal nominal adalah Rp10.000 untuk P/G", "error");
      return;
    }
    setPgFormState({
      tanggal: formData.get('tanggal'),
      nominal: nominalRaw,
      jenis: formData.get('jenis'),
      keterangan: formData.get('keterangan'),
      wargaId: formData.get('wargaId'),
      namaPenyetor: formData.get('namaPenyetor')
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

    if (isPengurus && pgFormState.wargaId) {
      const selectedWarga = wargaData.find((w:any) => w.id === pgFormState.wargaId);
      if (selectedWarga) {
        nik = selectedWarga.nik;
        nama = selectedWarga.nama;
        alamat = selectedWarga.alamat || selectedWarga.blok || "-";
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
      userId: currentUser.uid || currentUser.id_user || null,
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
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab('pembayaran')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-[14px] font-black transition-all duration-300 ${activeSubTab === 'pembayaran' ? 'bg-[#008bb5] text-white shadow-xl shadow-[#008bb5]/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="uppercase tracking-wider">Riwayat</span>
        </button>
        {isPengurus && (
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-[14px] font-black transition-all duration-300 ${activeSubTab === 'rekap' ? 'bg-[#0cbb97] text-white shadow-xl shadow-[#0cbb97]/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4" />
            <span className="uppercase tracking-wider">Rekap Iuran</span>
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
                      {isPengurus && trx.status === 'Menunggu Verifikasi' && (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleApprove(trx)} className="p-1.5 px-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg border border-green-100 transition-colors font-bold text-xs" title="Terima">
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleReject(trx)} className="p-1.5 px-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg border border-red-100 transition-colors font-bold text-xs" title="Tolak">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
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
                {wargaData.filter((w:any) => w.posisi === 'Kepala Keluarga').sort((a:any, b:any) => (a.nama || "").localeCompare(b.nama || "")).map((w: any, index: number) => (
                  <tr key={`kk-${index}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 border border-slate-100 sticky left-0 bg-white group-hover:bg-blue-50/10 z-10 shadow-[1px_0_0_#f1f5f9]">
                      <div className="font-bold text-slate-800">{w.nama}</div>
                      <div className="text-[9px] text-slate-400 truncate max-w-[180px]">{w.alamat}</div>
                    </td>
                    {months.map((m, i) => {
                      const paid = iuranData.some((trx: any) => {
                        if (trx.jenis !== 'Iuran Warga' || trx.status !== 'Lunas') return false;
                        if (trx.nik !== w.nik && trx.namaPenyetor !== w.nama) return false;
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
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><PlusCircle className="w-4 h-4" /></span>
                Buat Pembayaran Baru
              </h3>
              <button onClick={() => setShowForm(false)} className="bg-white p-1.5 border border-slate-200 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
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
                  <input type="text" name="namaPenyetor" placeholder="Tulis manual nama penyetor (jika luar warga)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Bayar</label>
                  <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
                  <input name="nominal" required type="text" placeholder="Contoh: 50000" className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
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
                <input name="keterangan" type="text" placeholder="Misal: Bayar Iuran Warga bulan Mei 2026 via QRIS" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
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
                <button type="button" onClick={() => setShowForm(false)} className="py-3 px-4 text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors border border-slate-200">Batal</button>
                <div className="flex-1 flex gap-2">
                  <button type="submit" disabled={uploading} className="flex-1 py-3 text-xs font-black border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Manual
                  </button>
                  <button type="button" onClick={handleStartPg} disabled={uploading} className="flex-1 py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" /> Bayar Online
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
    </div>
  );
}
