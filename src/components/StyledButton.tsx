import React from 'react';
import { motion } from 'motion/react';

interface StyledButtonProps {
  label: string;
  onClick: () => void;
  colorType?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'pastelBlue' | 'pastelPink' | 'pastelGreen' | 'pastelRed' | 'pastelRedActive' | 'pastelBlueActive' | 'brightPink';
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const colorMap = {
  primary: 'from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] border-t border-white/20',
  secondary: 'from-slate-50 to-slate-100 text-slate-800 shadow-sm border border-slate-200/60 hover:bg-white',
  accent: 'from-amber-400 via-amber-500 to-orange-600 text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] border-t border-white/20',
  danger: 'from-rose-500 via-red-600 to-red-700 text-white shadow-[0_10px_20px_-5px_rgba(225,29,72,0.4)] border-t border-white/20',
  success: 'from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.4)] border-t border-white/20',
  pastelBlue: 'from-blue-50 to-blue-100 text-blue-700 border border-blue-200/50',
  pastelPink: 'from-pink-50 to-pink-100 text-pink-700 border border-pink-200/50',
  pastelGreen: 'from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200/50',
  pastelRed: 'from-rose-50 to-rose-100 text-rose-700 border border-rose-200/50',
  pastelRedActive: 'from-rose-600 to-red-700 text-white shadow-lg border-t border-white/20',
  pastelBlueActive: 'from-blue-600 to-indigo-700 text-white shadow-lg border-t border-white/20',
  brightPink: 'from-pink-500 via-rose-600 to-rose-700 text-white shadow-[0_10px_20px_-5px_rgba(244,63,94,0.4)] border-t border-white/20',
};

export const StyledButton: React.FC<StyledButtonProps> = ({ label, onClick, colorType = 'primary', className, icon, disabled, type = 'button' }) => {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { 
        scale: 1.03, 
        y: -3, 
        transition: { type: "spring", stiffness: 400, damping: 10 } 
      }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2.5 bg-gradient-to-br ${disabled ? 'bg-slate-300 from-slate-300 to-slate-400 text-slate-500 cursor-not-allowed opacity-60 shadow-none' : colorMap[colorType]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};
