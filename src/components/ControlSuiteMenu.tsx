import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  RefreshCw,
  PlusCircle,
  Shield,
  Zap,
  MoreVertical,
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

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        Control Suite
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
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
          ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className="w-4 h-4 text-slate-400">{icon}</div>
      {label}
    </button>
  );
}
