import React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Check, Building2, Sparkles, Home, User, ShieldCheck } from 'lucide-react';
import { PLAN_CONFIG } from '../constants';

const icons: Record<string, any> = {
  starter: User,
  flash: Home,
  pro: Zap,
  premium: Sparkles,
  enterprise: Building2,
};

interface PricingSectionProps {
  onSelectFreeTrial?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectFreeTrial }) => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Promo Terbatas
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
            Pilih Paket <span className="text-brand-pink">SmartRW AI</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
            Solusi digitalisasi RT/RW tercanggih di Indonesia. <br className="hidden md:block" />
            Pilih paket yang sesuai dengan kebutuhan lingkungan Anda.
          </p>
          
          <div className="mt-8 flex justify-center items-center gap-5">
            <span className={`text-xs font-bold uppercase tracking-widest ${!isYearly ? 'text-brand-blue' : 'text-slate-400'}`}>Bulanan</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-8 bg-slate-100 rounded-full p-1 transition-all flex items-center border border-slate-200"
            >
              <div className={`w-6 h-6 bg-brand-pink rounded-full transition-transform shadow-md ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${isYearly ? 'text-brand-pink' : 'text-slate-400'}`}>Tahunan</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full animate-pulse">HEMAT 20%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.values(PLAN_CONFIG).map((plan) => {
            const Icon = icons[plan.id];
            const isBestSeller = (plan as any).isBestSeller;
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            const oldPrice = isYearly ? (plan as any).priceOldYearly || (plan as any).priceOldMonthly * 12 : (plan as any).priceOldMonthly;

            const formatPrice = (num: number) => {
              const pricePerMonth = Math.round((num / (isYearly ? 12 : 1)) / 100) * 100;
              if (pricePerMonth >= 1000000) {
                return (pricePerMonth / 1000000).toString().replace('.', ',') + 'jt';
              }
              if (pricePerMonth >= 1000) {
                return (pricePerMonth / 1000) + 'k';
              }
              return pricePerMonth.toString();
            };

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}                
                className={`relative p-8 rounded-[2.5rem] border-2 flex flex-col transition-all overflow-hidden ${
                  plan.id === 'enterprise' ? 'border-[#e4e439]' :
                  plan.id === 'pro' ? 'border-[#88da5b]' :
                  isBestSeller 
                    ? 'border-brand-pink bg-white shadow-2xl shadow-brand-pink/10 ring-4 ring-brand-pink/5' 
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-blue/20 hover:shadow-xl'
                }`}
              >
                {isBestSeller && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-brand-pink text-white text-[8px] font-black py-1 px-8 rotate-45 translate-x-6 translate-y-3 uppercase tracking-tighter">
                      Terpopuler
                    </div>
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isBestSeller ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">{plan.name}</h3>
                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6">{plan.focus}</p>
                
                <div className="mb-6">
                  {oldPrice > 0 && (
                    <div className="text-slate-400 text-xs line-through font-bold mb-1">
                      Rp.{formatPrice(oldPrice)}
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800">
                      {price === 0 ? 'GRATIS' : `Rp.${formatPrice(price)}`}
                    </span>
                    {price > 0 && <span className="text-[10px] font-bold text-slate-400 uppercase">/bln*</span>}
                  </div>
                  {isYearly && price > 0 && (
                    <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">Dibayar per tahun</p>
                  )}
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-100 pb-2">Fitur Utama</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-snug">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isBestSeller ? 'bg-brand-pink/10 text-brand-pink' : 'bg-brand-blue/10 text-brand-blue'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    if (plan.priceMonthly === 0 && onSelectFreeTrial) {
                      onSelectFreeTrial();
                    } else {
                      window.open(`https://wa.me/087726741143?text=Halo%20Admin,%20saya%20tertarik%20dengan%20Paket%20${plan.name}%20SmartRW%20AI`, '_blank');
                    }
                  }}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    plan.id === 'enterprise' ? 'border-2 border-[#dcde50] bg-[#fffffd] text-black hover:bg-slate-100' :
                    plan.id === 'pro' ? 'border-2 border-[#76cc46] bg-white text-black hover:bg-slate-50' :
                    isBestSeller 
                      ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20 hover:scale-[1.05] active:scale-95' 
                      : 'bg-white border-2 border-slate-200 text-black hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5'
                  }`}
                >
                  {plan.priceMonthly === 0 ? 'Daftar Gratis' : 'Pilih Paket'}
                </button>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 border border-slate-100 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-0.5">Sistem Bagi Hasil 50:50</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dana Pengembangan & Kas Lingkungan</p>
            </div>
          </div>
          <button 
            onClick={() => window.open('https://wa.me/087726741143?text=Halo%20Admin,%20saya%20ingin%20konsultasi%20mengenai%20SmartRW%20AI', '_blank')}
            className="px-8 py-4 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all"
          >
            Konsultasi Admin
          </button>
        </div>
        
        <p className="text-center mt-8 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          *Harga sewaktu-waktu dapat berubah sesuai kebijakan promo yang berlaku.
        </p>
      </div>
    </section>
  );
};
