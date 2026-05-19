import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, FileText, CreditCard, Siren, TrendingUp, Search, 
  MapPin, Clock, CheckCircle2, QrCode, Smartphone, Bot, LayoutGrid,
  AlertTriangle, Calendar, BookCopy, ShieldCheck, Baby, Recycle, ShoppingBag, Vote, Package, User, Shield, Settings, MessageSquare, Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import AIChatBot from './AIChatBot';

interface DashboardViewProps {
  kasData: any[];
  wargaData: any[];
  suratData: any[];
  iuranData: any[];
  emergenciesData: any[];
  handleTriggerSOS: () => void;
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
}

export default function DashboardView({ 
  kasData, 
  wargaData, 
  suratData, 
  iuranData, 
  emergenciesData, 
  handleTriggerSOS, 
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
  allowedMenuItems
}: DashboardViewProps) {
  const [kasPeriod, setKasPeriod] = useState('yearly');
  const [piePeriod, setPiePeriod] = useState('30days');
  const [linkForm, setLinkForm] = useState({ nik: '', pin: '' });
  const [showAIChat, setShowAIChat] = useState(false);

  const isWarga = userRole === 'WARGA';

  // Personal Stats for Warga
  const personalStats = useMemo(() => {
    if (!isWarga || !currentUser?.nik) return null;

    const mySetoran = sampahSetoranData.filter((s: any) => s.nik === currentUser.nik || s.namaNasabah === currentUser.name);
    const myTarik = sampahTarikSaldoData.filter((s: any) => s.nik === currentUser.nik || s.namaNasabah === currentUser.name);
    const totalSetoran = mySetoran.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalTarik = myTarik.reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
    const saldoSampah = totalSetoran - totalTarik;

    const myIuran = iuranData.filter((i: any) => i.nik === currentUser.nik || i.userId === currentUser.uid || i.namaPenyetor?.toLowerCase().includes(currentUser.name?.toLowerCase()));
    
    // Calculate missing months for the current year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let unpaidCount = 0;
    
    for (let m = 0; m <= currentMonth; m++) {
      const isPaid = myIuran.some((trx: any) => {
        if (trx.status !== 'Lunas') return false;
        const d = new Date(trx.tanggal);
        const matchesDate = d.getMonth() === m && d.getFullYear() === currentYear;
        const isIuranWajib = trx.jenis?.toLowerCase().includes('iuran') || trx.keterangan?.toLowerCase().includes('iuran');
        return matchesDate && isIuranWajib;
      });
      if (!isPaid) unpaidCount++;
    }

    const myOrders = tokoOrders.filter((o: any) => o.customerId === currentUser.uid || o.customerId === (currentUser.nik || ''));
    const pendingOrders = myOrders.filter((o: any) => o.status === 'PENDING' || o.status === 'PROCESS').length;

    return {
      saldoSampah,
      unpaidIuran: unpaidCount,
      pendingOrders,
      totalOrders: myOrders.length
    };
  }, [isWarga, currentUser, sampahSetoranData, sampahTarikSaldoData, iuranData, tokoOrders]);

  const activeSOS = useMemo(() => emergenciesData?.find(e => e.status === 'ACTIVE'), [emergenciesData]);

  const months = useMemo(() => [
    { id: 'Jan', label: 'Jan' }, { id: 'Feb', label: 'Feb' }, { id: 'Mar', label: 'Mar' },
    { id: 'Apr', label: 'Apr' }, { id: 'Mei', label: 'Mei' }, { id: 'Jun', label: 'Jun' },
    { id: 'Jul', label: 'Jul' }, { id: 'Agu', label: 'Agu' }, { id: 'Sep', label: 'Sep' },
    { id: 'Okt', label: 'Okt' }, { id: 'Nov', label: 'Nov' }, { id: 'Des', label: 'Des' }
  ], []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka);
  };

  // Memoized stats
  const stats = useMemo(() => {
    const totalWarga = wargaData.length;
    const uniqueKK = new Set(wargaData.map((w: any) => w.kk || w.kodeKeluarga).filter(kk => kk)).size;
    const saldoTotal = kasData.reduce((acc, curr) => acc + (curr.debit || 0) - (curr.kredit || 0), 0);
    const suratPending = suratData.filter(s => s.status === 'Diajukan' || s.status.includes('Menunggu')).length;
    
    return {
      totalWarga,
      kepalaKeluarga: uniqueKK,
      saldoTotal,
      suratPending
    };
  }, [wargaData, kasData, suratData]);

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
    const totalLaki = wargaData.filter(w => {
      const jk = (w.jk || w.jenisKelamin || '').toLowerCase();
      return jk === 'laki-laki' || jk === 'pria' || jk === 'l';
    }).length;
    const totalPerempuan = wargaData.filter(w => {
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

    const ages = wargaData.map(w => getAge(w.tglLahir));
    return {
      totalLaki,
      totalPerempuan,
      totalBalita: ages.filter(a => a <= 5).length,
      totalAnak: ages.filter(a => a > 5 && a <= 12).length,
      totalRemaja: ages.filter(a => a > 12 && a <= 18).length,
      totalDewasa: ages.filter(a => a > 18 && a <= 60).length,
      totalLansia: ages.filter(a => a > 60).length
    };
  }, [wargaData]);

  const dataByRT = useMemo(() => {
    const rts: Record<string, number> = {};
    wargaData.forEach(w => {
      const rt = w.rt || '??';
      rts[rt] = (rts[rt] || 0) + 1;
    });
    return Object.entries(rts)
      .map(([name, value]) => ({ name: `RT ${name}`, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wargaData]);

  const recentActivities = useMemo(() => {
    let rawActivities = [
      ...kasData.map(k => ({ 
        title: k.tipe === 'Masuk' ? 'Pemasukan Keuangan' : 'Pengeluaran Keuangan',
        desc: k.keterangan || k.transaksi,
        date: k.tanggal,
        amount: k.debit || k.kredit,
        type: k.tipe === 'Masuk' ? 'in' : 'out',
        dateObj: new Date(k.tanggal),
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
        desc: `${s.pemohon} - ${s.jenisSurat} (${s.keperluan || '-'})`,
        date: s.tanggal,
        status: s.status,
        type: 'doc',
        dateObj: new Date(s.tanggal),
        isPersonal: s.nik === currentUser?.nik || s.pemohon === currentUser?.name
      })),
      ...bukuTamuData.map(b => ({ 
        title: 'Aktivitas Buku Tamu',
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
        title: 'E-Pemilu SmartRW',
        desc: `${v.voterName} telah memberikan suara`,
        date: v.timestamp ? new Date(v.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: 'Suara Masuk',
        type: 'voting',
        dateObj: new Date(v.timestamp || 0),
        isPersonal: v.voterId === currentUser?.uid || v.voterId === currentUser?.nik
      })),
      ...tokoOrders.map(o => ({
        title: 'Pesanan E-LAPAK SmartRW',
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
        title: 'Keluhan Warga',
        desc: `${c.namaWarga}: ${c.deskripsi}`,
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: c.status === 'DONE' ? 'Selesai' : c.status === 'PROCESS' ? 'Diproses' : 'Diajukan',
        type: 'complaint',
        dateObj: new Date(c.createdAt || 0),
        isPersonal: c.userId === currentUser?.uid || c.namaWarga === currentUser?.name
      })),
      ...bookingsData.map(b => ({
        title: 'Booking Fasilitas',
        desc: `${b.userName}: ${b.facilityName} (${b.bookingDate})`,
        date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
        status: b.status === 'APPROVED' ? 'Disetujui' : b.status === 'REJECTED' ? 'Ditolak' : 'Menunggu',
        type: 'booking',
        dateObj: new Date(b.createdAt || 0),
        isPersonal: b.userId === currentUser?.uid || b.userName === currentUser?.name
      })),
    ];

    if (isWarga) {
      rawActivities = rawActivities.filter(act => act.isPersonal);
    }

    return rawActivities.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 15);
  }, [isWarga, currentUser, kasData, suratData, bukuTamuData, posyanduKegiatanData, sampahSetoranData, userVotes, tokoOrders, emergenciesData, complaintsData, bookingsData]);

  const activityChartData = useMemo(() => {
    const getActData = (period: string) => {
      const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'short' });
      const filteredSurat = period === 'yearly' ? suratData : suratData.filter(s => s.tanggal && s.tanggal.includes(currentMonth));
      const filteredKas = period === 'yearly' ? kasData : kasData.filter(k => k.tanggal && k.tanggal.includes(currentMonth));

      return [
        { name: 'Pemasukan Kas', value: filteredKas.filter(k => k.tipe === 'Masuk').length },
        { name: 'Pengeluaran Kas', value: filteredKas.filter(k => k.tipe === 'Keluar').length },
        { name: 'Surat Pengantar', value: filteredSurat.length },
        { name: 'Data Warga', value: wargaData.length },
      ];
    };
    return piePeriod === 'yearly' ? getActData('yearly') : getActData('30days');
  }, [piePeriod, suratData, kasData, wargaData]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  const isStarter = !currentTenant?.status || 
                    currentTenant?.status === 'STARTER' || 
                    currentTenant?.status === 'GRATIS' || 
                    currentTenant?.status === 'BASIC' || 
                    currentTenant?.status === 'TRIAL' ||
                    currentTenant?.status === 'ACTIVE' ||
                    currentTenant?.id === 'RW26_SMART';

  const trialEndDate = useMemo(() => {
    if (!isStarter) return null;
    
    // For demo tenant, use a fixed trial (e.g., 30 days from some stable date if createdAt is missing)
    let createdAt = currentTenant?.createdAt;
    
    if (!createdAt && currentTenant?.id === 'RW26_SMART') {
      // Mock for demo
      const demoStart = new Date();
      demoStart.setDate(demoStart.getDate() - 5); // 5 days ago
      createdAt = demoStart.toISOString();
    }

    if (!createdAt) return null;

    const startDate = typeof createdAt === 'string' 
      ? new Date(createdAt) 
      : (createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    return endDate;
  }, [currentTenant, isStarter]);

  const daysRemaining = useMemo(() => {
    if (!trialEndDate) return null;
    const now = new Date();
    const diff = trialEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [trialEndDate]);

  return (
    <div className="space-y-6">
      {daysRemaining !== null && isStarter && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-[2rem] flex items-center justify-between shadow-lg shadow-orange-200 dark:shadow-none text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-tight">Masa Percobaan Aktif</h3>
              <p className="text-[10px] font-bold text-white/80 uppercase">Nikmati Fitur SmartRW AI Tanpa Batas</p>
            </div>
          </div>
          <div className="text-right relative z-10">
            <p className="text-[10px] font-black uppercase tracking-tighter opacity-80 mb-0.5">Berakhir Dalam</p>
            <span className="font-mono text-2xl font-black tabular-nums">
              {daysRemaining} Hari
            </span>
          </div>
        </motion.div>
      )}
      {/* SOS Alert & Plan Info */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        {activeSOS ? (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setActiveTab('dashboard')}
            className="flex-1 bg-red-600 p-6 rounded-[2.5rem] shadow-red-200 shadow-xl border-4 border-red-500 overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
              <Siren size={80} />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center animate-pulse border border-white/30">
                <Siren className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 text-white">DARURAT: {activeSOS.lokasi || 'LINGKUNGAN'}</h3>
                <p className="font-bold text-white/90 text-xs uppercase tracking-widest">{activeSOS.keterangan || 'Bantuan segera dibutuhkan.'}</p>
              </div>
            </div>
          </motion.div>
        ) : isWarga ? (
          <div className="flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 -mr-10 -mt-10">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-1">Halo, {currentUser?.name || 'Warga'}!</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-6">Nikmati layanan mandiri & pantau keuangan pribadi Anda.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Tabungan Sampah</p>
                  <p className="text-lg font-black leading-none flex items-center gap-1 group/item">
                    <Recycle className="w-3 h-3 text-emerald-400 group-hover/item:rotate-180 transition-transform" />
                    Rp {personalStats?.saldoSampah.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Iuran Belum Lunas</p>
                  <p className="text-lg font-black leading-none flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-red-400" />
                    {personalStats?.unpaidIuran} Tagihan
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Pesanan E-Lapak</p>
                  <p className="text-lg font-black leading-none flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-orange-400" />
                    {personalStats?.pendingOrders} Diproses
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Status Akun</p>
                  <p className="text-lg font-black leading-none flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Terverifikasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-center relative overflow-hidden group transition-colors">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight mb-0.5 uppercase">SISTEM AKTIF</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{currentTenant?.name || settings?.nama_rt || 'SmartRW AI'}</p>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2 transition-colors">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></div>
                Cloud Secured
              </div>
            </div>
          </div>
        )}
      </div>

      {allowedMenuItems && allowedMenuItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-brand-blue" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-widest uppercase">Modul & Pintasan</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {allowedMenuItems.filter(item => !['dashboard', 'pengaturan', 'super-admin', 'users', 'kop-template'].includes(item.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isLocked) {
                    setShowUpgradeModal(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 gap-2 ${
                  item.isLocked
                    ? "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 opacity-60 cursor-not-allowed"
                    : "bg-slate-50 border-transparent hover:border-brand-blue/30 hover:shadow-lg hover:shadow-brand-blue/10 dark:bg-slate-800/50 dark:border-transparent dark:hover:border-brand-blue/30 group"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${item.isLocked ? "bg-slate-200 dark:bg-slate-800 text-slate-400" : "bg-brand-blue/10 text-brand-blue group-hover:scale-110 group-hover:bg-brand-blue/20"}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-black uppercase text-center tracking-tighter w-full line-clamp-1 ${item.isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isWarga && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#4aa379] p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all transition-colors text-white">
            <div className="absolute right-4 top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors flex items-center justify-center text-white">
              <div className="w-10 h-10 opacity-20 -rotate-12 group-hover:rotate-0 group-hover:opacity-40 transition-all duration-500">
                <AppLogo size={10} className="w-full h-full" logoUrl={settings?.org_logo_url || settings?.logo_url} />
              </div>
            </div>
            <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-2">Total Warga</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-white leading-none mb-1">
                  {stats.totalWarga}
                </p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">KK: {stats.kepalaKeluarga} Terdaftar</p>
              </div>
            </div>
          </div>

          <div className="bg-[#67a9e9] dark:bg-blue-600/20 p-6 rounded-[2rem] border border-slate-50 dark:border-blue-500/20 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all transition-colors">
            <div className="absolute right-4 top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors flex items-center justify-center text-white">
              <div className="w-10 h-10 opacity-30 -rotate-12 group-hover:rotate-0 group-hover:opacity-50 transition-all duration-500">
                <AppLogo size={10} className="w-full h-full" logoUrl={settings?.org_logo_url || settings?.logo_url} />
              </div>
            </div>
            <p className="text-[10px] text-white/70 dark:text-blue-200/70 font-black uppercase tracking-[0.2em] mb-2">Saldo Kas RW</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-blue-500/30 flex items-center justify-center backdrop-blur-md">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-white dark:text-blue-100 leading-none mb-1">
                  Rp {formatRupiah(stats.saldoTotal)}
                </p>
                <p className="text-[10px] font-bold text-white/60 dark:text-blue-200/60 uppercase tracking-tighter">Update Real-time</p>
              </div>
            </div>
          </div>

          <div className="bg-[#cb6497] p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all transition-colors text-white">
            <div className="absolute right-4 top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors flex items-center justify-center text-white">
              <div className="w-10 h-10 opacity-20 -rotate-12 group-hover:rotate-0 group-hover:opacity-40 transition-all duration-500">
                <AppLogo size={10} className="w-full h-full" logoUrl={settings?.org_logo_url || settings?.logo_url} />
              </div>
            </div>
            <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-2">Permohonan Surat</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-white leading-none mb-1">
                  {stats.suratPending}
                </p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Butuh Persetujuan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-blue" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Tren Kas RW</h3>
            </div>
            <select 
              value={kasPeriod}
              onChange={(e) => setKasPeriod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-2 outline-none focus:ring-2 ring-brand-blue/20 transition-colors"
            >
              <option value="yearly">Seluruh Tahun 2026</option>
              {months.map(m => <option key={m.id} value={m.id}>Bulan {m.label}</option>)}
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="masuk" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-pink/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand-pink" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Persentase Aktivitas</h3>
            </div>
            <select 
              value={piePeriod}
              onChange={(e) => setPiePeriod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-2 outline-none focus:ring-2 ring-brand-blue/20 transition-colors"
            >
              <option value="30days">Terakhir 30 Hari</option>
              <option value="yearly">Seluruh 2026</option>
            </select>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width={240} height={240}>
              <PieChart>
                <Pie
                  data={activityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {activityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={4} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 justify-center ml-4">
              {activityChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Log Aktivitas Lingkungan</h3>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((act, i) => (
              <div key={`activity-${act.id || i}`} className="flex items-center gap-5 p-5 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  act.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 
                  act.type === 'out' ? 'bg-rose-50 text-rose-600' :
                  act.type === 'doc' ? 'bg-blue-50 text-blue-600' :
                  act.type === 'tamu' ? 'bg-amber-50 text-amber-600' :
                  act.type === 'kesehatan' ? 'bg-pink-50 text-pink-600' :
                  act.type === 'sampah_in' ? 'bg-teal-50 text-teal-600' :
                  act.type === 'voting' ? 'bg-purple-50 text-purple-600' :
                  act.type === 'sos' ? 'bg-red-50 text-red-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {act.type === 'in' && <TrendingUp size={22} />}
                  {act.type === 'out' && <TrendingUp size={22} className="rotate-180" />}
                  {act.type === 'doc' && <FileText size={22} />}
                  {act.type === 'tamu' && <Users size={22} />}
                  {act.type === 'kesehatan' && <CheckCircle2 size={22} />}
                  {act.type === 'sampah_in' && <TrendingUp size={22} />}
                  {act.type === 'voting' && <FileText size={22} />}
                  {act.type === 'toko' && <CreditCard size={22} />}
                  {act.type === 'sos' && <Siren size={22} />}
                  {act.type === 'complaint' && <MessageSquare size={22} />}
                  {act.type === 'booking' && <Calendar size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-50 truncate tracking-tight">{act.title}</h4>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{act.date}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium truncate leading-tight">{act.desc}</p>
                </div>
                {act.amount && (
                  <span className={`text-base font-black tracking-tight ml-4 ${act.type === 'in' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {act.type === 'in' ? '+' : ''}{formatRupiah(act.amount)}
                  </span>
                )}
                {act.status && (
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ml-4 ${
                    act.status === 'Selesai' || act.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    act.status === 'Diajukan' || act.status === 'Menunggu' || act.status === 'Diproses' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    act.status === 'Ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {act.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
              <QrCode size={120} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tighter leading-none mb-2">SELF-SERVICE PORTAL</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Akses mandiri bagi seluruh warga</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white h-[34px] p-5 rounded-3xl flex items-center justify-between transition-all group/btn border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">QR Pendaftaran</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('surat')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white p-5 rounded-3xl flex items-center justify-between transition-all group/btn border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Cek Status Pengajuan</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </button>
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
              
              <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-[10px] font-black text-[#fdfdfd] uppercase tracking-widest mb-1">Lansia</p>
                  <p className="text-2xl font-black text-white leading-none">{demographics.totalLansia}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating AI Chat Button */}
      {currentTenant?.id !== 'RW26_SMART' && currentTenant?.status !== 'STARTER' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAIChat(!showAIChat)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-brand-blue text-white rounded-full shadow-2xl flex items-center justify-center z-50"
        >
          <Bot className="w-8 h-8" />
        </motion.button>
      )}

      {/* AI Chat Window */}
      <AnimatePresence>
        {showAIChat && currentTenant?.id !== 'RW26_SMART' && currentTenant?.status !== 'STARTER' && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md"
          >
            <AIChatBot currentUser={currentUser} agentType="cs" plan={currentTenant?.status} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
