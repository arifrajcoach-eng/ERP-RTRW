import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Sparkles, 
  Coins, 
  Users, 
  Percent, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  FileText, 
  ArrowRight,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface RekomendasiHargaViewProps {
  kasData: any[];
  wargaData: any[];
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isPengurus: boolean;
  plan?: string;
  getSetting: (key: string) => any;
}

export function RekomendasiHargaView({
  kasData = [],
  wargaData = [],
  showNotification,
  isPengurus,
  plan = 'STARTER',
  getSetting
}: RekomendasiHargaViewProps) {
  const isApt = getSetting("themeMode") === "apartemen";
  const labelKK = isApt ? "Unit/Apartemen" : "Rumah/KK";
  const labelIPL = isApt ? "IPL (Iuran Pengelola)" : "Iuran Bulanan Warga";

  // Check if paid/premium plan
  const isPaidUser = plan && plan.toLowerCase() !== 'starter' && plan.toLowerCase() !== 'trial';

  // 1. Calculate historical operasional costs from kasData (tipe === "Keluar" or kredit > 0)
  const actualOperationalCost = useMemo(() => {
    // Return sum of all credit (expenses)
    return kasData
      .filter(t => t.tipe === 'Keluar' || (t.kredit && t.kredit > 0))
      .reduce((sum, t) => sum + (Number(t.kredit) || 0), 0);
  }, [kasData]);

  // Estimate a monthly average if actual costs exist, or default to standard fallback
  const estimatedSecurityCost = Math.round(actualOperationalCost > 0 ? actualOperationalCost * 0.45 : 1500000);
  const estimatedTrashCost = Math.round(actualOperationalCost > 0 ? actualOperationalCost * 0.20 : 600000);
  const estimatedElectricityCost = Math.round(actualOperationalCost > 0 ? actualOperationalCost * 0.15 : 450000);
  const estimatedAdminCost = Math.round(actualOperationalCost > 0 ? actualOperationalCost * 0.08 : 250000);
  const estimatedGovCost = Math.round(actualOperationalCost > 0 ? actualOperationalCost * 0.07 : 200000);
  const estimatedSocialCost = Math.round(actualOperationalCost > 0 ? actualOperationalCost * 0.05 : 150000);

  // States for Calculator
  const [numKK, setNumKK] = useState<number>(wargaData.length > 0 ? wargaData.length : 50);
  const [marginPercent, setMarginPercent] = useState<number>(20); // standard target margin
  const [currentIuran, setCurrentIuran] = useState<number>(30000); // comparison standard current monthly iuran

  // Editable cost inputs
  const [securityCost, setSecurityCost] = useState<number>(estimatedSecurityCost);
  const [trashCost, setTrashCost] = useState<number>(estimatedTrashCost);
  const [electricityCost, setElectricityCost] = useState<number>(estimatedElectricityCost);
  const [adminCost, setAdminCost] = useState<number>(estimatedAdminCost);
  const [govCost, setGovCost] = useState<number>(estimatedGovCost);
  const [socialCost, setSocialCost] = useState<number>(estimatedSocialCost);

  // Sync actual expenses toggle
  const [autoSyncLedger, setAutoSyncLedger] = useState(actualOperationalCost > 0);

  // Handle auto-sync toggles
  const handleToggleSync = (checked: boolean) => {
    setAutoSyncLedger(checked);
    if (checked && actualOperationalCost > 0) {
      setSecurityCost(Math.round(actualOperationalCost * 0.45));
      setTrashCost(Math.round(actualOperationalCost * 0.20));
      setElectricityCost(Math.round(actualOperationalCost * 0.15));
      setAdminCost(Math.round(actualOperationalCost * 0.08));
      setGovCost(Math.round(actualOperationalCost * 0.07));
      setSocialCost(Math.round(actualOperationalCost * 0.05));
      showNotification("Biaya operasional berhasil disinkronkan dengan Ledger Kas!", "success");
    }
  };

  // Perform Calculations
  const totalBiayaOperasional = securityCost + trashCost + electricityCost + adminCost + govCost + socialCost;
  const hppPerKK = numKK > 0 ? Math.round(totalBiayaOperasional / numKK) : 0;
  const reserveAmountPerKK = Math.round((hppPerKK * marginPercent) / 100);
  const recommendedTariff = hppPerKK + reserveAmountPerKK;

  // Comparison logic
  const diffPercent = currentIuran > 0 ? Math.round(((currentIuran - recommendedTariff) / recommendedTariff) * 100) : -100;
  const isDeficit = currentIuran < recommendedTariff;
  const isGenerous = currentIuran > recommendedTariff * 1.15;
  const isHealthy = !isDeficit && !isGenerous;

  // Render format
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-8" id="rekomendasi-harga-container">
      
      {/* Premium Header Decoration */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 dark:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Fitur Penasehat Keuangan Pintar
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-elegant tracking-tight leading-none uppercase">
            Analisis HPP & Rekomendasi Tarif {isApt ? "IPL" : "Iuran"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Asisten cerdas kami membantu pengurus menganalisis Harga Pokok Pelayanan (HPP) riil lingkungan, memetakan surplus margin cadangan kas, serta menerbitkan rekomendasi harga yang adil, berkelanjutan, dan transparan.
          </p>
        </div>
        
        {/* Plan Upgrade Banner for non-paid users if any */}
        {!isPaidUser && (
          <div className="relative z-10 shrink-0 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-3 backdrop-blur-sm max-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">PAKET TRIAL / GRATIS</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-normal font-semibold">
              Fitur kalkulator rekomendasi harga berdasarkan HPP operasional disediakan penuh untuk <b>User Pengurus Berbayar</b> guna keputusan paripurna.
            </p>
            <div className="text-[10px] bg-amber-500 text-slate-950 font-black uppercase tracking-wider px-3.5 py-2 rounded-xl text-center shadow-lg">
              Fitur Premium Aktif
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Inputs & Cost Breakdowns (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 border border-orange-100 dark:border-orange-950/20">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">Matriks Biaya Bulanan</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Konfigurasi HPP Pelayanan Lingkungan</p>
                </div>
              </div>

              {/* Toggle Auto Sync */}
              {actualOperationalCost > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tarik dari Riwayat Kas</span>
                  <input
                    type="checkbox"
                    checked={autoSyncLedger}
                    onChange={(e) => handleToggleSync(e.target.checked)}
                    className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue focus:ring-2 cursor-pointer"
                  />
                </label>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Cost 1: Security */}
              <div className="space-y-1.5 h-auto">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Gaji Hansip & Keamanan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={securityCost}
                    disabled={autoSyncLedger}
                    onChange={(e) => setSecurityCost(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Cost 2: Waste */}
              <div className="space-y-1.5 h-auto">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Retribusi Sampah / Kebersihan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={trashCost}
                    disabled={autoSyncLedger}
                    onChange={(e) => setTrashCost(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Cost 3: Electricity */}
              <div className="space-y-1.5 h-auto">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Listrik Jalanan / Fasum</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={electricityCost}
                    disabled={autoSyncLedger}
                    onChange={(e) => setElectricityCost(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Cost 4: Admin / ATK */}
              <div className="space-y-1.5 h-auto">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Kertas / Cetak Surat / ATK</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={adminCost}
                    disabled={autoSyncLedger}
                    onChange={(e) => setAdminCost(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Cost 5: Maintenance / Pembangunan */}
              <div className="space-y-1.5 h-auto">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Evaluasi / Siskamling / Gapura</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={govCost}
                    disabled={autoSyncLedger}
                    onChange={(e) => setGovCost(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Cost 6: Social / Social Welfare */}
              <div className="space-y-1.5 h-auto">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Dana Sosial & Kerakyatan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={socialCost}
                    disabled={autoSyncLedger}
                    onChange={(e) => setSocialCost(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
                  />
                </div>
              </div>

            </div>

            {/* Sum section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-between border border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500">Estimasi Total Biaya Operasional Lingkungan (HPP):</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-elegant">{formatIDR(totalBiayaOperasional)}/Bulan</span>
            </div>

            {/* Demographics Variables */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* KK Count */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-blue" />
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Wajib Iuran ({labelKK})</label>
                </div>
                <input 
                  type="number"
                  value={numKK}
                  onChange={(e) => setNumKK(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* Target Margin Reserve */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-500" />
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Cadangan Kas (%)</label>
                </div>
                <select
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
                >
                  <option value={0}>0% (Nol Cadangan)</option>
                  <option value={10}>10% (Konservatif)</option>
                  <option value={20}>20% (Sedang-Sehat)</option>
                  <option value={30}>30% (Progresif Infrastruktur)</option>
                  <option value={40}>40% (Surplus Tinggi)</option>
                </select>
              </div>

              {/* Current Set Fee */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Iuran Saat Ini per {labelKK}</label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={currentIuran}
                    onChange={(e) => setCurrentIuran(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results & Recommendations Analysis (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main analysis summary card */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[460px] border border-slate-800">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-6 bg-brand-blue rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Rekomendasi Tarif & HPP</h4>
              </div>

              {/* Main numerical break */}
              <div className="space-y-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Rekomendasi Tarif Ideal</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black font-elegant tracking-tight text-brand-blue">
                    {formatIDR(recommendedTariff)}
                  </h3>
                  <span className="text-xs text-slate-405">/Bulan</span>
                </div>
                <p className="text-[10px] text-slate-400/80 leading-relaxed font-medium">
                  Didapatkan dari nilai HPP pokok pelayanan <span className="text-slate-200 font-bold">{formatIDR(hppPerKK)}</span> ditambah cadangan kas pembangunan <span className="text-slate-200 font-bold">{marginPercent}% ({formatIDR(reserveAmountPerKK)})</span>.
                </p>
              </div>

              {/* Status Indicator Bar */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Analisis Perbandingan Tarif Aktual</span>
                
                {isDeficit ? (
                  <div className="flex items-start gap-3 text-rose-400">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase block tracking-wider leading-none">Status: Defisit Tarif!</span>
                      <p className="text-[10px] text-slate-300 mt-1.5 leading-normal font-semibold">
                        Tarif saat ini ({formatIDR(currentIuran)}) di bawah biaya pokok pelayanan lingkungan ({formatIDR(hppPerKK)}). RT Anda berpotensi kekurangan dana kas untuk pemeliharaan rutin jangka panjang.
                      </p>
                    </div>
                  </div>
                ) : isHealthy ? (
                  <div className="flex items-start gap-3 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase block tracking-wider leading-none">Status: Sangat Sehat</span>
                      <p className="text-[10px] text-slate-300 mt-1.5 leading-normal font-semibold">
                        Tarif saat ini ({formatIDR(currentIuran)}) sangat berimbang dengan biaya operasional riil dan memberikan ketahanan finansial kas rukun tetangga yang ideal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-amber-400">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase block tracking-wider leading-none">Status: Surplus Tinggi</span>
                      <p className="text-[10px] text-slate-300 mt-1.5 leading-normal font-semibold">
                        Tarif saat ini ({formatIDR(currentIuran)}) memberikan kelebihan margin di atas target cadangan kas {marginPercent}%. Sangat baik untuk percepatan program infrastruktur besar lingkungan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations strategic steps */}
            <div className="pt-6 mt-6 border-t border-white/10 relative z-10 space-y-3.5">
              <span className="text-[8px] font-black uppercase tracking-wider text-teal-400 block pb-1 border-b border-white/5">Rekomendasi Strategis Penasehat:</span>
              <ul className="space-y-2 text-[10px] text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{isDeficit ? `Pertimbangkan menaikkan iuran bertahap minimal ${formatIDR(recommendedTariff)} per KK.` : "Pertahankan skema tarif ini dan sampaikan transparansi rekap kas periodik via Mading."}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Maksimalkan fitur usaha digital rukun tetangga berbasis <b>PPOB (Digital Hub)</b> untuk menambah dividen pendapatan pasif kas RT tanpa mendebat kenaikan iuran warga.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Sampaikan laporan analisis HPP Pokok ini dalam musyawarah RT agar warga paham struktur biaya kemitraan Hansip dan Pengangkutan Sampah kompleks.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* Printable Business/Governance Report Overlay in bottom */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6" id="mading-print-hpp-report">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">Butuh Dokumen Pendukung Musyawarah?</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Menerbitkan Ringkasan Analisis Tarif HPP RT/RW</p>
          </div>
        </div>
        <button
          onClick={() => {
            window.print();
          }}
          className="px-6 py-3.5 bg-slate-850 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-2xl transition-all cursor-pointer shadow-sm hover:scale-102"
        >
          Cetak Analisis Keuangan RT (.pdf)
        </button>
      </div>

    </div>
  );
}
