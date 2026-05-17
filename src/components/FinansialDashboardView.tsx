import React, { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Smartphone,
  PieChart
} from 'lucide-react';
import { IuranView } from './IuranView';
import { KasView } from './KasView';
import { PPOBView } from './PPOBView';

interface FinansialDashboardViewProps {
  iuranData: any[];
  setIuranData: React.Dispatch<React.SetStateAction<any[]>>;
  kasData: any[];
  setKasData: React.Dispatch<React.SetStateAction<any[]>>;
  ppobData: any[];
  setPpobData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData: any[];
  userRole: string;
  currentUser: any;
  getSetting: (key: string) => any;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  handleFileUpload: (file: File, path: string) => Promise<string>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isPengurus: boolean;
  plan?: string;
}

export function FinansialDashboardView(props: FinansialDashboardViewProps) {
  const isApt = props.getSetting("themeMode") === "apartemen";
  const [activeFinTab, setActiveFinTab] = useState<'iuran' | 'kas' | 'ppob'>('iuran');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveFinTab('iuran')}
          className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all uppercase tracking-widest backdrop-blur-md border hover:scale-[1.02] active:scale-[0.98] ${
            activeFinTab === 'iuran' 
              ? 'bg-cyan-500 text-white border-cyan-400 shadow-xl shadow-cyan-500/25' 
              : 'bg-white/30 text-slate-500 border-white/60 hover:bg-white/60'
          }`}
        >
          <CreditCard className="w-5 h-5" /> {isApt ? "IPL" : "Iuran Warga"}
        </button>
        <button
          onClick={() => setActiveFinTab('kas')}
          className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all uppercase tracking-widest backdrop-blur-md border hover:scale-[1.02] active:scale-[0.98] ${
            activeFinTab === 'kas' 
              ? 'bg-amber-500 text-white border-amber-400 shadow-xl shadow-amber-500/25' 
              : 'bg-white/30 text-slate-500 border-white/60 hover:bg-white/60'
          }`}
        >
          <Wallet className="w-5 h-5" /> Buku Kas
        </button>
        <button
          onClick={() => setActiveFinTab('ppob')}
          className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all uppercase tracking-widest backdrop-blur-xl border hover:scale-[1.02] active:scale-[0.98] ${
            activeFinTab === 'ppob' 
              ? 'bg-[#12078d] text-white border-blue-900/50 shadow-2xl shadow-blue-900/40 ring-4 ring-blue-900/10' 
              : 'bg-white/40 text-slate-500 border-white/60 hover:bg-white/60 hover:text-[#12078d]'
          }`}
        >
          <Smartphone className="w-5 h-5" /> Digital & PPOB
        </button>
      </div>

      {activeFinTab === 'iuran' && <IuranView {...props} />}
      {activeFinTab === 'kas' && <KasView {...props} />}
      {activeFinTab === 'ppob' && <PPOBView {...props} />}
    </div>
  );
}
