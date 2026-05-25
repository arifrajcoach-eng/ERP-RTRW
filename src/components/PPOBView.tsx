import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  Zap, 
  Droplets, 
  Train, 
  ShieldAlert, 
  CreditCard, 
  X, 
  Info, 
  ShieldCheck,
  QrCode,
  Gamepad2,
  Tv,
  Phone,
  Wallet,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PPOBViewProps {
  ppobData: any[];
  setPpobData: React.Dispatch<React.SetStateAction<any[]>>;
  kasData: any[];
  setKasData: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: any;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isPengurus: boolean;
}

export function PPOBView({ 
  ppobData, 
  setPpobData, 
  kasData, 
  setKasData, 
  currentUser, 
  tenantId, 
  setIsLoadingDB, 
  handleFirestoreError, 
  showNotification, 
  isPengurus 
}: PPOBViewProps) {
  const [selectedLayanan, setSelectedLayanan] = useState<string>('Pulsa');
  const [showSimulasiForm, setShowSimulasiForm] = useState(false);
  const [nominal, setNominal] = useState("");
  const [tujuan, setTujuan] = useState("");
  
  const adminFee = selectedLayanan === 'Tiket Kereta' ? 5000 : 
                   selectedLayanan === 'PLN' ? 2500 : 
                   selectedLayanan === 'PDAM' ? 2500 : 
                   selectedLayanan === 'BPJS' ? 2500 : 1500;
  
  const layanans = [
    { id: 'Pulsa', name: 'Pulsa & Paket Data', desc: 'Isi ulang pulsa All Operator', icon: <Smartphone className="w-5 h-5 text-blue-500" /> },
    { id: 'PLN', name: 'Token Listrik / PLN', desc: 'Beli token atau bayar tagihan', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { id: 'PDAM', name: 'Air PDAM', desc: 'Bayar tagihan air', icon: <Droplets className="w-5 h-5 text-cyan-500" /> },
    { id: 'Tiket Kereta', name: 'Tiket Kereta Api', desc: 'Pesan KAI', icon: <Train className="w-5 h-5 text-orange-500" /> },
    { id: 'BPJS', name: 'BPJS Kesehatan', desc: 'Bayar iuran BPJS', icon: <ShieldAlert className="w-5 h-5 text-green-500" /> },
    { id: 'Voucher', name: 'Voucher Digital', desc: 'Game, Streaming, App Store', icon: <Gamepad2 className="w-5 h-5 text-purple-500" /> },
    { id: 'TV', name: 'TV & Internet', desc: 'Bayar tagihan TV/Internet', icon: <Tv className="w-5 h-5 text-rose-500" /> },
    { id: 'Telepon', name: 'Telepon', desc: 'Bayar tagihan telepon', icon: <Phone className="w-5 h-5 text-teal-500" /> },
    { id: 'Wallet', name: 'E-Wallet', desc: 'Top Up E-Wallet', icon: <Wallet className="w-5 h-5 text-indigo-500" /> },
    { id: 'E-Money', name: 'E-Money', desc: 'Top Up E-Money', icon: <Coins className="w-5 h-5 text-emerald-500" /> },
  ];

  const handleSimulasiBayar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || !tujuan) {
      showNotification('Harap isi nomor tujuan and nominal', 'error');
      return;
    }
    
    // Skema Keuntungan Rekomendasi Owner: 
    // Tenant (RT/RW) mendapatkan 60% dari Biaya Admin
    // Pemilik Aplikasi (Owner) mendapatkan 40% dari Biaya Admin
    const komisiRT = Math.floor(adminFee * 0.6);
    const komisiOwner = Math.floor(adminFee * 0.4);
    const nominalInt = parseInt(nominal.replace(/\D/g, '') || "0");
    const totalBayar = nominalInt + adminFee;
    
    const trxId = `PPOB-${Date.now()}`;
    const payload = {
      id: trxId,
      tenantId,
      rt: currentUser?.rt || '01',
      tanggal: new Date().toISOString(),
      layanan: selectedLayanan,
      tujuan,
      nominal: nominalInt,
      adminFee,
      komisiOwner, // Keuntungan untuk Anda
      komisiRT,    // Keuntungan untuk RT/RW
      totalBayar,
      status: 'Berhasil',
      userId: currentUser?.uid || currentUser?.id_user || null,
      namaPembeli: currentUser?.nama || currentUser?.name || 'Warga'
    };

    setIsLoadingDB(true);
    try {
      // 1. Simpan PPOB trx
      await setDoc(doc(db, 'ppob_trx', trxId), payload);
      setPpobData((prev: any) => [payload, ...prev]);

      // 2. Tambahkan ke koleksi keuangan agar muncul di Riwayat & Rekap Iuran jika perlu
      const keuanganId = `KU-${Date.now()}`;
      const keuanganPayload = {
        id: keuanganId,
        tenantId,
        rt: payload.rt,
        tanggal: payload.tanggal,
        jenis: 'Digital & PPOB',
        penyetor: payload.namaPembeli,
        nik: currentUser?.nik || "-",
        nominal: totalBayar,
        keterangan: `Pembelian ${selectedLayanan} ke ${tujuan}`,
        status: 'Lunas',
        createdAt: new Date().toISOString(),
        userId: payload.userId,
        buktiUrl: 'Sistem PPOB SmartRW',
        method: 'Saldo Digital'
      };
      await setDoc(doc(db, 'keuangan', keuanganId), keuanganPayload);
      
      // Update local finance state if available (passed through props or state lifting)
      // Since this is PPOBView, we might not have a direct setIuranData here unless we add it.
      // But if App.tsx is listening to 'keuangan', it will update automatically via onSnapshot.

      // 3. Tambahkan komisi kas RT (Hanya bagian RT yang masuk ke buku kas RT)
      const kasId = `TRX-${Date.now()}`;
      const kasPayload = {
        id: kasId,
        tenantId,
        rt: payload.rt,
        tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        tipe: 'Masuk',
        transaksi: 'PPOB Komisi',
        nama: 'Aplikasi',
        keterangan: `Komisi Trx ${selectedLayanan} - ${payload.tujuan} (${payload.namaPembeli})`,
        debit: komisiRT,
        kredit: 0,
        strukUrl: '',
        ppobId: trxId
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => [kasPayload, ...prev]);

      showNotification('Simulasi Berhasil! Transaksi tercatat di Riwayat & Komisi masuk ke Kas RT.', 'success');
      setShowSimulasiForm(false);
      setNominal("");
      setTujuan("");
    } catch (err: any) {
      handleFirestoreError(err, 'create', 'ppob_trx');
      showNotification('Transaksi Gagal', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const myPPOB = isPengurus ? ppobData : ppobData.filter((i: any) => i.userId === currentUser?.uid || i.userId === currentUser?.id_user);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-500/30 text-white relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
            <Smartphone className="w-5 h-5 text-blue-200 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Smart Financial Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter italic">Layanan <span className="text-blue-200">Digital & PPOB</span> Terpadu</h2>
          <p className="text-blue-50 text-sm font-bold max-w-2xl leading-relaxed opacity-90">
            Bayar tagihan listrik, pulsa, PDAM, hingga tiket kereta api langsung dari genggaman. Nikmati kemudahan transaksi digital seraya berkontribusi pada <span className="bg-white/20 px-2 py-0.5 rounded-lg text-white">Kas RT/RW</span> melalui bagi hasil komisi otomatis di setiap transaksi!
          </p>
        </div>
        
        <button 
          onClick={() => setShowSimulasiForm(true)} 
          className="relative z-10 bg-white text-blue-700 px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all duration-500 shadow-2xl shadow-blue-900/30 active:scale-[0.95] whitespace-nowrap flex items-center gap-4 group"
        >
          <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Smartphone className="w-5 h-5" />
          </div>
          TRANSAKSI SEKARANG
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-4 tracking-tighter uppercase italic">
              <div className="w-2 h-7 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
              Riwayat <span className="text-emerald-500">Aktivitas Digital</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5 ml-6">Log penggunaan layanan pihak ketiga & komisi</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] border-b border-slate-100">
                <th className="px-8 py-7">Payload Waktu</th>
                <th className="px-8 py-7">Identitas</th>
                <th className="px-8 py-7">Layanan</th>
                <th className="px-8 py-7">Nomor Tujuan</th>
                <th className="px-8 py-7 text-right">Nilai Trx</th>
                {isPengurus && (
                  <>
                    <th className="px-8 py-7 text-right text-emerald-600 italic">Komisi RT</th>
                    <th className="px-8 py-7 text-right text-indigo-600 italic">Profit Sys</th>
                  </>
                )}
                <th className="px-8 py-7 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
              {myPPOB.length === 0 ? (
                <tr><td colSpan={isPengurus ? 8 : 6} className="px-8 py-24 text-center text-slate-300 italic font-black uppercase text-[10px] tracking-widest">Belum ada jejak transaksi digital</td></tr>
              ) : (
                myPPOB.map((trx: any) => (
                  <tr key={trx.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                         <span className="text-[11px] font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase">
                          {new Date(trx.tanggal).toLocaleString('id-ID', {day: '2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 tracking-tight text-sm uppercase italic">{trx.namaPembeli}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {trx.id.substring(0, 12)}</div>
                    </td>
                    <td className="px-8 py-6 font-black text-blue-600 italic uppercase underline decoration-blue-100 underline-offset-4 text-xs">{trx.layanan}</td>
                    <td className="px-8 py-6 text-xs font-black text-slate-500 group-hover:text-slate-700 transition-colors family-mono">{trx.tujuan}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-800 tracking-tight">Rp {new Intl.NumberFormat('id-ID').format(trx.nominal)}</td>
                    {isPengurus && (
                      <>
                        <td className="px-8 py-6 text-right font-black text-emerald-600">Rp {new Intl.NumberFormat('id-ID').format(trx.komisiRT || 0)}</td>
                        <td className="px-8 py-6 text-right font-black text-indigo-600/60">Rp {new Intl.NumberFormat('id-ID').format(trx.komisiOwner || 0)}</td>
                      </>
                    )}
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50">
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSimulasiForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="bg-white/90 backdrop-blur-2xl w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[95vh] relative"
          >
            <div className="p-6 sm:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
               <div className="mt-[38px] mb-[-42px]">
                  <h3 
                    className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tighter uppercase italic pb-0 pt-0 mt-[44px] mb-0"
                    style={{ marginTop: '-59px' }}
                  >
                    <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    Konfigurasi Transaksi
                  </h3>
                </div>
              <button 
                type="button" 
                onClick={() => setShowSimulasiForm(false)} 
                className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSimulasiBayar} className="p-6 sm:p-10 overflow-y-auto space-y-6 sm:space-y-8">
              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 pb-0 mb-[9px] mt-[19px]">Pilih Kategori Layanan</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {layanans.map(l => (
                    <button 
                      type="button" 
                      key={l.id} 
                      onClick={() => setSelectedLayanan(l.id)} 
                      className={`group p-4 border rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${selectedLayanan === l.id ? 'border-blue-500 bg-blue-50/50 shadow-lg ring-1 ring-blue-500 scale-[1.03]' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'}`}
                    >
                      <div className={`p-3 rounded-xl transition-all duration-300 ${selectedLayanan === l.id ? 'bg-white shadow-md' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                        {l.icon}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${selectedLayanan === l.id ? 'text-blue-700' : 'text-slate-500'}`}>{l.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
                    Nomor Tujuan / ID Pelanggan
                  </label>
                  <input required type="text" value={tujuan} onChange={e => setTujuan(e.target.value)} placeholder="08xxxxxxxx / 1234xxxx" className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
                    Nominal Transaksi (IDR)
                  </label>
                  <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                     <input required type="text" value={nominal} onChange={e => setNominal(e.target.value.replace(/\D/g, ''))} placeholder="100000" className="w-full pl-12 pr-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Harga Dasar Layanan</span>
                    <span className="font-black text-white italic tracking-tighter text-sm">Rp {new Intl.NumberFormat('id-ID').format(parseInt(nominal || '0'))}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Biaya Admin Platform Keamanan</span>
                    <span className="font-black text-white italic tracking-tighter text-sm">Rp {new Intl.NumberFormat('id-ID').format(adminFee)}</span>
                  </div>
                  <div className="border-t border-white/10 my-6 pt-6"></div>
                  <div className="flex justify-between items-end">
                    <div>
                       <span className="font-black text-blue-400 uppercase text-[9px] tracking-[0.4em] block mb-2">Total Kewajiban Bayar</span>
                       <span className="font-black text-white text-3xl tracking-tighter italic">
                         Rp {new Intl.NumberFormat('id-ID').format(parseInt(nominal || '0') + adminFee)}
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest flex items-center justify-end gap-1 mb-1">
                          <CheckCircle2 className="w-3 h-3"/> Komisi RT/RW (60%): Rp {new Intl.NumberFormat('id-ID').format(Math.floor(adminFee * 0.6))}
                       </p>
                       <p className="text-[8px] text-indigo-300 font-black uppercase tracking-widest flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3 h-3"/> Keamanan Sys (40%): Rp {new Intl.NumberFormat('id-ID').format(Math.floor(adminFee * 0.4))}
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-start gap-4 shadow-sm">
                <div className="pt-1">
                  <input required type="checkbox" id="tos" className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-slate-300 cursor-pointer" />
                </div>
                <label htmlFor="tos" className="text-[10px] sm:text-[11px] text-slate-600 font-bold leading-relaxed cursor-pointer select-none">
                  Saya menyetujui <span className="text-blue-600 underline">Ketentuan Layanan Finansial Digital</span>. Setiap transaksi mendukung operasional lingkungan Anda melalui sistem bagi hasil komisi otomatis yang transparan.
                </label>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  className="flex-[2] py-5 text-[11px] font-black bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[1.5rem] transition-all shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                >
                  <CreditCard className="w-5 h-5" /> KONFIRMASI PEMBAYARAN
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowSimulasiForm(false)} 
                  className="flex-1 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  BATALKAN
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
