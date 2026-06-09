import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Zap, ChevronRight, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
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
                <CreditCard className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Pilih Metode Pembayaran</h2>
              <p className="text-slate-500 mb-8">
                Upgrade paket Anda untuk menikmati akses penuh.
              </p>
              
              <div className="w-full space-y-3 text-left">
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Pilih Paket Untuk Diupgrade:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'flash', name: 'Paket Flash', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                      { id: 'pro', name: 'Paket Pro', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { id: 'premium', name: 'Paket Premium', color: 'bg-rose-50 text-rose-700 border-rose-100' },
                      { id: 'enterprise', name: 'Paket Enterprise', color: 'bg-slate-900 text-white border-slate-800' }
                    ].map((p) => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          const waText = encodeURIComponent(`Halo Tim Nexapps, saya ingin upgrade ke ${p.name}. Mohon panduannya.`);
                          window.open(`https://wa.me/6285155455667?text=${waText}`, '_blank');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 transition-all shadow-sm ${p.color}`}
                      >
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tight">{p.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4" />
                
                <button
                  onClick={() => {
                    alert('Layanan QRIS segera hadir.');
                  }}
                  className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-2xl font-black transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Bayar dengan QRIS
                </button>
                <button
                  onClick={() => {
                    alert('Layanan M-Banking segera hadir.');
                  }}
                  className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-2xl font-black transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Bayar via M-Banking
                </button>
                <button
                  onClick={() => {
                    alert('Fitur Pembayaran Otomatis segera hadir. Silakan gunakan metode manual via WA untuk saat ini.');
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Pembayaran Otomatis via Kartu Kredit
                </button>
                <button
                  onClick={() => {
                    const waText = encodeURIComponent(`Halo Tim Nexapps, saya ingin upgrade paket tenant saya secara manual. Mohon panduannya.`);
                    window.open(`https://wa.me/6285155455667?text=${waText}`, '_blank');
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade via Customer Service (WA)
                </button>
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

export default PaymentModal;
