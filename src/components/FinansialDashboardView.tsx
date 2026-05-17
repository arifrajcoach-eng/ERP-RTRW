import React, { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Smartphone,
  PieChart
} from 'lucide-react';
import { StyledButton } from './StyledButton';
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
        <StyledButton
          label={isApt ? "IPL" : "Iuran Warga"}
          icon={<CreditCard className="w-4 h-4" />}
          onClick={() => setActiveFinTab('iuran')}
          colorType={activeFinTab === 'iuran' ? 'primary' : 'secondary'}
          className="uppercase tracking-widest text-xs"
        />
        <StyledButton
          label="Buku Kas"
          icon={<Wallet className="w-4 h-4" />}
          onClick={() => setActiveFinTab('kas')}
          colorType={activeFinTab === 'kas' ? 'primary' : 'secondary'}
          className="uppercase tracking-widest text-xs"
        />
        <StyledButton
          label="Digital & PPOB"
          icon={<Smartphone className="w-4 h-4" />}
          onClick={() => setActiveFinTab('ppob')}
          colorType={activeFinTab === 'ppob' ? 'primary' : 'secondary'}
          className="uppercase tracking-widest text-xs"
        />
      </div>

      {activeFinTab === 'iuran' && <IuranView {...props} />}
      {activeFinTab === 'kas' && <KasView {...props} />}
      {activeFinTab === 'ppob' && <PPOBView {...props} />}
    </div>
  );
}
