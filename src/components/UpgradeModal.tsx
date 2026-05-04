import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Zap, ChevronRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Fitur Terkunci</h2>
              <p className="text-slate-500 mb-8">
                Fitur ini memerlukan paket <span className="font-bold text-brand-blue">PRO</span>, <span className="font-bold text-indigo-600">PREMIUM</span>, atau <span className="font-bold text-slate-900 italic">🏛️ ENTERPRISE</span>. Upgrade paket Anda sekarang untuk menikmati akses penuh.
              </p>
              
              <div className="w-full space-y-3">
                <button
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade Paket Premium
                </button>
                <div className="p-4 bg-slate-900 rounded-2xl text-white flex justify-between items-center group cursor-pointer hover:bg-black transition-all">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilihan Pemerintah</p>
                     <p className="text-xs font-bold">🏛️ PAKET ENTERPRISE</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
