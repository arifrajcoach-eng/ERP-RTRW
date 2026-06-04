import React from 'react';
import { motion } from 'motion/react';
import { Trash2, AlertTriangle, PlusCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Hapus", 
  cancelText = "Batal", 
  type = "danger",
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[9999] p-4 print:hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="p-6 text-center">
          <div className={`w-16 h-16 ${
            type === 'danger' ? 'bg-red-50 text-red-600' : 
            type === 'warning' ? 'bg-amber-50 text-amber-600' : 
            'bg-blue-50 text-blue-600'
          } rounded-full flex items-center justify-center mx-auto mb-4`}>
            {type === 'danger' ? <Trash2 className="w-8 h-8" /> : 
             type === 'warning' ? <AlertTriangle className="w-8 h-8" /> : 
             <PlusCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2 mt-2">{title}</h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">{message}</p>
        </div>
        <div className="flex gap-3 p-6 pt-0 mt-auto">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 text-sm font-black text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all disabled:opacity-50 uppercase tracking-widest border border-slate-100"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3.5 text-sm font-black text-white rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 
              type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 
              'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Proses...</span>
              </>
            ) : confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
