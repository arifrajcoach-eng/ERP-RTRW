import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, ChevronRight, CreditCard, Check, ShieldCheck, Heart, Sparkles, Plus, Layers } from 'lucide-react';
import { ADDON_CONFIG } from '../constants';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleAddon = (featureKey: string) => {
    setSelectedAddons(prev => 
      prev.includes(featureKey) 
        ? prev.filter(k => k !== featureKey) 
        : [...prev, featureKey]
    );
  };

  const getActiveWhatsAppText = () => {
    const addonsText = selectedAddons.map(addonKey => {
      const item = Object.values(ADDON_CONFIG).find(a => a.featureKey === addonKey);
      return item ? `- ${item.name}` : `- ${addonKey}`;
    }).join('\n');

    let planSegment = selectedPlan ? `Paket ${selectedPlan.toUpperCase()}` : 'Custom Add-On Saja';
    
    let text = `Halo Tim Nexapps, saya ingin upgrade / berlangganan:\n\n*Pilihan:* ${planSegment}`;
    if (selectedAddons.length > 0) {
      text += `\n*Add-On Tambahan:*\n${addonsText}`;
    }
    text += `\n\nNomohon panduan aktivasi sistem & metode pembayarannya. Terima kasih!`;
    return encodeURIComponent(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden my-8 border border-slate-100"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                  <CreditCard className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg md:text-xl font-black text-slate-800 leading-none">Paket & Add-On Premium</h2>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Upgrade Custom Sesuai Keinginan
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4 text-left">
                {/* 1. SECTION PAKET UTAMA */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Langkah 1: Pilih Paket Utama (Opsional)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'flash', name: 'Flash', color: 'border-emerald-200 text-emerald-800 bg-emerald-50/50' },
                      { id: 'pro', name: 'Pro', color: 'border-blue-200 text-blue-800 bg-blue-50/50' },
                      { id: 'premium', name: 'Premium', color: 'border-rose-200 text-rose-800 bg-rose-50/50' },
                      { id: 'enterprise', name: 'Enterprise', color: 'border-slate-800 text-slate-900 bg-slate-100' }
                    ].map((p) => {
                      const isActive = selectedPlan === p.id;
                      return (
                        <button 
                          key={p.id}
                          onClick={() => setSelectedPlan(prev => prev === p.id ? null : p.id)}
                          className={`p-3 rounded-2xl border text-center relative flex flex-col items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 transition-all shadow-sm ${
                            isActive 
                              ? 'ring-4 ring-indigo-500/30 border-indigo-600 bg-gradient-to-tr from-indigo-50 to-cyan-50 text-indigo-950 font-black' 
                              : p.color
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-wider">{p.name}</span>
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-indigo-600 text-white rounded-full flex items-center justify-center p-0.5">
                              <Check className="w-2 h-2 stroke-[4]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SECTION CUSTOM ADD-ONS */}
                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Langkah 2: Pilih Add-On Custom (Sesuai Kebutuhan)</p>
                    {selectedAddons.length > 0 && (
                      <button 
                        onClick={() => setSelectedAddons([])}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-700 uppercase"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-52 overflow-y-auto border border-slate-100 bg-slate-50/50 p-3 rounded-2xl space-y-2 custom-scrollbar">
                    {Object.values(ADDON_CONFIG).map((addon) => {
                      const isChecked = selectedAddons.includes(addon.featureKey);
                      return (
                        <div 
                          key={addon.id}
                          onClick={() => handleToggleAddon(addon.featureKey)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all hover:bg-white select-none ${
                            isChecked 
                              ? 'border-indigo-400 bg-indigo-50/30 text-indigo-950 shadow-sm' 
                              : 'border-slate-200/60 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold leading-tight">{addon.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SUMMARY PANEL */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2.5xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <div className="flex items-center gap-1.5 text-cyan-400 font-black uppercase text-[9px] tracking-widest">
                      <Layers className="w-3 h-3 text-yellow-400" />
                      <span>Rencana Kustomisasi Anda</span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 mt-1 max-w-[280px]">
                      {selectedPlan ? `Meningkatkan ke Paket ${selectedPlan.toUpperCase()}` : 'Aktivasi Add-on saja'} 
                      {selectedAddons.length > 0 && ` + ${selectedAddons.length} Fitur Tambahan (Add-On)`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const query = getActiveWhatsAppText();
                      window.open(`https://wa.me/6287726741143?text=${query}`, '_blank');
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-cyan-400 to-brand-blue hover:from-cyan-300 hover:to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-blue/30 flex items-center justify-center gap-2 whitespace-nowrap self-stretch sm:self-auto border border-white/10"
                  >
                    <span>Hubungi WA</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-px bg-slate-100 my-2" />

                {/* 3. BUTTON PILIHAN */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      setSelectedAddons([]);
                      onClose();
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Batal & Tutup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
