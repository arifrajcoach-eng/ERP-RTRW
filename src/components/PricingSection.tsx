import React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Check, Building2, Sparkles, Home, User } from 'lucide-react';
import { PLAN_CONFIG } from '../constants';

const icons: Record<string, any> = {
  starter: User,
  flash: Home,
  pro: Zap,
  premium: Sparkles,
  enterprise: Building2,
};

export const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-20 bg-[#001F3F] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#D4AF37] mb-4">Pilihan Paket Nexyn</h2>
          <p className="text-lg text-slate-300 font-sans">Solusi ERP RT/RW Tactical Elegance</p>
          
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className={`text-sm ${!isYearly ? 'font-bold text-white' : 'text-slate-400'}`}>Bulanan</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-slate-700 rounded-full p-1 transition-all flex items-center"
            >
              <div className={`w-5 h-5 bg-[#D4AF37] rounded-full transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm ${isYearly ? 'font-bold text-white' : 'text-slate-400'}`}>Tahunan (Hemat 20%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.values(PLAN_CONFIG).map((plan) => {
            const Icon = icons[plan.id];
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -10 }}
                className={`relative p-6 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 flex flex-col ${
                  plan.isBestSeller ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]' : ''
                }`}
              >
              {plan.isBestSeller && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                  Rekomendasi Pengurus RW
                </div>
              )}
              
              <Icon className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-xl font-serif font-bold mb-0.5">{plan.name}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4 font-sans">{plan.focus}</p>
              
              <div className="text-2xl font-bold mb-6 font-sans">
                {plan.priceMonthly === 0 ? 'GRATIS' : `Rp${(isYearly ? plan.priceYearly : plan.priceMonthly).toLocaleString('id-ID')}`}
                {plan.priceMonthly > 0 && <span className="text-sm font-normal text-slate-400">/{isYearly ? 'thn' : 'bln'}</span>}
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs font-sans text-slate-200">
                    <Check className="w-3 h-3 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                plan.isBestSeller ? 'bg-[#D4AF37] text-black hover:bg-white' : 'bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
              }`}>
                {plan.priceMonthly === 0 ? 'Mulai Sekarang' : 'Pilih Paket'}
              </button>
            </motion.div>
            )
          })}
        </div>

        <div className="mt-16 text-center text-slate-400 text-sm font-sans bg-white/5 p-6 rounded-2xl border border-white/5">
          <p>
            <ShieldCheck className="w-5 h-5 inline mr-2 text-[#D4AF37]"/>
            Sistem Bagi Hasil 50:50 untuk Dana Pengembangan Sistem & Kas Lingkungan
          </p>
        </div>
      </div>
    </section>
  );
};
