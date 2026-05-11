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
  const [activeFinTab, setActiveFinTab] = useState<'iuran' | 'kas' | 'ppob'>('iuran');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => setActiveFinTab('iuran')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-wider ${activeFinTab === 'iuran' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 ring-2 ring-blue-100' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
        >
          <CreditCard className="w-5 h-5" /> Iuran Warga
        </button>
        <button
          onClick={() => setActiveFinTab('kas')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-wider ${activeFinTab === 'kas' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 ring-2 ring-blue-100' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
        >
          <Wallet className="w-5 h-5" /> Buku Kas
        </button>
        <button
          onClick={() => setActiveFinTab('ppob')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-wider ${activeFinTab === 'ppob' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 ring-2 ring-blue-100' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
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
