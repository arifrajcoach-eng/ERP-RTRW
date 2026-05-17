import React from 'react';
import { motion } from 'motion/react';

interface StyledButtonProps {
  label: string;
  onClick: () => void;
  colorType?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'pastelBlue' | 'pastelPink' | 'pastelGreen' | 'pastelRed' | 'pastelRedActive' | 'pastelBlueActive' | 'brightPink';
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const colorMap = {
  primary: 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white',
  secondary: 'from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800',
  accent: 'from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white',
  danger: 'from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white',
  success: 'from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white',
  pastelBlue: 'from-sky-200 to-sky-300 hover:from-sky-300 hover:to-sky-400 text-sky-900',
  pastelPink: 'from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900',
  pastelGreen: 'from-emerald-200 to-emerald-300 hover:from-emerald-300 hover:to-emerald-400 text-emerald-900',
  pastelRed: 'from-red-200 to-red-300 hover:from-red-300 hover:to-red-400 text-red-900',
  pastelRedActive: 'from-[#fc005d] to-[#d6004e] hover:from-[#d6004e] hover:to-[#b00040] text-white',
  pastelBlueActive: 'from-[#0087f7] to-[#006bd6] hover:from-[#006bd6] hover:to-[#005bb0] text-white',
  brightPink: 'from-[#f5007f] to-[#d4006e] hover:from-[#d4006e] hover:to-[#b3005d] text-white',
};

export const StyledButton: React.FC<StyledButtonProps> = ({ label, onClick, colorType = 'primary', className, icon, disabled }) => {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-br ${disabled ? 'bg-gray-400 from-gray-400 to-gray-500 text-white cursor-not-allowed' : colorMap[colorType]} ${className}`}
    >
      {icon}
      {label}
    </motion.button>
  );
};
