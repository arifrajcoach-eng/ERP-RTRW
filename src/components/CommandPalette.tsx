import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Users, CreditCard, FileText, LayoutDashboard, 
  Settings, UserPlus, Megaphone, ShieldAlert, X,
  Building, Activity, Zap, Shield, Wallet
} from "lucide-react";
import { getTranslatedLabel } from "../lib/langUtils";
import { getPlanFeatures } from "../lib/appUtils";

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  themeMode?: string;
  currentTenant?: any;
}

export default function CommandPalette({ onNavigate, isOpen, setIsOpen, themeMode, currentTenant }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [isOpen]);

  const commands = [
    { id: "dashboard", name: "Beranda Utama", icon: LayoutDashboard, category: "Navigasi", action: () => onNavigate("dashboard") },
    { id: "warga", name: `Data ${getTranslatedLabel("Warga", themeMode)}`, icon: Users, category: "Navigasi", action: () => onNavigate("warga") },
    { id: "finansial", name: "Analytics Finansial", icon: Activity, category: "Navigasi", action: () => onNavigate("keuangan") },
    ...(getPlanFeatures(currentTenant).analytics ? [{ id: "analitik_ringkasan", name: "ANALYTICS AI", icon: Activity, category: "Navigasi", action: () => onNavigate("analitik") }] : []),
    { id: "kas", name: "Catatan Kas & Iuran", icon: CreditCard, category: "Navigasi", action: () => onNavigate("keuangan") },
    { id: "surat", name: "Administrasi Surat", icon: FileText, category: "Navigasi", action: () => onNavigate("surat") },
    { id: "mading", name: "Papan Informasi", icon: Megaphone, category: "Navigasi", action: () => onNavigate("dashboard") },
    { id: "organisasi", name: "Struktur Organisasi", icon: Building, category: "Navigasi", action: () => onNavigate("organisasi") },
    { id: "add_warga", name: `Tambah ${getTranslatedLabel("Warga", themeMode)} Baru`, icon: UserPlus, category: "Tindakan Cepat", action: () => { onNavigate("warga"); setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-warga')), 300); } },
    { id: "add_kas", name: "Catat Pemasukan/Pengeluaran", icon: Wallet, category: "Tindakan Cepat", action: () => { onNavigate("keuangan"); setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-transaction')), 300); } },
    { id: "settings", name: "Pengaturan Sistem", icon: Settings, category: "Sistem", action: () => onNavigate("pengaturan") },
  ];

  const filteredCommands = query === "" 
    ? commands 
    : commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

  const categories = Array.from(new Set(filteredCommands.map(c => c.category)));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-200/50 dark:border-slate-800/80 flex flex-col"
            >
              <div className="flex items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-6 h-6 text-slate-400 group-hover:text-brand-blue transition-colors mr-4" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari fitur, menu, atau pintasan... (Ketik '')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {filteredCommands.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                    <p>Pencarian "{query}" tidak ditemukan.</p>
                  </div>
                ) : (
                  categories.map(category => (
                    <div key={category} className="space-y-2">
                      <h3 className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {category}
                      </h3>
                      <div className="grid gap-1">
                        {filteredCommands.filter(c => c.category === category).map((command, idx) => {
                          const Icon = command.icon;
                          return (
                            <button
                              key={command.id}
                              onClick={() => {
                                command.action();
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left transition-colors duration-200 group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-4 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors duration-300">
                                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-brand-blue group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                              </div>
                              <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-blue">{command.name}</span>
                              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                  ENTER
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 font-sans">↑</kbd> <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 font-sans">↓</kbd> Navigasi navigasi</span>
                  <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 font-sans">esc</kbd> Tutup</span>
                </div>
                <span className="flex items-center text-brand-blue opacity-80"><Shield className="w-3.5 h-3.5 mr-1" /> SmaRtRw Pro Max Engine</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
