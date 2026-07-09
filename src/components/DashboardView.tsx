import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, FileText, CreditCard, Siren, TrendingUp, Search, 
  MapPin, Clock, CheckCircle2, QrCode, Smartphone, Bot, LayoutGrid,
  AlertTriangle, Calendar, BookCopy, ShieldCheck, Baby, Recycle, ShoppingBag, Vote, Package, User, Shield, Settings, MessageSquare, Lock, Zap, ChevronRight, Sparkles, Eye, EyeOff,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import AIChatBot from './AIChatBot';
import MadingDigitalView from './MadingDigitalView';
import { getTranslatedLabel } from '../lib/langUtils';

interface DashboardViewProps {
  kasData: any[];
  wargaData: any[];
  suratData: any[];
  iuranData: any[];
  emergenciesData: any[];
  handleTriggerSOS: () => void;
  onResolveSOS?: (id: string) => void;
  userRole: string;
  setActiveTab: (tab: string) => void;
  posyanduKegiatanData: any[];
  inventarisData: any[];
  sampahSetoranData: any[];
  bukuTamuData: any[];
  verifikasiWargaData: any[];
  sampahTarikSaldoData: any[];
  votingConfig: any;
  userVotes: any[];
  tokoOrders: any[];
  tokoReviews?: any[];
  complaintsData: any[];
  bookingsData: any[];
  handleLinkToWarga: (nik: string, pin: string) => void;
  currentTenant: any;
  setShowUpgradeModal: (v: boolean) => void;
  setShowQRModal: (v: boolean) => void;
  settings: any;
  currentUser: any;
  setIsLoadingDB: any;
  showNotification: any;
  handleFirestoreError: any;
  AppLogo: any; // Passed from App.tsx or imported
  allowedMenuItems?: Array<{id: string, label: string, icon: any, isLocked?: boolean}>;
  activeEmergency?: any;
}

export default function DashboardView({ 
  kasData, 
  wargaData, 
  suratData, 
  iuranData, 
  emergenciesData, 
  handleTriggerSOS, 
  onResolveSOS,
  userRole, 
  setActiveTab, 
  posyanduKegiatanData, 
  inventarisData, 
  sampahSetoranData, 
  bukuTamuData, 
  verifikasiWargaData, 
  sampahTarikSaldoData,
  votingConfig,
  userVotes,
  tokoOrders,
  complaintsData,
  bookingsData,
  handleLinkToWarga,
  currentTenant,
  setShowUpgradeModal,
  setShowQRModal,
  settings,
  currentUser,
  setIsLoadingDB,
  showNotification,
  handleFirestoreError,
  AppLogo,
  allowedMenuItems,
  activeEmergency
}: DashboardViewProps) {
  const [kasPeriod, setKasPeriod] = useState('yearly');
  const [piePeriod, setPiePeriod] = useState('30days');
  const [linkForm, setLinkForm] = useState({ nik: '', pin: '' });
  const [showAIChat, setShowAIChat] = useState(false);
  const [hideSubscriptionInfo, setHideSubscriptionInfo] = useState<boolean>(() => {
    return localStorage.getItem('hideSubscriptionInfo') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hideSubscriptionInfo', String(hideSubscriptionInfo));
  }, [hideSubscriptionInfo]);

  const parseSafeDate = (dateStr: any): Date => {
    if (!dateStr) return new Date(0);
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) return dateObj;

    const monthsMap: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      agt: 7, agu: 7, agustus: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9, october: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, december: 11
    };

    try {
      const clean = dateStr.toString().toLowerCase().trim();
      const parts = clean.split(/\s+/);
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const monthLabel = parts[1];
        const year = parseInt(parts[2]);
        
        const monthIndex = monthsMap[monthLabel];
        if (monthIndex !== undefined && !isNaN(day) && !isNaN(year)) {
          return new Date(year, monthIndex, day);
        }
      }
    } catch (e) {
      // fallback
    }
    return new Date(0);
  };

  const isWarga = userRole?.toUpperCase() === 'WARGA';

  const hasSuperAdminAccess = useMemo(() => {
    return allowedMenuItems?.some(item => item.id === 'super-admin');
  }, [allowedMenuItems]);

  // Personal Stats for Warga
  const personalStats = useMemo(() => {
    if (!isWarga || !currentUser?.nik) return null;

    const mySetoran = sampahSetoranData.filter((s: any) => s.nik === currentUser?.nik || s.namaNasabah === currentUser?.name);
    const myTarik = sampahTarikSaldoData.filter((s: any) => s.nik === currentUser?.nik || s.namaNasabah === currentUser?.name);
    const totalSetoran = mySetoran.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalTarik = myTarik.reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
    const saldoSampah = totalSetoran - totalTarik;

    const myIuran = iuranData.filter((i: any) => {
      const matchNik = i.nik && currentUser?.nik && i.nik !== '-' && i.nik === currentUser?.nik;
      const matchUserId = i.userId && (i.userId === currentUser?.uid || i.userId === currentUser?.id_user || i.userId === currentUser?.docId);
      
      const cleanTrxNama = i.namaPenyetor?.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      const cleanWargaNama = currentUser?.name?.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      const matchNama = !!cleanTrxNama && !!cleanWargaNama && (cleanTrxNama.includes(cleanWargaNama) || cleanWargaNama.includes(cleanTrxNama));
      
      return matchNik || matchUserId || matchNama;
    });
    
    // Calculate missing months for the current year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let unpaidCount = 0;
    
    if (myIuran.length > 0) {
      for (let m = 0; m <= currentMonth; m++) {
        const isPaid = myIuran.some((trx: any) => {
          if (trx.status?.toString().trim().toLowerCase() !== 'lunas') return false;
          const d = parseSafeDate(trx.tanggal);
          const matchesDate = d.getMonth() === m && d.getFullYear() === currentYear;
          const jenis = trx.jenis?.toLowerCase() || "";
          const ket = trx.keterangan?.toLowerCase() || "";
          const isIuranWajib = jenis.includes('iuran') || ket.includes('iuran') || jenis.includes('ipl') || ket.includes('ipl') || jenis.includes('donasi') || ket.includes('donasi');
          return matchesDate && isIuranWajib;
        });
        if (!isPaid) unpaidCount++;
      }
    }

    const myOrders = tokoOrders.filter((o: any) => o.customerId === currentUser?.uid || o.customerId === (currentUser?.nik || ''));
    const pendingOrders = myOrders.filter((o: any) => o.status === 'PENDING' || o.status === 'PROCESS').length;

    const myLetters = (suratData || []).filter((s: any) => {
      const citizenNik = currentUser?.nik || currentUser?.nikMapping || "";
      const uid = currentUser?.uid || currentUser?.id_user || currentUser?.authUid || "";
      
      const matchesOwnNik = citizenNik && s.nik === citizenNik;
      const matchesUid = uid && (s.authUid === uid || s.userId === uid);
      return matchesOwnNik || matchesUid;
    });
    const pendingStatuses = ['Draft', 'Menunggu Persetujuan RT', 'Menunggu Persetujuan RW', 'Menunggu Persetujuan', 'Diajukan', 'PENDING', 'Pending', 'Pending_RT', 'PENDING_RT'];
    const pendingLetters = myLetters.filter((s: any) => s.status && pendingStatuses.includes(s.status)).length;

    return {
      saldoSampah,
      unpaidIuran: unpaidCount,
      pendingOrders,
      totalOrders: myOrders.length,
      pendingLetters
    };
  }, [isWarga, currentUser, sampahSetoranData, sampahTarikSaldoData, iuranData, tokoOrders, suratData]);

  const activeSOS = useMemo(() => {
    if (activeEmergency !== undefined) return activeEmergency;
    return emergenciesData?.find(e => e.status === 'ACTIVE') || null;
  }, [activeEmergency, emergenciesData]);
  const canResolve = useMemo(() => {
    const role = (currentUser?.role || '').toUpperCase();
    const isOwner = activeSOS && (activeSOS.userId === currentUser?.uid || activeSOS.userId === currentUser?.authUid || activeSOS.authUid === currentUser?.authUid);
    return role === 'ADMIN' || role === 'PENGURUS' || role === 'SATPAM' || currentUser?.isSuperAdmin || isOwner;
  }, [currentUser, activeSOS]);

  const months = useMemo(() => [
    { id: 'Jan', label: 'Jan' }, { id: 'Feb', label: 'Feb' }, { id: 'Mar', label: 'Mar' },
    { id: 'Apr', label: 'Apr' }, { id: 'Mei', label: 'Mei' }, { id: 'Jun', label: 'Jun' },
    { id: 'Jul', label: 'Jul' }, { id: 'Agu', label: 'Agu' }, { id: 'Sep', label: 'Sep' },
    { id: 'Okt', label: 'Okt' }, { id: 'Nov', label: 'Nov' }, { id: 'Des', label: 'Des' }
  ], []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka);
  };

  // Create a deduplicated/unique resident list to sync counts and figures around the platform
  const uniqueWargaData = useMemo(() => {
    const uniqueMap: Record<string, any> = {};
    const tId = currentTenant?.id || '';
    
    (wargaData || []).forEach(w => {
      let key = (w.nik || '').toString().trim();
      const nama = (w.nama || '').toString().trim().toLowerCase();
      
      if (!key || key === 'Belum Ada' || key === '-' || key === '0') {
        if (nama && nama !== '-') {
          key = `NAMA:${nama}`;
        } else {
          key = w.docId || w.id || Math.random().toString();
        }
      }

      const existing = uniqueMap[key];
      if (!existing) {
        uniqueMap[key] = w;
      } else {
        const existingIsLocal = existing.tenantId === tId;
        const currentIsLocal = w.tenantId === tId;
        
        let replace = false;
        if (currentIsLocal && !existingIsLocal) {
          replace = true;
        } else if (existingIsLocal === currentIsLocal) {
          if (w.terverifikasi && !existing.terverifikasi) {
            replace = true;
          } else if (w.terverifikasi === existing.terverifikasi) {
            if (Object.keys(w).length > Object.keys(existing).length) {
              replace = true;
            }
          }
        }
        if (replace) {
          uniqueMap[key] = w;
        }
      }
    });

    return Object.values(uniqueMap);
  }, [wargaData, currentTenant?.id]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalWarga = uniqueWargaData.length;
    const uniqueKK = new Set(uniqueWargaData.map((w: any) => w.kk || w.kodeKeluarga).filter(kk => kk)).size;
    const saldoTotal = kasData.reduce((acc, curr) => acc + (curr.debit || 0) - (curr.kredit || 0), 0);
    
    const pendingStatuses = ['Draft', 'Menunggu Persetujuan RT', 'Menunggu Persetujuan RW', 'Menunggu Persetujuan', 'Diajukan', 'PENDING', 'Pending', 'Pending_RT', 'PENDING_RT'];
    const suratPending = (suratData || []).filter(s => s.status && pendingStatuses.includes(s.status)).length;
    
    return {
      totalWarga,
      kepalaKeluarga: uniqueKK,
      saldoTotal,
      suratPending
    };
  }, [uniqueWargaData, kasData, suratData]);

  const yearContext = new Date().getFullYear().toString();

  const dataYearly = useMemo(() => months.map(m => {
    const monthlyData = kasData.filter(k => k.tanggal.includes(m.label));
    return {
      name: m.label,
      masuk: monthlyData.reduce((acc, curr) => acc + (curr.debit || 0), 0),
      keluar: monthlyData.reduce((acc, curr) => acc + (curr.kredit || 0), 0)
    };
  }), [months, kasData]);

  const currentChartData = useMemo(() => {
    if (kasPeriod === 'yearly') return dataYearly;
    
    const monthIdx = months.findIndex(m => m.id === kasPeriod);
    if (monthIdx === -1) return [];
    
    const daysInMonth = new Date(parseInt(yearContext), monthIdx + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayPrefix = day < 10 ? `0${day}` : `${day}`;
      const filterStr = `${dayPrefix} ${kasPeriod}`;
      const dailyData = kasData.filter(k => k.tanggal.startsWith(filterStr));
      return {
        name: dayPrefix,
        masuk: dailyData.reduce((acc, curr) => acc + (curr.debit || 0), 0),
        keluar: dailyData.reduce((acc, curr) => acc + (curr.kredit || 0), 0)
      };
    });
  }, [kasPeriod, dataYearly, months, kasData]);

  const demographics = useMemo(() => {
    const totalLaki = uniqueWargaData.filter(w => {
      const jk = (w.jk || w.jenisKelamin || '').toLowerCase();
      return jk === 'laki-laki' || jk === 'pria' || jk === 'l';
    }).length;
    const totalPerempuan = uniqueWargaData.filter(w => {
      const jk = (w.jk || w.jenisKelamin || '').toLowerCase();
      return jk === 'perempuan' || jk === 'wanita' || jk === 'p';
    }).length;
    
    const getAge = (birthDate: string) => {
      if (!birthDate) return 0;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    const ages = uniqueWargaData.map(w => getAge(w.tglLahir));
    return {
      totalLaki,
      totalPerempuan,
      totalBalita: ages.filter(a => a <= 5).length,
      totalAnak: ages.filter(a => a > 5 && a <= 12).length,
      totalRemaja: ages.filter(a => a > 12 && a <= 18).length,
      totalDewasa: ages.filter(a => a > 18 && a <= 60).length,
      totalLansia: ages.filter(a => a > 60).length
    };
  }, [uniqueWargaData]);

  const dataByRT = useMemo(() => {
    const rts: Record<string, number> = {};
    uniqueWargaData.forEach(w => {
      const rt = w.rt || '??';
      rts[rt] = (rts[rt] || 0) + 1;
    });
    return Object.entries(rts)
      .map(([name, value]) => ({ name: `RT ${name}`, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [uniqueWargaData]);

  const recentActivities = useMemo(() => {
    interface DashboardActivityItem {
      id?: string;
      title: string;
      desc: any;
      date: any;
      amount?: any;
      status?: any;
      type: string;
      dateObj: Date;
      isPersonal?: boolean;
    }
    let rawActivities: DashboardActivityItem[] = [
      ...kasData.map(k => ({ 
        title: k.tipe === 'Masuk' ? 'Pemasukan Keuangan' : 'Pengeluaran Keuangan',
        desc: k.keterangan || k.transaksi,
        date: k.tanggal,
        amount: k.debit || k.kredit,
        type: k.tipe === 'Masuk' ? 'in' : 'out',
        dateObj: parseSafeDate(k.tanggal),
        isPersonal: k.nik === currentUser?.nik || k.nama?.includes(currentUser?.name || '')
      })),
      ...iuranData.filter(i => i.status === 'Menunggu Verifikasi').map(i => ({
        title: 'Pembayaran Iuran (Pending)',
        desc: `${i.namaPenyetor} - ${i.jenis}`,
        date: i.tanggal ? new Date(i.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        amount: i.nominal,
        status: 'Menunggu',
        type: 'in',
        dateObj: new Date(i.tanggal || 0),
        isPersonal: i.nik === currentUser?.nik || i.userId === currentUser?.uid
      })),
      ...suratData.map(s => ({ 
        title: 'Surat Pengantar',
        desc: `${s.pemohon} - ${s.jenis || s.jenisSurat || 'Surat Pengantar'} (${s.keterangan || s.keperluan || '-'})`,
        date: s.tanggal,
        status: s.status,
        type: 'doc',
        dateObj: parseSafeDate(s.tanggal),
        isPersonal: s.nik === currentUser?.nik || s.pemohon === currentUser?.name
      })),
      ...bukuTamuData.map(b => ({ 
        title: 'Aktivitas Keamanan Digital',
        desc: `${b.nama} berkunjung ke ${b.tujuan} (${b.keperluan || 'Tamu'})`,
        date: b.waktuDatang ? new Date(b.waktuDatang).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: b.status,
        type: 'tamu',
        dateObj: new Date(b.waktuDatang || 0),
        isPersonal: b.nik === currentUser?.nik || b.nama === currentUser?.name
      })),
      ...posyanduKegiatanData.map(p => ({
        title: 'Kesehatan Warga',
        desc: `Kegiatan: ${p.namaKegiatan || 'Pemeriksaan Rutin'} di ${p.lokasi || 'Posyandu'}`,
        date: p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: 'Selesai',
        type: 'kesehatan',
        dateObj: new Date(p.tanggal || 0),
        isPersonal: p.nik === currentUser?.nik // Posyandu activities are often generic but could be specific
      })),
      ...sampahSetoranData.map(s => ({
        title: 'Bank Sampah',
        desc: `Setoran ${s.namaKategori || 'Sampah'}: ${s.namaNasabah || 'Nasabah'} (${s.berat}kg)`,
        date: s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        amount: s.total,
        type: 'sampah_in',
        dateObj: new Date(s.tanggal || 0),
        isPersonal: s.nik === currentUser?.nik || s.namaNasabah === currentUser?.name
      })),
      ...userVotes.map(v => ({
        title: settings?.themeMode === "apartemen" ? "Voting Penghuni" : settings?.themeMode === "cluster" ? "Voting Cluster" : "E-Pemilu SmaRtRw",
        desc: `${v.voterName} telah memberikan suara`,
        date: v.timestamp ? new Date(v.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: 'Suara Masuk',
        type: 'voting',
        dateObj: new Date(v.timestamp || 0),
        isPersonal: v.voterId === currentUser?.uid || v.voterId === currentUser?.nik
      })),
      ...tokoOrders.map(o => ({
        title: `Pesanan E-LAPAK ${getTranslatedLabel("RT/RW", settings?.themeMode)}`,
        desc: `${o.customerName} memesan ${o.items.length} item`,
        date: o.timestamp ? new Date(o.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        amount: o.total,
        type: 'toko',
        dateObj: new Date(o.timestamp || 0),
        isPersonal: o.customerId === currentUser?.uid || o.customerId === currentUser?.nik
      })),
      ...emergenciesData.map(e => ({
        title: 'Laporan SOS / Darurat',
        desc: `SOS oleh ${e.userName} di ${e.userLocation || (e.rt && e.rw ? 'RT ' + e.rt + '/RW ' + e.rw : 'Lingkungan')}`,
        date: e.timestamp ? new Date(e.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: e.status === 'ACTIVE' ? 'Aktif' : 'Selesai',
        type: 'sos',
        dateObj: new Date(e.timestamp || 0),
        isPersonal: e.userId === currentUser?.uid
      })),
      ...complaintsData.map(c => ({
        title: `Keluhan ${getTranslatedLabel("Warga", settings?.themeMode)}`,
        desc: `${c.namaWarga}: ${c.deskripsi}`,
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: c.status === 'DONE' ? 'Selesai' : c.status === 'PROCESS' ? 'Diproses' : 'Diajukan',
        type: 'complaint',
        dateObj: new Date(c.createdAt || 0),
        isPersonal: c.userId === currentUser?.uid || c.namaWarga === currentUser?.name
      })),
      ...bookingsData.map(b => ({
        title: 'Booking Fasum',
        desc: `${b.userName}: ${b.facilityName} (${b.bookingDate})`,
        date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: b.status === 'APPROVED' ? 'Disetujui' : b.status === 'REJECTED' ? 'Ditolak' : 'Menunggu',
        type: 'booking',
        dateObj: new Date(b.createdAt || 0),
        isPersonal: b.userId === currentUser?.uid || b.userName === currentUser?.name
      })),
      ...verifikasiWargaData.map(v => ({
        title: `Verifikasi Data ${getTranslatedLabel("Warga", settings?.themeMode)}`,
        desc: `${v.nama}: Pembaruan data mandiri`,
        date: v.timestamp ? new Date(v.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: v.status || 'Diajukan',
        type: 'doc',
        dateObj: new Date(v.timestamp || 0),
        isPersonal: v.authUid === currentUser?.uid || v.nik === currentUser?.nik
      })),
    ];

    if (isWarga) {
      rawActivities = rawActivities.filter(act => act.isPersonal);
    }

    return rawActivities.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 15);
  }, [isWarga, currentUser, kasData, suratData, bukuTamuData, posyanduKegiatanData, sampahSetoranData, userVotes, tokoOrders, emergenciesData, complaintsData, bookingsData, verifikasiWargaData]);

  const activityChartData = useMemo(() => {
    const getActData = (period: string) => {
      const INDONESIAN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const currentMonth = INDONESIAN_MONTHS[new Date().getMonth()];
      const filteredSurat = period === 'yearly' ? suratData : suratData.filter(s => s.tanggal && s.tanggal.includes(currentMonth));
      const filteredKas = period === 'yearly' ? kasData : kasData.filter(k => k.tanggal && k.tanggal.includes(currentMonth));

      return [
        { name: 'Pemasukan Kas', value: filteredKas.filter(k => k.tipe === 'Masuk').length },
        { name: 'Pengeluaran Kas', value: filteredKas.filter(k => k.tipe === 'Keluar').length },
        { name: getTranslatedLabel("Surat Pengantar", settings?.themeMode), value: filteredSurat.length },
        { name: getTranslatedLabel("Data Warga", settings?.themeMode), value: uniqueWargaData.length },
      ];
    };
    return piePeriod === 'yearly' ? getActData('yearly') : getActData('30days');
  }, [piePeriod, suratData, kasData, uniqueWargaData]);

  const kasVsOperasionalData = useMemo(() => {
    const parseVal = (val: any) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const cleaned = val.toString().replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const saldoTotal = kasData.reduce((acc, curr) => acc + parseVal(curr.debit) - parseVal(curr.kredit), 0);
    const totalPemasukan = kasData.reduce((acc, curr) => acc + parseVal(curr.debit), 0);
    const totalPengeluaran = kasData.reduce((acc, curr) => acc + parseVal(curr.kredit), 0);
    
    let hppPlan = 0;
    if (settings) {
      const security = parseVal(settings.hpp_security_cost);
      const trash = parseVal(settings.hpp_trash_cost);
      const electricity = parseVal(settings.hpp_electricity_cost);
      const admin = parseVal(settings.hpp_admin_cost);
      const gov = parseVal(settings.hpp_gov_cost);
      const social = parseVal(settings.hpp_social_cost);
      hppPlan = security + trash + electricity + admin + gov + social;
    }

    return [
      { name: 'Saldo Kas', value: Math.max(0, saldoTotal) },
      { name: 'Pemasukan Kas', value: totalPemasukan },
      { name: 'Pengeluaran Kas', value: totalPengeluaran },
      { name: 'Est. Biaya per Bulan', value: hppPlan }
    ];
  }, [kasData, settings]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  const isPaidPremium = ['FLASH', 'PRO', 'PREMIUM', 'ENTERPRISE', 'GOLD', 'DIAMOND', 'PRIME', 'GOV', 'RW', 'BASIC', 'RT', 'LITE'].some(st => currentTenant?.status?.toUpperCase()?.includes(st)) || (currentTenant?.parentId && currentTenant?.parentId !== "MASTER" && currentTenant?.id !== "MASTER");

  const isStarter = !isPaidPremium && (!currentTenant?.status || 
                    ['STARTER', 'GRATIS', 'FREE', 'TRIAL', 'ACTIVE'].includes(currentTenant?.status?.toUpperCase()));

  const adminRoles = ['SUPER_ADMIN', 'MASTER', 'KELURAHAN_ADMIN', 'ADMIN', 'RW', 'RT', 'OPERATOR', 'SEKRETARIS', 'BENDAHARA'];
  const isAdminUser = adminRoles.includes(userRole?.toUpperCase() || '');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const trialEndDate = useMemo(() => {
    // Determine the target end date for the countdown
    let createdAt = currentTenant?.createdAt;
    
    if (!createdAt && currentTenant?.id && currentTenant.id.startsWith('DEMO_')) {
      // Mock for demo/master tenants to show the feature
      const demoStart = new Date('2026-06-05T00:00:00Z'); 
      createdAt = demoStart.toISOString();
    }

    if (!createdAt) return null;

    const startDate = typeof createdAt === 'string' 
      ? new Date(createdAt) 
      : (createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000));
    
    const endDate = new Date(startDate);
    
    if (isStarter) {
      // Free trials get 30 days
      endDate.setDate(endDate.getDate() + 30);
    } else {
      // Paid packages show their expiry if available, or a 1-year baseline for demo
      if (currentTenant?.expiredAt) {
        return new Date(currentTenant.expiredAt);
      }
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return endDate;
  }, [currentTenant, isStarter]);

  const timeLeft = useMemo(() => {
    const target = trialEndDate;
    if (!target) return null;
    
    const diff = target.getTime() - currentTime.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }, [trialEndDate, currentTime]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 font-sans pt-[54px]">
      {/* Banner CTA Upgrade Paket - Sangat Menarik, Minimalis, Terintegrasi dengan Masa Trial 30 Hari */}
      <div 
        onClick={() => setShowUpgradeModal(true)}
        className="w-full relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-indigo-500/20 group cursor-pointer hover:border-brand-blue/60 hover:shadow-brand-blue/20 hover:scale-[1.005] active:scale-[0.99] transition-all duration-300"
      >
        {/* Dekorasi Cahaya Latar Belakang */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Zap className="w-32 h-32 text-cyan-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 animate-pulse" />
        </div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-brand-blue/30 rounded-full blur-3xl group-hover:bg-brand-blue/40 transition-colors pointer-events-none"></div>
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
          {/* Sisi Kiri: Informasi Utama */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Akses Fitur Premium Terlengkap</span>
              </div>
              
              {isStarter && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Masa Percobaan Aktif</span>
                </div>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-black font-elegant tracking-tight leading-tight text-white flex flex-wrap items-center gap-2">
              Upgrade Paket SmaRtRw AI Selengkapnya!
              <span className="text-[10px] bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold uppercase px-2.5 py-1 rounded-full">FLASH / PRO / PREMIUM</span>
            </h3>
            
            <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
              Tingkatkan status wilayah Anda ke paket premium untuk mengaktifkan modul eksklusif seperti Analytics AI, Posyandu Digital, Mading Digital, Bank Sampah Mandiri, e-Pemilu dan hilangkan batas kuota warga!
            </p>

            {isStarter && (
              <div className="bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-yellow-300 inline-flex items-center gap-2 animate-pulse shadow-sm">
                <span>⚠️ Amankan Data: Seluruh data wilayah Anda akan tetap tersimpan aman dengan upgrade ke premium</span>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Widget Countdown & Tombol CTA */}
          <div className="flex flex-col items-center justify-center gap-5 shrink-0 bg-slate-950/60 p-6 rounded-[2rem] border border-white/10 shadow-2xl text-center w-full lg:w-auto relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
              {timeLeft && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (timeLeft.days / 30) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                />
              )}
            </div>
            
            {timeLeft && (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex flex-col items-center justify-center leading-none relative">
                  <p 
                    className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 text-slate-400 mb-1.5 flex items-center gap-2 cursor-pointer hover:text-white transition-colors" 
                    onClick={() => setHideSubscriptionInfo(!hideSubscriptionInfo)}
                  >
                    {!hideSubscriptionInfo 
                      ? (isPaidPremium ? "Sisa Masa Langganan" : "Sisa Masa Trial")
                      : "Sisa Masa (Tersembunyi)"
                    }
                    {hideSubscriptionInfo ? <EyeOff size={10} /> : <Eye size={10} />}
                  </p>
                </div>
                
                {!hideSubscriptionInfo && (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <motion.span 
                        key={timeLeft.days}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl font-black tabular-nums text-white"
                      >
                        {timeLeft.days.toString().padStart(2, '0')}
                      </motion.span>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Hari</span>
                    </div>
                    <span className="text-xl font-black text-slate-700 mt-[-14px]">:</span>
                    <div className="flex flex-col items-center">
                      <motion.span 
                        key={timeLeft.hours}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl font-black tabular-nums text-amber-400"
                      >
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </motion.span>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Jam</span>
                    </div>
                    <span className="text-xl font-black text-slate-700 mt-[-14px]">:</span>
                    <div className="flex flex-col items-center">
                      <motion.span 
                        key={timeLeft.minutes}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl font-black tabular-nums text-rose-400"
                      >
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </motion.span>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Min</span>
                    </div>
                    <span className="text-xl font-black text-slate-700 mt-[-14px]">:</span>
                    <div className="flex flex-col items-center">
                      <motion.span 
                        key={timeLeft.seconds}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-black tabular-nums text-white"
                      >
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </motion.span>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Det</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.05, y: -4, boxShadow: "0 20px 40px -10px rgba(54, 211, 230, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowUpgradeModal(true);
              }}
              className="flex items-center justify-center gap-3 bg-gradient-to-br from-cyan-400 via-brand-blue to-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.2em] px-8 py-4.5 rounded-2xl shadow-xl hover:shadow-cyan-400/30 transition-all text-center border border-white/20 whitespace-nowrap group/btn"
            >
              <span>Upgrade Sekarang</span>
              <ChevronRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
      {/* SOS Alert & Plan Info */}
      <div className="flex flex-col md:flex-row gap-6 mb-2">
        {activeSOS ? (
          <div 
            className="flex-1 bg-gradient-to-tr from-rose-600 via-red-600 to-rose-700 p-8 rounded-3xl shadow-2xl shadow-rose-500/40 border-4 border-white/20 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <Siren size={120} />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center animate-pulse border border-white/30 shadow-inner">
                  <Siren className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-2 text-white font-elegant">DARURAT: {activeSOS.lokasi?.toUpperCase() || 'LINGKUNGAN'}</h3>
                  <p className="font-bold text-white/90 text-sm uppercase tracking-wider leading-relaxed">{activeSOS.keterangan || `Bantuan segera dibutuhkan oleh ${activeSOS.userName || 'Warga'}.`}</p>
                </div>
              </div>
              
              {canResolve && onResolveSOS && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('Hentikan sinyal darurat ini?')) {
                      onResolveSOS(activeSOS.id);
                    }
                  }}
                  className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-50 transition-all active:scale-95 shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  STOP SOS
                </button>
              )}
            </div>
          </div>
        ) : isWarga ? (
          <div className="flex-1 bg-gradient-to-tr from-brand-blue via-indigo-600 to-indigo-800 p-4 sm:p-10 rounded-3xl shadow-2xl shadow-brand-blue/30 text-white relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-10 opacity-10 -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-1.5 h-8 bg-cyan-400 rounded-full"></div>
                 <h2 className="text-[20px] italic font-black font-elegant tracking-tight" style={{ fontFamily: "Outfit", fontStyle: "italic" }}><span style={{ fontFamily: "Outfit", fontStyle: "italic" }}>Halo, {currentUser?.name || getTranslatedLabel("Warga", settings?.themeMode)}!</span></h2>
              </div>
              <p className="text-blue-100/70 text-[11px] font-black uppercase tracking-widest mb-10 ml-6">Digital Ecosystem • SmaRtRw AI Dashboard</p>
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Saldo Sampah', val: `Rp ${personalStats?.saldoSampah.toLocaleString('id-ID')}`, icon: Recycle, color: 'text-emerald-400', tab: 'bank-sampah' },
                  { label: 'Belum Lunas', val: `${personalStats?.unpaidIuran} Bulan`, icon: CreditCard, color: 'text-rose-400', tab: 'keuangan' },
                  { label: 'Pesanan Lapak', val: `${personalStats?.pendingOrders} Proses`, icon: ShoppingBag, color: 'text-amber-400', tab: 'etoko' },
                  { label: 'Permohonan Surat', val: `${personalStats?.pendingLetters || 0} Aktif`, icon: FileText, color: 'text-cyan-400', tab: 'surat' },
                ].filter(item => !(item.tab === 'etoko' && currentTenant?.id === 'rt03gas_rw27')).map((item, i) => (
                  <div 
                    key={i}
                    onClick={() => item.tab && setActiveTab && setActiveTab(item.tab)}
                    className={`bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-inner group/item transition-all duration-300 ${item.tab ? 'cursor-pointer hover:bg-white/20 hover:scale-[1.02] active:scale-95' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                       <div className="p-2 bg-white/5 rounded-xl">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                       </div>
                       <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{item.label}</p>
                    </div>
                    <p className="text-lg font-black tracking-tight font-elegant">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-center relative overflow-hidden group transition-all duration-300">
            <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <Smartphone className="w-8 h-8 text-brand-blue" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase font-elegant" style={{ fontFamily: "Outfit", fontSize: "22px" }}>GoLive</h3>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest" style={{ marginLeft: '16px' }}>{currentTenant?.name || settings?.nama_rt || 'Digital Environment'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {allowedMenuItems && allowedMenuItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-brand-blue" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-widest uppercase">Fitur Klik</h3>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {allowedMenuItems
              .filter(item => !['dashboard', 'pengaturan', 'users', 'kop-template'].includes(item.id))
              .filter(item => {
                if (item.id === "sos-monitor") {
                  const role = (currentUser?.role || '').toUpperCase();
                  return true;
                }
                return true;
              })
              .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isLocked) {
                    setShowUpgradeModal(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl border transition-all duration-300 gap-3 min-h-[144px] ${
                  item.isLocked
                    ? "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 opacity-60 cursor-not-allowed"
                    : "bg-slate-50 border-transparent hover:border-brand-blue/30 hover:shadow-lg hover:shadow-brand-blue/10 dark:bg-slate-800/50 dark:border-transparent dark:hover:border-brand-blue/30 group"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform shrink-0 ${item.isLocked ? "bg-slate-200 dark:bg-slate-800 text-slate-400" : "bg-brand-blue/10 text-brand-blue group-hover:scale-110 group-hover:bg-brand-blue/20"}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[11px] sm:text-xs font-bold sm:font-black uppercase text-center tracking-wide w-full line-clamp-2 leading-snug break-words ${item.isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isWarga && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: getTranslatedLabel("Daftar Warga", settings?.themeMode), val: stats.totalWarga, sub: `KK: ${stats.kepalaKeluarga} Terdaftar`, icon: Users, gradient: 'from-emerald-600 to-teal-700', shadow: 'shadow-emerald-500/20', tab: 'warga' },
            { label: getTranslatedLabel("Kas Warga", settings?.themeMode), val: `Rp ${formatRupiah(stats.saldoTotal)}`, sub: 'Perekaman Otomatis', icon: CreditCard, gradient: 'from-brand-blue to-indigo-800', shadow: 'shadow-brand-blue/20', tab: 'keuangan' },
            { label: getTranslatedLabel("Permohonan Surat", settings?.themeMode), val: stats.suratPending, sub: 'Menunggu Persetujuan', icon: FileText, gradient: 'from-rose-600 to-pink-700', shadow: 'shadow-pink-500/20', tab: 'surat' }
          ].map((item, i) => (
            <div 
              key={i}
              onClick={() => item.tab && setActiveTab && setActiveTab(item.tab)}
              className={`bg-gradient-to-br ${item.gradient} p-8 rounded-3xl border border-white/20 shadow-2xl ${item.shadow} dark:shadow-none flex flex-col justify-center relative overflow-hidden group transition-all text-white cursor-pointer hover:scale-[1.02] hover:brightness-105 active:scale-95 duration-300`}
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
              <p className="text-[11px] text-white/80 font-black uppercase tracking-widest mb-6 drop-shadow-sm">{item.label}</p>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white leading-none mb-2 font-elegant drop-shadow-lg tracking-tight">
                    {item.val}
                  </p>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-wider">{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MadingDigitalView 
        currentUser={currentUser}
        userRole={userRole}
        currentTenant={currentTenant}
        showNotification={showNotification}
        handleFirestoreError={handleFirestoreError}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-4 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:border-brand-blue/30 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center shadow-inner border border-brand-blue/10">
                <TrendingUp className="w-8 h-8 text-brand-blue" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase font-elegant leading-none">Keuangan</h3>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Cash Flow Statistics</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <select 
                value={kasPeriod}
                onChange={(e) => setKasPeriod(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-brand-blue/20 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 px-8 py-4 outline-none focus:ring-4 ring-brand-blue/5 shadow-sm transition-all appearance-none cursor-pointer pr-14"
              >
                <optgroup label="Periodic View">
                  <option value="yearly">Full 2026 Archive</option>
                </optgroup>
                <optgroup label="Monthly Deep Dive">
                  {months.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </optgroup>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%" style={{ height: '350px' } as any}>
              <AreaChart data={currentChartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900, fontFamily: 'JetBrains Mono'}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900, fontFamily: 'JetBrains Mono'}}
                  tickFormatter={formatRupiah}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="masuk" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorIn)" animationDuration={1500} />
                <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={5} fillOpacity={1} fill="url(#colorOut)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:border-pink-500/30 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center shadow-inner border border-pink-500/10">
                <PieIcon className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase font-elegant leading-none">Distribusi</h3>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Public Service Metrics</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <select 
                value={piePeriod}
                onChange={(e) => setPiePeriod(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-pink-500/20 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 px-8 py-4 outline-none focus:ring-4 ring-pink-500/5 shadow-sm transition-all appearance-none cursor-pointer pr-14"
              >
                <option value="30days">Last 30 Days</option>
                <option value="yearly">Full 2026</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full flex flex-col md:flex-row items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Total</p>
                 <p className="text-3xl font-black text-slate-800 dark:text-slate-100 font-elegant leading-none mt-1">{activityChartData.reduce((acc, curr) => acc + curr.value, 0)}</p>
              </div>
              <ResponsiveContainer width={260} height={260}>
                <PieChart>
                  <Pie
                    data={activityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {activityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={document.documentElement.classList.contains('dark') ? '#0f172a' : 'white'} strokeWidth={6} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 justify-center md:ml-12 mt-8 md:mt-0 w-full md:w-auto">
              {activityChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between md:justify-start gap-6 p-2 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{entry.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums font-mono">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kas vs HPP */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:border-emerald-500/30 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-500/10">
                <CreditCard className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase font-elegant leading-none">Kas vs Est. Biaya per Bulan</h3>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Sinkronisasi Biaya & Rencana Operasional</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full flex flex-col md:flex-row items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <ResponsiveContainer width={260} height={260}>
                <PieChart>
                  <Pie
                    data={kasVsOperasionalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {kasVsOperasionalData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? '#4f46e5' : // Saldo Kas (Indigo)
                          index === 1 ? '#10b981' : // Pemasukan Kas (Emerald)
                          index === 2 ? '#f43f5e' : // Pengeluaran Kas (Rose)
                          '#f97316'                 // HPP PLAN (Orange)
                        } 
                        stroke={document.documentElement.classList.contains('dark') ? '#0f172a' : 'white'} 
                        strokeWidth={6} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}
                    formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 justify-center md:ml-12 mt-8 md:mt-0 w-full md:w-auto">
              {kasVsOperasionalData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between md:justify-start gap-6 p-2 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform" 
                      style={{ 
                        backgroundColor: 
                          index === 0 ? '#4f46e5' : 
                          index === 1 ? '#10b981' : 
                          index === 2 ? '#f43f5e' : 
                          '#f97316' 
                      }}
                    ></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{entry.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums font-mono">Rp {entry.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-10 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-500/5">
                <Clock className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase font-elegant text-center sm:text-left">Log Aktivitas</h3>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Sinkronisasi Real-time Lingkungan</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-2xl mx-auto space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {recentActivities.map((act, i) => (
              <div 
                key={`activity-${act.id || i}`}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 text-center sm:text-left"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg ${
                  act.type === 'in' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 
                  act.type === 'out' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' :
                  act.type === 'doc' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                  act.type === 'tamu' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' :
                  act.type === 'kesehatan' ? 'bg-pink-50 text-pink-600 dark:bg-pink-500/10' :
                  act.type === 'sampah_in' ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10' :
                  act.type === 'voting' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' :
                  act.type === 'sos' ? 'bg-red-50 text-red-600 dark:bg-red-500/10' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800'
                }`}>
                  {act.type === 'in' && <TrendingUp size={24} />}
                  {act.type === 'out' && <TrendingUp size={24} className="rotate-180" />}
                  {act.type === 'doc' && <FileText size={24} />}
                  {act.type === 'tamu' && <Users size={24} />}
                  {act.type === 'kesehatan' && <CheckCircle2 size={24} />}
                  {act.type === 'sampah_in' && <TrendingUp size={24} />}
                  {act.type === 'voting' && <FileText size={24} />}
                  {act.type === 'toko' && <CreditCard size={24} />}
                  {act.type === 'sos' && <Siren size={24} />}
                  {act.type === 'complaint' && <MessageSquare size={24} />}
                  {act.type === 'booking' && <Calendar size={24} />}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 gap-2">
                    <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight font-elegant truncate w-full sm:max-w-[70%] text-center sm:text-left">{act.title}</h4>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">{act.date}</span>
                  </div>
                  <p className="text-[13px] text-slate-700 dark:text-slate-200 font-bold leading-tight tracking-tight text-center sm:text-left">{act.desc}</p>
                </div>
                {act.amount && (
                  <span className={`text-lg font-black tracking-tighter mt-1 sm:mt-0 sm:ml-4 font-elegant tabular-nums shrink-0 ${act.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {act.type === 'in' ? '+' : ''}{formatRupiah(act.amount)}
                  </span>
                )}
                {act.status && (
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border mt-1 sm:mt-0 sm:ml-4 shadow-sm shrink-0 ${
                    act.status === 'Selesai' || act.status === 'Disetujui' || act.status === 'Suara Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                    act.status === 'Diajukan' || act.status === 'Menunggu' || act.status === 'Diproses' || act.status === 'Aktif' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                    act.status === 'Ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                    'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {act.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-3xl relative overflow-hidden group shadow-2xl shadow-slate-900/40">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <QrCode size={180} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-1.5 h-6 bg-brand-blue rounded-full"></div>
                 <h3 className="text-2xl font-black text-white tracking-tight leading-none font-verdana uppercase">Portal Mandiri</h3>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-10 ml-5 opacity-70">Layanan Akses Cepat Warga</p>
              
              <div className="grid md:grid-cols-5 gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {!isWarga && (
                  <button 
                    onClick={() => setShowQRModal(true)}
                    className="w-full h-32 bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group/btn border border-white/10 backdrop-blur-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-center leading-tight">Daftar Tamu</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setActiveTab('surat')}
                  className="w-full h-32 bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group/btn border border-white/10 backdrop-blur-xl shadow-lg"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-center leading-tight">Surat</span>
                </button>

                <button 
                  onClick={() => setActiveTab('keuangan')}
                  className="w-full h-32 bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group/btn border border-white/10 backdrop-blur-xl shadow-lg"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-center leading-tight">Iuran</span>
                </button>

                {(currentTenant?.status !== 'STARTER' || currentTenant?.id === 'rt03gas_rw27') && isAdminUser && (
                  <button 
                    onClick={() => setShowAIChat(true)}
                    className="w-full h-32 bg-purple-600/40 hover:bg-purple-600/60 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group/btn border border-purple-500/30 backdrop-blur-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-400/30">
                      <Bot className="w-6 h-6 text-fuchsia-300" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-center leading-tight">AI CS Warga</span>
                  </button>
                )}

                {!isStarter && isAdminUser && (
                  <button 
                    onClick={() => setActiveTab('analitik')}
                    className="w-full h-32 bg-indigo-600/40 hover:bg-indigo-600/60 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group/btn border border-indigo-500/30 backdrop-blur-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-400/30">
                      <TrendingUp className="w-6 h-6 text-cyan-300" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-center leading-tight">ANALYTICS AI</span>
                  </button>
                )}

                {currentTenant?.id !== 'rt03gas_rw27' && (
                  <button 
                    onClick={() => setActiveTab('etoko')}
                    className="w-full h-32 bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group/btn border border-white/10 backdrop-blur-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-center leading-tight">E-LAPAKITA</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#ae126f] p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
              <Users size={120} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tighter leading-none mb-2">DEMOGRAFI WARGA</h3>
              <p className="text-[#eabebe] text-xs font-bold uppercase tracking-widest mb-6">Sebaran penduduk rukun warga</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-[#f5f5f5] uppercase tracking-widest mb-1">Pria</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalLaki}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-[#f5f5f5] uppercase tracking-widest mb-1">Wanita</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalPerempuan}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-[#ffffff] uppercase tracking-widest mb-1">Balita</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalBalita}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-[#ffffff] uppercase tracking-widest mb-1">Remaja</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalRemaja}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-[#ffffff] uppercase tracking-widest mb-1">Dewasa</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalDewasa}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-[#fdfdfd] uppercase tracking-widest mb-1">Lansia</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalLansia}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating AI Chat Button */}
      {(currentTenant?.status !== 'STARTER' || currentTenant?.id === 'rt03gas_rw27') && isAdminUser && (
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-brand-blue text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-transform active:scale-95"
        >
          <Bot className="w-8 h-8" />
        </button>
      )}

      {/* AI Chat Window */}
        {showAIChat && (currentTenant?.status !== 'STARTER' || currentTenant?.id === 'rt03gas_rw27') && isAdminUser && (
          <div
              className="fixed bottom-24 right-6 z-50 w-full max-w-md"
            >
            <AIChatBot currentUser={currentUser} agentType="cs" plan={currentTenant?.status} />
          </div>
        )}
    </div>
  );
}
