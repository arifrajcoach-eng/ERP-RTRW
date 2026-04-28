import React, { useState } from 'react';
import { 
  Siren, Users, CreditCard, Recycle, Baby, Package, FileText, Vote, ShoppingBag, ShieldCheck,
  PlusCircle, MinusCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { calculateAge, formatRupiah } from '../utils/helpers';

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
}

export default function DashboardView({ 
  kasData, wargaData, suratData, iuranData, emergenciesData, 
  handleTriggerSOS, userRole, setActiveTab, 
  posyanduKegiatanData, inventarisData, sampahSetoranData 
}: DashboardViewProps) {
  const [kasPeriod, setKasPeriod] = useState('yearly');
  
  const months = [
    { id: 'Jan', label: 'Jan' }, { id: 'Feb', label: 'Feb' }, { id: 'Mar', label: 'Mar' },
    { id: 'Apr', label: 'Apr' }, { id: 'Mei', label: 'Mei' }, { id: 'Jun', label: 'Jun' },
    { id: 'Jul', label: 'Jul' }, { id: 'Agu', label: 'Agu' }, { id: 'Sep', label: 'Sep' },
    { id: 'Okt', label: 'Okt' }, { id: 'Nov', label: 'Nov' }, { id: 'Des', label: 'Des' }
  ];

  const totalWarga = wargaData.length;
  const uniqueKK = new Set(wargaData.map((w: any) => w.kk).filter(kk => kk)).size;
  const kepalaKeluarga = uniqueKK;
  const saldoTotal = kasData.reduce((acc, curr) => acc + (curr.debit || 0) - (curr.kredit || 0), 0);
  const suratPending = suratData.filter(s => s.status === 'Diajukan').length;

  const totalLaki = wargaData.filter(w => w.jk === 'Laki-Laki').length;
  const totalPerempuan = wargaData.filter(w => w.jk === 'Perempuan').length;
  
  const ages = wargaData.map(w => {
    const res = calculateAge(w.tglLahir);
    return typeof res === 'number' ? res : -1;
  });
  const totalBalita = ages.filter(age => age >= 0 && age <= 5).length;
  const totalAnak = ages.filter(age => age >= 6 && age <= 12).length;
  const totalRemaja = ages.filter(age => age >= 13 && age <= 18).length;
  const totalDewasa = ages.filter(age => age >= 19 && age <= 59).length;
  const totalLansia = ages.filter(age => age >= 60).length;

  const recentActivities = [
    ...kasData.map(k => ({
      title: k.tipe === 'Masuk' ? 'Pemasukan Kas' : 'Pengeluaran Kas',
      desc: k.keterangan || k.transaksi,
      date: k.tanggal,
      amount: k.debit || k.kredit,
      type: k.tipe === 'Masuk' ? 'in' : 'out'
    })),
    ...suratData.map(s => ({
      title: 'Pengajuan Surat',
      desc: `${s.pemohon} - ${s.jenisSurat}`,
      date: s.tanggal,
      status: s.status,
      type: 'doc'
    })),
    ...wargaData.slice(-5).map(w => ({
      title: 'Warga Baru',
      desc: `${w.nama} (${w.agama || '-'})`,
      date: w.tglDaftar || 'Baru Saja',
      type: 'warga'
    }))
  ].sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateB - dateA;
  }).slice(0, 10);

  const dataYearly = months.map(m => {
    const trxInMonth = kasData.filter(trx => trx.tanggal.includes(m.id));
    return {
      name: m.id,
      masuk: trxInMonth.reduce((acc, curr) => acc + curr.debit, 0),
      keluar: trxInMonth.reduce((acc, curr) => acc + curr.kredit, 0)
    };
  });

  const data30Days = [
    { name: '1-6', masuk: 1200000, keluar: 800000 },
    { name: '7-12', masuk: 2100000, keluar: 450000 },
    { name: '13-18', masuk: 1500000, keluar: 1200000 },
    { name: '19-24', masuk: 2800000, keluar: 900000 },
    { name: '25-30', masuk: 1950000, keluar: 540000 },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-3 px-1">
        {[
          { id: 'sos', label: 'SOS', icon: Siren, color: 'text-rose-500', bg: 'bg-rose-50', action: handleTriggerSOS },
          { id: 'warga', label: 'WARGA', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', action: () => setActiveTab('warga') },
          { id: 'transaksi', label: 'TRANSAKSI', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50', action: () => setActiveTab('transaksi') },
          { id: 'sampah', label: 'SAMPAH', icon: Recycle, color: 'text-green-500', bg: 'bg-green-50', action: () => setActiveTab('bank-sampah') },
          { id: 'kesehatan', label: 'KESEHATAN', icon: Baby, color: 'text-rose-500', bg: 'bg-rose-50', action: () => setActiveTab('posyandu') },
          { id: 'inventaris', label: 'ASET', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50', action: () => setActiveTab('inventaris') },
          { id: 'surat', label: 'SURAT', icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-50', action: () => setActiveTab('surat') },
          { id: 'voting', label: 'PEMILU', icon: Vote, color: 'text-yellow-500', bg: 'bg-yellow-50', action: () => setActiveTab('voting') },
          { id: 'toko', label: 'TOKO', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50', action: () => setActiveTab('etoko') },
          { id: 'verifikasi', label: 'VERIFIKASI', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', action: () => setActiveTab('verifikasi') },
        ].map(item => (
          <button 
            key={item.id}
            onClick={item.action}
            className="bg-white/80 p-5 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all flex flex-col items-center justify-center gap-3 group active:scale-95"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner`}>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Warga</p>
          <p className="text-2xl font-black text-slate-800 flex items-baseline gap-2">
            {totalWarga} <span className="text-[11px] font-normal text-slate-400">Kepala Keluarga: {kepalaKeluarga}</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Kas</p>
          <p className="text-2xl font-black text-green-600 flex items-baseline gap-2">
            Rp {formatRupiah(saldoTotal)} <span className="text-[11px] font-normal text-slate-400">+ Sinkron Otomatis</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Surat Pending</p>
          <p className="text-2xl font-black text-orange-500 flex items-baseline gap-2">
            {suratPending} <span className="text-[11px] font-normal text-slate-400">Pengajuan</span>
          </p>
        </div>
      </div>

      {/* Grafik Keuangan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
                Grafik Arus Kas ({kasPeriod === 'yearly' ? 'Januari - Desember' : `Bulan ${kasPeriod}`})
              </h3>
              <button 
                onClick={() => setKasPeriod('yearly')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all border ${kasPeriod === 'yearly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
              >
                Setahun
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {months.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setKasPeriod(m.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    kasPeriod === m.id 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={kasPeriod === 'yearly' ? dataYearly : data30Days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rp ${new Intl.NumberFormat('id-ID').format(value)}`]}
                />
                <Area type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" name="Pemasukan" />
                <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={3} fill="transparent" name="Pengeluaran" />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex flex-col mb-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
              Demografi Warga
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kepala Keluarga</p>
              <p className="text-xl font-black text-blue-600">{kepalaKeluarga}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Laki-Laki</p>
              <p className="text-xl font-black text-cyan-600">{totalLaki}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Perempuan</p>
              <p className="text-xl font-black text-rose-500">{totalPerempuan}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balita (0-5)</p>
              <p className="text-xl font-black text-amber-500">{totalBalita}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Anak (6-12)</p>
              <p className="text-xl font-black text-lime-500">{totalAnak}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaja (13-18)</p>
              <p className="text-xl font-black text-violet-500">{totalRemaja}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dewasa (19-59)</p>
              <p className="text-xl font-black text-indigo-600">{totalDewasa}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lansia (60+)</p>
              <p className="text-xl font-black text-emerald-600">{totalLansia}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitas Terbaru Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Aktivitas Terbaru
        </h3>
        <div className="space-y-3">
          {recentActivities.map((act: any, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  act.type === 'in' ? 'bg-green-50 text-green-600' : 
                  act.type === 'out' ? 'bg-red-50 text-red-600' : 
                  act.type === 'doc' ? 'bg-blue-50 text-blue-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {act.type === 'in' ? <PlusCircle className="w-4 h-4" /> : 
                   act.type === 'out' ? <MinusCircle className="w-4 h-4" /> : 
                   act.type === 'doc' ? <FileText className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.title}</p>
                  <p className="text-[10px] text-slate-400">{act.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${
                  act.type === 'in' ? 'text-green-600' : 
                  act.type === 'out' ? 'text-red-600' : 
                  'text-slate-600'
                }`}>
                  {act.amount ? `Rp ${formatRupiah(act.amount)}` : (act.status || 'Aktif')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
