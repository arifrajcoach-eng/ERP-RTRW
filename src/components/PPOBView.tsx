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
  Coins
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
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CreditCard className="w-32 h-32 transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Smartphone className="w-6 h-6" /> Layanan PPOB & Tiketing</h2>
          <p className="text-blue-100 text-sm font-medium">Beli pulsa, token listrik, bayar tagihan hingga tiket kereta dari aplikasi warga. Setiap transaksi akan memberikan keuntungan otomatis (komisi) yang masuk ke Saldo Kas RT/RW!</p>
        </div>
        <button 
          onClick={() => setShowSimulasiForm(true)} 
          className="relative z-10 bg-white text-[#2a5fc4] px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all duration-300 shadow-2xl shadow-blue-900/20 active:scale-[0.98] whitespace-nowrap flex items-center gap-3 group"
        >
          <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Transaksikan Sekarang
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-green-500 w-1.5 h-4 rounded-full"></span>
            Riwayat Transaksi PPOB
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Waktu</th>
                <th className="px-5 py-4">Pembeli</th>
                <th className="px-5 py-4">Layanan</th>
                <th className="px-5 py-4">Tujuan</th>
                <th className="px-5 py-4 text-right">Nilai Trx</th>
                {isPengurus && (
                  <>
                    <th className="px-5 py-4 text-right text-green-600">Komisi RT</th>
                    <th className="px-5 py-4 text-right text-indigo-600">Profit Pemilik</th>
                  </>
                )}
                <th className="px-5 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {myPPOB.length === 0 && (
                <tr><td colSpan={isPengurus ? 8 : 6} className="px-5 py-12 text-center text-slate-400 italic font-bold">Belum ada transaksi.</td></tr>
              )}
              {myPPOB.map((trx: any) => (
                <tr key={trx.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-xs">{new Date(trx.tanggal).toLocaleString('id-ID', {day: '2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{trx.namaPembeli}</td>
                  <td className="px-5 py-3 font-bold text-blue-600">{trx.layanan}</td>
                  <td className="px-5 py-3 text-xs">{trx.tujuan}</td>
                  <td className="px-5 py-3 text-right font-black">Rp {new Intl.NumberFormat('id-ID').format(trx.nominal)}</td>
                  {isPengurus && (
                    <>
                      <td className="px-5 py-3 text-right font-black text-green-600">Rp {new Intl.NumberFormat('id-ID').format(trx.komisiRT || 0)}</td>
                      <td className="px-5 py-3 text-right font-black text-indigo-600">Rp {new Intl.NumberFormat('id-ID').format(trx.komisiOwner || 0)}</td>
                    </>
                  )}
                  <td className="px-5 py-3 text-center">
                    <span className="px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest bg-green-100 text-green-700">
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSimulasiForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-brand-pink text-white rounded-xl shadow-lg shadow-brand-pink/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                Transaksi Digital
              </h3>
              <button 
                type="button" 
                onClick={() => setShowSimulasiForm(false)} 
                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSimulasiBayar} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {layanans.map(l => (
                  <button type="button" key={l.id} onClick={() => setSelectedLayanan(l.id)} className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${selectedLayanan === l.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}>
                    <div className={`p-2 rounded-xl ${selectedLayanan === l.id ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                      {l.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 text-center">{l.name}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                  Target / Nomor Tujuan
                  <span className="text-blue-500">Cth: Nomor HP, No.Meter, dll.</span>
                </label>
                <input required type="text" value={tujuan} onChange={e => setTujuan(e.target.value)} placeholder="08xxxxxxxx / 1234xxxx" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                  Nominal Transaksi (Rp)
                  <span className="text-blue-500">Nilai sebelum admin</span>
                </label>
                <input required type="text" value={nominal} onChange={e => setNominal(e.target.value.replace(/\D/g, ''))} placeholder="100000" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-bold text-slate-600">Harga Layanan</span>
                  <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(parseInt(nominal || '0'))}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-bold text-slate-600">Biaya Admin Platform</span>
                  <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(adminFee)}</span>
                </div>
                <div className="border-t border-indigo-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 uppercase text-xs">Total Bayar</span>
                  <span className="font-black text-indigo-700 text-lg flex items-center gap-1">
                    Rp {new Intl.NumberFormat('id-ID').format(parseInt(nominal || '0') + adminFee)}
                  </span>
                </div>
                <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-2 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3"/> Komisi RT/RW (60%): Rp {new Intl.NumberFormat('id-ID').format(Math.floor(adminFee * 0.6))}</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-indigo-600"/> Profit Pemilik (40%): Rp {new Intl.NumberFormat('id-ID').format(Math.floor(adminFee * 0.4))}</span>
                </p>
              </div>

              <div className="flex bg-slate-50 p-3 rounded-lg border border-slate-200 items-start gap-3">
                <input 
                  required 
                  type="checkbox" 
                  id="tos" 
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                />
                <label htmlFor="tos" className="text-[10px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                  Saya (Pengguna/Warga) menyetujui <span className="font-bold text-blue-600">Syarat & Ketentuan Layanan PPOB</span>. Saya memahami bahwa transaksi ini aman, dan sebagian dari biaya admin secara otomatis dipotong sistem dan dibagikan sebagai Kas/Keuntungan untuk operasional RT/RW saya.
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowSimulasiForm(false)} className="py-3 px-6 text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors border border-slate-200">Batalkan</button>
                <button type="submit" className="flex-1 py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98] flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Bayar Sekarang
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
