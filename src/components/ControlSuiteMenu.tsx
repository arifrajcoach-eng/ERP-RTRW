import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  RefreshCw,
  PlusCircle,
  Shield,
  Zap,
  MoreVertical,
  X,
} from "lucide-react";
import { StyledButton } from "./StyledButton";

export function ControlSuiteMenu({
  onRestoreDefaults,
  onDeleteLegacy,
  onStandardize,
  onAddTenant,
  canReset,
  onReset
}: {
  onRestoreDefaults: () => void;
  onDeleteLegacy: () => void;
  onStandardize: () => void;
  onAddTenant: () => void;
  canReset: boolean;
  onReset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative inline-block text-left">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        Control Suite
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile ? (
              // Mobile View: Perfect Centered Premium Full Modal with Blurred Backdrop
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                  onClick={() => setIsOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-[340px] bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 z-50 text-slate-800 dark:text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 font-elegant">
                        Control Suite Menu
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all animate-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <MenuAction label="Pulihkan Default Tenants" icon={<RefreshCw />} onClick={() => { onRestoreDefaults(); setIsOpen(false); }} />
                    <MenuAction label="Hapus Permanen Tenants Lama" icon={<RefreshCw />} onClick={() => { onDeleteLegacy(); setIsOpen(false); }} />
                    <MenuAction label="Standardisasi maxWarga" icon={<RefreshCw />} onClick={() => { onStandardize(); setIsOpen(false); }} />
                    {canReset && <MenuAction label="Reset ke Super Admin" icon={<Shield />} onClick={() => { onReset(); setIsOpen(false); }} />}
                    <div className="border-t border-slate-100 dark:border-slate-800/80 my-2" />
                    <MenuAction label="Tambah Tenant Baru" icon={<PlusCircle />} onClick={() => { onAddTenant(); setIsOpen(false); }} active />
                  </div>
                </motion.div>
              </div>
            ) : (
              // Desktop View: Contextual Dropdown
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 text-slate-800"
                >
                  <div className="flex flex-col gap-1">
                    <MenuAction label="Pulihkan Default Tenants" icon={<RefreshCw />} onClick={() => { onRestoreDefaults(); setIsOpen(false); }} />
                    <MenuAction label="Hapus Permanen Tenants Lama" icon={<RefreshCw />} onClick={() => { onDeleteLegacy(); setIsOpen(false); }} />
                    <MenuAction label="Standardisasi maxWarga" icon={<RefreshCw />} onClick={() => { onStandardize(); setIsOpen(false); }} />
                    {canReset && <MenuAction label="Reset ke Super Admin" icon={<Shield />} onClick={() => { onReset(); setIsOpen(false); }} />}
                    <div className="border-t border-slate-100 my-1" />
                    <MenuAction label="Tambah Tenant Baru" icon={<PlusCircle />} onClick={() => { onAddTenant(); setIsOpen(false); }} active />
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuAction({ label, icon, onClick, active = false }: { label: string; icon: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
        active 
          ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      }`}
    >
      <div className="w-4 h-4 text-slate-400 shrink-0">{icon}</div>
      <span className="truncate">{label}</span>
    </button>
  );
}
