import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Wallet, 
  PieChart,
  ChevronLeft,
  DollarSign
} from 'lucide-react';
import { StyledButton } from './StyledButton';
import { IuranView } from './IuranView';
import { KasView } from './KasView';
import { RekomendasiHargaView } from './RekomendasiHargaView';

interface FinansialDashboardViewProps {
  iuranData: any[];
  setIuranData: React.Dispatch<React.SetStateAction<any[]>>;
  kasData: any[];
  setKasData: React.Dispatch<React.SetStateAction<any[]>>;
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
  refreshKeuangan?: () => Promise<void> | void;
  onBack?: () => void;
}

export function FinansialDashboardView(props: FinansialDashboardViewProps) {
  const isApt = props.getSetting("themeMode") === "apartemen";
  const [activeFinTab, setActiveFinTab] = useState<'iuran' | 'kas' | 'rekomendasi'>('iuran');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {props.onBack && (
            <button 
              onClick={props.onBack}
              className="mt-1 p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-brand-blue border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Kembali ke Dashboard"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-brand-blue/10 p-2.5 rounded-2xl">
                <DollarSign className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="text-3xl font-bold italic text-slate-800 dark:text-slate-100 tracking-tight uppercase font-outfit">
                KEUANGAN
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              Transparansi & Akuntabilitas Kas Lingkungan • {props.kasData.length + props.iuranData.length} Catatan
            </p>
          </div>
        </div>
      </div>

      {/* Premium Tab Navigation */}
      <div className="flex w-full md:w-fit bg-slate-100/50 dark:bg-slate-800/50 p-1.5 sm:p-2 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl backdrop-blur-3xl animate-in fade-in slide-in-from-left-4 duration-700 justify-between md:justify-start">
        {[
          { id: 'iuran', label: isApt ? "Internal IPL" : "IURAN WARGA", icon: CreditCard, gradient: 'from-brand-blue to-indigo-600' },
          { id: 'kas', label: "Kas Besar", icon: Wallet, gradient: 'from-emerald-500 to-teal-600' },
          { id: 'rekomendasi', label: "Hitung Biaya", icon: PieChart, gradient: 'from-amber-500 to-orange-600' }
        ].filter(tab => (tab.id !== 'kas' && tab.id !== 'rekomendasi') || props.isPengurus).map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFinTab(tab.id as any)}
            className={`group flex flex-1 md:flex-initial flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 px-2 py-2.5 sm:px-10 sm:py-5 rounded-xl md:rounded-[1.75rem] text-[9px] sm:text-[11px] font-black transition-all duration-500 uppercase tracking-normal sm:tracking-[0.25em] text-center leading-tight relative overflow-hidden ${
              activeFinTab === tab.id 
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl` 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeFinTab === tab.id && (
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            )}
            <tab.icon className={`w-4 h-4 sm:w-5 h-5 transition-transform duration-500 ${activeFinTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="whitespace-pre-line sm:whitespace-nowrap">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFinTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeFinTab === 'iuran' && <IuranView {...props} />}
            {activeFinTab === 'kas' && <KasView {...props} />}
            {activeFinTab === 'rekomendasi' && <RekomendasiHargaView {...props} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
