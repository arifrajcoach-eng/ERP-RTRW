import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from './ui/ConfirmModal';
import { jsPDF } from 'jspdf';
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
import { logAuditEvent } from '../services/auditLogService';

import { getTranslatedLabel } from '../lib/langUtils';

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
  const mode = getSetting("themeMode") || "rt_rw";
  const [activeSubTab, setActiveSubTab] = useState<'pembayaran' | 'rekap'>('pembayaran');
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [buktiUrl, setBuktiUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jenisPembayaran, setJenisPembayaran] = useState(getTranslatedLabel("Iuran Bulanan", mode));
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
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.tanggal || a.createdAt || 0).getTime();
    const dateB = new Date(b.tanggal || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const [editingTrx, setEditingTrx] = useState<any>(null);
  const [viewingTrx, setViewingTrx] = useState<any>(null);
  const [trxToDelete, setTrxToDelete] = useState<any>(null);

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

  const handleDelete = async () => {
    if (!trxToDelete) return;
    const id = trxToDelete.id;
    setIsLoadingDB(true);
    try {
      // 1. Delete the iuran record
      await deleteDoc(doc(db, 'iuran', id));
      setIuranData(prev => prev.filter(t => t.id !== id));

      // 2. Locate and delete the corresponding kas record
      if (Array.isArray(kasData)) {
        const relatedKas = kasData.find((k: any) => k.iuranId === id);
        if (relatedKas) {
          await deleteDoc(doc(db, 'kas', relatedKas.id));
          setKasData(prev => prev.filter(k => k.id !== relatedKas.id));
        }
      }

      await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", "DELETE_IURAN", "iuran", `Menghapus iuran: ${trxToDelete.namaPenyetor || id}`, tenantId);

      showNotification('Transaksi dan catatan kas terkait berhasil dihapus', 'success');
      setTrxToDelete(null);
    } catch (err: any) {
      handleFirestoreError(err, 'delete', 'iuran');
      showNotification('Gagal menghapus transaksi', 'error');
      setTrxToDelete(null);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleViewDetails = (trx: any) => {
    setViewingTrx(trx);
  };

  const handlePrint = (trx: any) => {
    let printWindow = null;
    try {
      printWindow = window.open('', '_blank');
      if (!printWindow) {
        showNotification('Gagal mencetak: Pop-up diblokir. Harap aktifkan pop-up untuk situs ini.', 'error');
        return;
      }
    } catch (e) {
      showNotification('Gagal mencetak: Browser memblokir pembukaan tab baru.', 'error');
      return;
    }

    const kop = getSetting("KOP_SURAT") || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || getSetting("nama_organisasi") || "SmaRtRw AI";
    const tagline = kop.tagline || getSetting("tagline") || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    const formattedNominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.nominal);
    const dateStr = new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    printWindow.document.write(`
      <html>
        <head>
          <title>${tenantName} - ${tagline} - Bukti Pembayaran - ${trx.id}</title>
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
            <h1 style="font-size: 24px; font-weight: bold; margin: 0;">${tenantName}</h1>
            <p style="font-size: 13px; font-style: italic; color: #64748b; margin: 5px 0 10px 0;">${tagline}</p>
            <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #3b82f6; margin: 0;">Bukti Transaksi Digital Keuangan</p>
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
            <p style="font-size: 13px; font-weight: 500; font-style: italic; color: #475569; margin-bottom: 12px;">"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."</p>
            <p>Terima kasih telah melakukan pembayaran tepat waktu.<br/>Dokumen ini sah dihasilkan secara elektronik oleh Sistem SmaRtRw.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sanitizeForFirestore = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => 
      value === undefined ? null : value
    ));
  };

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingTrx ? editingTrx.id : `IURAN-${Date.now()}`;
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const keterangan = formData.get('keterangan') as string;
    
    let nik = (currentUser?.nik || "-").toString();
    let nama = currentUser?.nama || currentUser?.name || "Warga";
    let alamat = "-";
    
    // Attempt to find address from wargaData
    let explicitRt = null;
    const foundCurrent = wargaData.find((w: any) => (w.nik === nik && nik !== "-") || (currentUser?.uid && w.id === currentUser.uid));
    if (foundCurrent) {
      alamat = foundCurrent.alamat || "-";
      explicitRt = foundCurrent.rt;
    }

    let targetUserId = currentUser?.uid || currentUser?.id_user || null;
    
    if (isPengurus) {
      const selectedWargaIdFromForm = formData.get('wargaId') as string;
      const w = wargaData.find((item: any) => 
        (item.docId || item.id || item.nik) === selectedWargaIdFromForm
      );
      
      if (w) {
        nik = (w.nik || "-").toString();
        nama = w.nama || "Warga";
        alamat = w.alamat || "-";
        targetUserId = w.id || w.uid || w.id_user || null;
        explicitRt = w.rt;
      } else {
        const manualNama = formData.get('namaPenyetor') as string;
        if (manualNama) nama = manualNama;
        nik = "-";
      }
    }

    let finalRt = explicitRt;
    if (!finalRt && tenantId && tenantId.toLowerCase().startsWith('rt')) {
       finalRt = tenantId.split('_')[0].replace(/\D/g, '');
    }
    if (!finalRt) finalRt = currentUser?.rt || "01";

    const payload = sanitizeForFirestore({
      ...(editingTrx || {}),
      id,
      tenantId: tenantId || "MASTER",
      rt: finalRt.toString(),
      tanggal: dateObj.toISOString(),
      jenis: jenisPembayaran || "Iuran Warga",
      nominal: nominal || 0,
      keterangan: (formData.get('keterangan') as string) || "",
      nik: nik || "-",
      namaPenyetor: nama || "Admin",
      alamat: alamat || "-",
      buktiUrl: buktiUrl || "",
      status: editingTrx ? editingTrx.status : (isPengurus ? 'Lunas' : 'Menunggu Verifikasi'),
      userId: targetUserId || null,
      recordedBy: editingTrx?.recordedBy || currentUser?.uid || currentUser?.id_user || 'System',
      updatedAt: new Date().toISOString()
    });

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
      
      // Auto create or update Kas if status is Lunas
      if (payload.status === 'Lunas') {
        if (!editingTrx) {
          // Create new record
          const kasId = `TRX-${Date.now()}`;
          const kasPayload = {
            id: kasId,
            tenantId: tenantId || "MASTER",
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
        } else {
          // Update existing related kas record
          const relatedKas = kasData.find((k: any) => k.iuranId === id);
          if (relatedKas) {
            const updatedKas = {
              ...relatedKas,
              rt: payload.rt,
              tanggal: dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
              transaksi: payload.jenis,
              nama: payload.namaPenyetor,
              keterangan: payload.keterangan,
              debit: payload.nominal,
              strukUrl: payload.buktiUrl
            };
            await updateDoc(doc(db, 'kas', relatedKas.id), updatedKas);
            setKasData(prev => prev.map(k => k.id === relatedKas.id ? updatedKas : k));
          } else {
            // If somehow iuran exists but kas doesn't (legacy or manual error), create it now if Lunas
            const kasId = `TRX-${Date.now()}`;
            const kasPayload = {
              id: kasId,
              tenantId: tenantId || "MASTER",
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
            setKasData(prev => [kasPayload, ...prev]);
          }
        }
      }
      
      await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", editingTrx ? "UPDATE_IURAN" : "CREATE_IURAN", "iuran", `${editingTrx ? "Edit" : "Catat"} Iuran: RP ${payload.nominal} - ${payload.namaPenyetor}`, tenantId);
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
    
    const form = e.currentTarget.closest('form');
    if (!form) {
      showNotification("Sistem Error: Form tidak ditemukan", "error");
      return;
    }
    
    const formData = new FormData(form);
    const nominalRaw = parseInt((formData.get('nominal') as string)?.replace(/\D/g, '') || "0");
    
    if (nominalRaw <= 0) {
      showNotification("Silakan masukkan nominal pembayaran", "error");
      return;
    }

    const wargaId = formData.get('wargaId') as string;
    const namaPenyetor = formData.get('namaPenyetor') as string;
    const jenis = formData.get('jenis') as string;
    const tanggal = formData.get('tanggal') as string;
    const keterangan = formData.get('keterangan') as string;
    
    if (isPengurus && !wargaId && !namaPenyetor) {
      showNotification("Harap pilih warga atau isi nama penyetor", "error");
      return;
    }

    setPgFormState({
      tanggal,
      nominal: nominalRaw,
      jenis,
      keterangan,
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
    
    let nik = (currentUser?.nik || currentUser?.uid || currentUser?.id_user || "-").toString();
    let nama = currentUser?.nama || currentUser?.name || "Warga";
    let alamat = currentUser?.alamat || "-";
    let targetUserId = currentUser?.uid || currentUser?.id_user || null;
    let explicitRt = currentUser?.rt;

    if (isPengurus && pgFormState.wargaId) {
      const selectedWarga = wargaData.find((w:any) => w.id === pgFormState.wargaId || w.docId === pgFormState.wargaId || w.nik === pgFormState.wargaId);
      if (selectedWarga) {
        nik = (selectedWarga.nik || "-").toString();
        nama = selectedWarga.nama || "Warga";
        alamat = selectedWarga.alamat || selectedWarga.blok || "-";
        targetUserId = selectedWarga.id || selectedWarga.uid || selectedWarga.id_user || null;
        explicitRt = selectedWarga.rt;
      }
    } else if (isPengurus && pgFormState.namaPenyetor) {
      nama = pgFormState.namaPenyetor;
      nik = "-";
    }

    let finalRt = explicitRt;
    if (!finalRt && tenantId && tenantId.toLowerCase().startsWith('rt')) {
       finalRt = tenantId.split('_')[0].replace(/\D/g, '');
    }
    if (!finalRt) finalRt = currentUser?.rt || "01";

    const payload = sanitizeForFirestore({
      id,
      tenantId: tenantId || "MASTER",
      rt: finalRt.toString(),
      tanggal: dateObj.toISOString(),
      jenis: pgFormState.jenis || "Iuran Warga",
      nominal: pgFormState.nominal || 0,
      keterangan: pgFormState.keterangan || `Pembayaran ${pgFormState.jenis || 'Iuran'} (via ${pgMethod})`,
      nik: nik || "-",
      namaPenyetor: nama || "Warga",
      alamat: alamat || "-",
      buktiUrl: `PG-${pgMethod} Digital Receipt`,
      status: 'Lunas',
      userId: targetUserId || null,
      verifiedBy: 'Sistem',
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'iuran', id), payload);
      setIuranData((prev: any) => {
        if (prev.some((i: any) => i.id === id)) return prev;
        return [payload, ...prev];
      });
      
      const kasId = `TRX-${Date.now()}`;
      const kasPayload = {
        id: kasId,
        tenantId: tenantId || "MASTER",
        rt: payload.rt,
        tanggal: dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        tipe: 'Masuk',
        transaksi: payload.jenis,
        nama: payload.namaPenyetor,
        keterangan: payload.keterangan,
        debit: payload.nominal,
        kredit: 0,
        strukUrl: `Simulasi PG ${pgMethod}`,
        iuranId: id
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => {
        if (prev.some((k: any) => k.id === kasId)) return prev;
        return [kasPayload, ...prev];
      });
      
      await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", "CREATE_IURAN_ONLINE", "iuran", `Iuran Online: RP ${payload.nominal} - ${payload.namaPenyetor}`, tenantId);
      
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
      <div className="flex w-full md:w-fit bg-slate-100/50 dark:bg-slate-800/50 p-1.5 sm:p-2.5 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl backdrop-blur-3xl animate-in fade-in slide-in-from-left-4 duration-700 justify-between md:justify-start">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSubTab('pembayaran')}
          className={`group flex flex-1 md:flex-initial flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 px-2 py-2.5 sm:px-12 sm:py-5 rounded-xl md:rounded-2xl text-[9px] sm:text-[11px] font-black transition-all duration-500 uppercase tracking-normal sm:tracking-widest relative overflow-hidden ${
            activeSubTab === 'pembayaran' 
              ? 'bg-slate-900 dark:bg-brand-blue text-white shadow-2xl scale-100' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeSubTab === 'pembayaran' && (
             <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          )}
          <CreditCard className={`w-4 h-4 sm:w-5 h-5 transition-transform duration-500 ${activeSubTab === 'pembayaran' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span>Mutasi Kas</span>
        </motion.button>
        {isPengurus && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSubTab('rekap')}
            className={`group flex flex-1 md:flex-initial flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 px-2 py-2.5 sm:px-12 sm:py-5 ml-1.5 sm:ml-2 rounded-xl md:rounded-2xl text-[9px] sm:text-[11px] font-black transition-all duration-500 uppercase tracking-normal sm:tracking-widest relative overflow-hidden ${
              activeSubTab === 'rekap' 
                ? 'bg-brand-blue dark:bg-slate-800 text-white shadow-2xl scale-100' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
             {activeSubTab === 'rekap' && (
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            )}
            <Users className={`w-4 h-4 sm:w-5 h-5 transition-transform duration-500 ${activeSubTab === 'rekap' ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span>Rekap Global</span>
          </motion.button>
        )}
      </div>

      {activeSubTab === 'pembayaran' && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4 tracking-tighter uppercase font-elegant">
                <div className="w-2.5 h-8 bg-brand-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                {isPengurus ? "Monitoring Iuran" : "Histori Pembayaran"}
              </h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 ml-7">Record Transparan & Akuntabel</p>
            </div>

            <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
              <div className="relative flex-1 xl:flex-none group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                <input
                  type="text"
                  placeholder="Cari Entri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[13px] font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/20 w-full xl:w-72 shadow-sm transition-all placeholder:text-slate-300 placeholder:italic"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                  className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[11px] font-black rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-brand-blue/5 shadow-sm transition-all appearance-none cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  <option value={-1}>Kalender</option>
                  {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                  className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[11px] font-black rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-brand-blue/5 shadow-sm transition-all appearance-none cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <motion.button 
                whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm(true)} 
                className="w-full sm:w-auto flex items-center justify-center gap-4 bg-slate-900 dark:bg-brand-blue text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" /> 
                Input Transaksi
              </motion.button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] border-b border-slate-100 dark:border-slate-800">
                  <th className="px-10 py-8">Kronologi</th>
                  <th className="px-10 py-8">Entitas Penyetor</th>
                  <th className="px-10 py-8">Kategori / Memo</th>
                  <th className="px-10 py-8 text-right">Value (IDR)</th>
                  <th className="px-10 py-8 text-center">Status Keamanan</th>
                  <th className="px-10 py-8 text-center">Dokumen</th>
                  <th className="px-10 py-8 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {(!isPengurus) ? (
                  <tr><td colSpan={7} className="px-10 py-32 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-white dark:border-slate-700 shadow-inner">
                         <ShieldCheck className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 font-bold text-sm leading-relaxed uppercase tracking-widest italic">Akses Terbatas • Secure Protocol Active</p>
                    </div>
                  </td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan={7} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-30 text-slate-400">
                       <CreditCard className="w-20 h-20 mb-6" />
                       <p className="font-black uppercase tracking-widest text-xs">Arsip Kosong</p>
                    </div>
                  </td></tr>
                ) : (
                  filteredTransactions.map((trx: any, idx: number) => (
                  <motion.tr 
                    key={`iuran-row-${trx.id || idx}-${idx}`} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-brand-blue/5 transition-all duration-300 group cursor-default"
                  >
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand-blue group-hover:scale-150 transition-all duration-500" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(trx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-[15px] group-hover:text-brand-blue transition-colors font-elegant">{trx.namaPenyetor}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic truncate max-w-[200px]" title={trx.alamat}>Loc: {trx.alamat}</div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5 border border-slate-200 dark:border-slate-700">
                         {trx.jenis}
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic truncate max-w-[220px]" title={trx.keterangan}>Memo: {trx.keterangan || '-'}</p>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <span className="text-[15px] font-black text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors font-mono tracking-tighter">Rp {new Intl.NumberFormat('id-ID').format(trx.nominal)}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl ${
                        trx.status === 'Lunas' 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-400' 
                          : trx.status === 'Ditolak' 
                          ? 'bg-rose-500 text-white shadow-rose-500/20 border border-rose-400' 
                          : 'bg-amber-500 text-white shadow-amber-500/20 border border-amber-400'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      {trx.strukUrl ? (
                        <motion.a 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          href={trx.strukUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-brand-blue transition-all duration-500 border border-slate-100 dark:border-slate-700 shadow-lg group-hover:border-brand-blue/30" 
                          title="Lihat Bukti"
                        >
                          <Image className="w-6 h-6" />
                        </motion.a>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-200 mx-auto" />
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex gap-3 justify-end items-center font-elegant">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(trx); }} 
                          className="p-3.5 text-white bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-xl hover:bg-brand-blue transition-all border border-white/10" 
                          title="Review"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handlePrint(trx); }} 
                          className="p-3.5 text-slate-500 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg hover:text-brand-blue transition-all" 
                          title="Receipt"
                        >
                          <Printer className="w-5 h-5" />
                        </motion.button>
                        {isPengurus && (
                          <>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleEdit(trx); }} 
                              className="p-3.5 text-emerald-600 bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl shadow-lg hover:bg-emerald-600 hover:text-white transition-all" 
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); setTrxToDelete(trx); }} 
                              className="p-3.5 text-rose-600 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-rose-500/20 rounded-2xl shadow-lg hover:bg-rose-600 hover:text-white transition-all" 
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'rekap' && isPengurus && (
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/40 border border-slate-100/50 p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 mb-10">
            <h3 className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200 shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-tight">
                  Rekapitulasi
                </span>
                <span className="text-emerald-600 text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-tight">
                  Iuran Wajib
                </span>
              </div>
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
              Monitoring kepatuhan iuran bulanan warga tahun <span className="text-emerald-500 font-black">{selectedYear}</span>. Pastikan semua warga berkontribusi aktif.
            </p>
          </div>
          
          <div className="overflow-x-auto min-h-[400px] rounded-2xl border border-slate-100 shadow-inner bg-slate-50/20">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px]">
                  <th className="px-6 py-5 border-b border-slate-200 sticky left-0 bg-slate-100 z-10 w-64 shadow-[2px_0_10px_rgba(0,0,0,0.05)]">Kepala Keluarga</th>
                  {months.map((m, i) => (
                    <th key={i} className="px-3 py-5 border-b border-slate-200 text-center min-w-[70px]">{m.substring(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium text-slate-600 text-xs">
                {wargaData.filter((w:any) => {
                  const p = (w.posisi || w.posisiKeluarga || w.status_keluarga || "").toLowerCase();
                  return p.includes('kepala keluarga') || p.includes('kk') || p.includes('pemilik');
                }).sort((a:any, b:any) => (a.nama || "").localeCompare(b.nama || "")).map((w: any, index: number) => (
                  <tr key={`kk-${index}`} className="hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-8 py-7 border-b border-slate-100 sticky left-0 bg-white group-hover:bg-blue-50/10 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                      <div className="font-black text-slate-800 tracking-tight text-sm uppercase italic">{w.nama}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px] mt-1 italic">{w.alamat}</div>
                    </td>
                    {months.map((m, i) => {
                      const paid = iuranData.some((trx: any) => {
                        if (trx.status !== 'Lunas') return false;
                        const isIuranWajib = trx.jenis === 'Iuran Warga' || trx.jenis?.toLowerCase().includes('iuran wajib') || trx.keterangan?.toLowerCase().includes('iuran wajib');
                        if (!isIuranWajib) return false;
                        const matchNik = (trx.nik && w.nik && trx.nik !== '-' && trx.nik === w.nik);
                        const matchUserId = (trx.userId && (trx.userId === w.id || trx.userId === w.uid || trx.userId === w.id_user || trx.userId === w.docId));
                        const cleanTrxNama = trx.namaPenyetor?.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                        const cleanWargaNama = w.nama?.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                        const matchNama = !!cleanTrxNama && !!cleanWargaNama && (cleanTrxNama.includes(cleanWargaNama) || cleanWargaNama.includes(cleanTrxNama));
                        if (!matchNik && !matchUserId && !matchNama) return false;
                        const d = new Date(trx.tanggal);
                        return d.getMonth() === i && d.getFullYear() === selectedYear;
                      });
                      return (
                        <td key={i} className={`px-4 py-7 border-b border-slate-100 text-center transition-all duration-300 ${paid ? 'bg-emerald-50/30' : 'bg-slate-50/5'}`}>
                          {paid ? (
                             <motion.div 
                              whileHover={{ scale: 1.2 }}
                              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-[0_5px_15px_-3px_rgba(16,185,129,0.4)]"
                             >
                              <CheckCircle2 className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 mx-auto opacity-30 shadow-inner"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[95vh] relative"
          >
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tighter uppercase italic">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/30">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  {editingTrx ? 'Ubah Transaksi' : 'Entri Pembayaran'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 ml-14">Protokol Pencatatan Kas Keuangan</p>
              </div>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingTrx(null);
                }} 
                className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="p-10 overflow-y-auto space-y-8">
              {isPengurus && (
                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-[2rem] border border-blue-100/50 space-y-4 shadow-inner">
                  <label className="block text-[10px] font-black text-blue-800 uppercase tracking-[0.3em] ml-1 mb-2">Identitas Penyetor (Admin Otoritas)</label>
                  <select 
                    name="wargaId" 
                    value={selectedWargaId} 
                    onChange={(e) => setSelectedWargaId(e.target.value)}
                    className="w-full px-5 py-4 border border-blue-100 rounded-2xl text-sm font-black text-slate-700 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  >
                    <option value="">-- Bukan warga terdaftar (User Umum) --</option>
                    {[...wargaData].sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '')).map((w:any, index: number) => <option key={`w-iuran-opt-${w.docId || w.id || w.nik || index}-${index}`} value={w.docId || w.id || w.nik}>{w.nama} ({w.nik})</option>)}
                  </select>
                  <div className="relative">
                    <input type="text" name="namaPenyetor" defaultValue={editingTrx?.namaPenyetor || ""} placeholder="Atau ketik manual nama penyetor luar warga..." className="w-full px-5 py-4 border border-blue-100 rounded-2xl text-sm font-bold text-slate-600 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all shadow-sm" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tanggal Transaksi</label>
                  <input name="tanggal" required type="date" defaultValue={editingTrx ? new Date(editingTrx.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nominal Pembayaran (IDR)</label>
                  <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                     <input name="nominal" defaultValue={editingTrx?.nominal || ""} required type="text" placeholder="50.000" className="w-full pl-12 pr-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Alokasi / Jenis Pembayaran</label>
                <select value={jenisPembayaran} onChange={(e) => setJenisPembayaran(e.target.value)} name="jenis" className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm">
                  <option value="Iuran RT">Iuran RT</option>
                  <option value="Iuran RW">Iuran RW</option>
                  <option value="Iuran Warga">Iuran Warga</option>
                  <option value="Iuran Sampah">Iuran Sampah</option>
                  <option value="Iuran 17 an">Iuran 17 an</option>
                  <option value="Iuran PBB">Iuran PBB</option>
                  <option value="Iuran Pembangunan/ Renovasi Balai">Iuran Pembangunan/ Renovasi Balai</option>
                  <option value="Iuran Pembangunan/ Renovasi Kantor">Iuran Pembangunan/ Renovasi Kantor</option>
                  <option value="Iuran Pembangunan/ Renovasi Pos Ronda">Iuran Pembangunan/ Renovasi Pos Ronda</option>
                  <option value="Iuran Fasum">Iuran Fasum</option>
                  <option value="Iuran Keamanan">Iuran Keamanan</option>
                  <option value="Organisasi">Organisasi</option>
                  <option value="Sumbangan">Sumbangan</option>
                  <option value="Donasi">Donasi</option>
                  <option value="Pembelian ATK">Pembelian ATK</option>
                  <option value="Pembelian Aset">Pembelian Aset</option>
                  <option value="Pembelian Elektronik">Pembelian Elektronik</option>
                  <option value="Pembelian Furniture">Pembelian Furniture</option>
                  <option value="Pembelian Alat Olahraga">Pembelian Alat Olahraga</option>
                  <option value="Pembayaran Wifi">Pembayaran Wifi</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Catatan / Keterangan (Opsional)</label>
                <textarea 
                   name="keterangan" 
                   defaultValue={editingTrx?.keterangan || ""} 
                   rows={2}
                   placeholder="Berikan detail tambahan jika diperlukan..." 
                   className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-sm font-bold text-slate-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm resize-none" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between items-center">
                  <span>Lampiran Bukti / Struk Fisik</span>
                  <span className="text-blue-500 text-[8px] font-black">Maksimal 5MB</span>
                </label>
                {buktiUrl ? (
                  <div className="relative w-full aspect-video bg-slate-50 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner group">
                    <img src={buktiUrl} alt="Bukti" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <button type="button" onClick={() => setBuktiUrl('')} className="bg-white text-rose-600 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                         <Trash2 className="w-4 h-4" /> HAPUS FOTO
                       </button>
                    </div>
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
                    <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-4 bg-slate-50/30 outline-none group focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-wait">
                      {uploading ? (
                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                      ) : (
                        <>
                          <div className="p-4 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                             <Upload className="w-8 h-8 text-blue-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Klik Untuk Unggah Dokumen</p>
                            <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP</p>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {editingTrx ? 'SIMPAN PERUBAHAN' : 'CATAT PEMBAYARAN TUNAI'}
                </button>
                {!editingTrx && (
                  <button 
                    type="button" 
                    onClick={handleStartPg} 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-700 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <QrCode className="w-5 h-5" />
                    BAYAR ONLINE (QRIS/VA)
                  </button>
                )}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white"
          >
            <div className={`p-8 ${viewingTrx.status === 'Lunas' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-orange-600 to-amber-700'} text-white flex justify-between items-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h3 className="font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                   <CreditCard className="w-4 h-4" /> 
                </div>
                Detail Transaksi Keuangan
              </h3>
              <button 
                onClick={() => setViewingTrx(null)} 
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 relative z-10"
                id="close-detail-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Pembayaran Berhasil</div>
                <div className={`text-4xl font-black tracking-tighter ${viewingTrx.status === 'Lunas' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  Rp {new Intl.NumberFormat('id-ID').format(viewingTrx.nominal)}
                </div>
                <div className={`mt-4 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${viewingTrx.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {viewingTrx.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-10 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Transaksi</p>
                  <p className="text-xs font-black text-slate-800 break-all family-mono">{viewingTrx.id}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal</p>
                  <p className="text-xs font-black text-slate-800">{new Date(viewingTrx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Penyetor</p>
                  <p className="text-xs font-black text-slate-800">{viewingTrx.namaPenyetor}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">NIK / UserID</p>
                  <p className="text-xs font-black text-slate-800">{viewingTrx.nik || '-'}</p>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jenis Pembayaran</p>
                  <p className="text-xs font-black text-blue-600">{viewingTrx.jenis}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</p>
                  <p className="text-xs font-bold text-slate-600 italic">"{viewingTrx.keterangan || '-'}"</p>
                </div>
              </div>

              {viewingTrx.buktiUrl && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lampiran Dokumen</p>
                  <div className="w-full aspect-[4/3] bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden group relative">
                    <img src={viewingTrx.buktiUrl} alt="Struk" className="w-full h-full object-contain" />
                    <a 
                       href={viewingTrx.buktiUrl} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                    >
                       <div className="bg-white text-blue-600 px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-3 shadow-2xl">
                          <Eye className="w-5 h-5" /> LIHAT UKURAN PENUH
                       </div>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                 <button 
                   onClick={() => handlePrint(viewingTrx)} 
                   className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   <Printer className="w-5 h-5" /> CETAK STRUK
                 </button>
                 <button 
                   onClick={() => setViewingTrx(null)} 
                   className="flex-1 py-5 bg-white text-slate-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                 >
                   TUTUP
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {trxToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Transaksi Iuran"
            message={`Apakah Anda yakin ingin menghapus transaksi iuran senilai Rp ${new Intl.NumberFormat('id-ID').format(trxToDelete.nominal)} dari "${trxToDelete.namaPenyetor}"? Data buku kas yang terkait juga akan terhapus.`}
            onConfirm={handleDelete}
            onCancel={() => setTrxToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
