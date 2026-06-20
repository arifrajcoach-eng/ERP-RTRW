import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  Radio, 
  RefreshCcw, 
  X, 
  Save, 
  Sparkles, 
  PlaySquare, 
  HardDriveUpload,
  Info
} from "lucide-react";
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  getSupabaseClient, 
  resetSupabaseClient, 
  SUPABASE_SQL_SCHEMA 
} from "../lib/supabase";

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEngineChange?: (engine: "firestore" | "supabase") => void;
  currentEngine?: "firestore" | "supabase";
}

export default function SupabaseConnectModal({
  isOpen,
  onClose,
  onEngineChange,
  currentEngine = "firestore"
}: SupabaseConnectModalProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeEngine, setActiveEngine] = useState<"firestore" | "supabase">(currentEngine);

  // Load initial settings
  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      
      const savedEngine = localStorage.getItem("preferred_db_engine") as "firestore" | "supabase";
      if (savedEngine) {
        setActiveEngine(savedEngine);
      } else {
        setActiveEngine(currentEngine);
      }
    }
  }, [isOpen, currentEngine]);

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks schema: ", err);
    }
  };

  const handleSaveAndTest = async () => {
    if (!url || !anonKey) {
      setTestStatus("error");
      setErrorMessage("Harap masukkan URL dan Anon API Key Supabase Anda.");
      return;
    }

    setTestStatus("testing");
    setErrorMessage("");

    try {
      // Temporarily save to local storage to test
      saveSupabaseConfig(url, anonKey);
      resetSupabaseClient();
      
      const client = getSupabaseClient();
      if (!client) {
        throw new Error("Gagal menginisialisasi client Supabase. Periksa format URL.");
      }

      // Try reading state or checking connection
      const { data, error } = await client
        .from("tenants")
        .select("count", { count: 'exact', head: true });

      if (error && error.code !== "PGRST116" && error.code !== "42P01") {
        // 42P01 is "relation does not exist", meaning connected but table not created yet - which is still a successful auth/connection!
         throw error;
      }

      setTestStatus("success");
      
      // Save permanently to engine selector
      localStorage.setItem("preferred_db_engine", activeEngine);
      if (onEngineChange) {
        onEngineChange(activeEngine);
      }
    } catch (err: any) {
      console.error("Supabase test failed: ", err);
      setTestStatus("error");
      setErrorMessage(err.message || "Koneksi gagal. Periksa kembali URL dan Anon Key Anda.");
      // Revert if failed
      const original = getSupabaseConfig();
      setUrl(original.url);
      setAnonKey(original.anonKey);
    }
  };

  const handleToggleEngine = (engine: "firestore" | "supabase") => {
    setActiveEngine(engine);
    localStorage.setItem("preferred_db_engine", engine);
    if (onEngineChange) {
      onEngineChange(engine);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="supabase-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/50 dark:from-slate-900/50 dark:to-slate-900/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md shadow-emerald-500/10">
                  <Database className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Integrasi Database Supabase 
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase">
                      Bebas Batasan Quota
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Konfigurasikan database PostgreSQL Supabase Anda sendiri untuk performa kencang tanpa batas harian.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Database Engine Selector */}
              <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/15 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-4 w-full">
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">
                        Firestore Mengalami Beban Kuota Harian Maksimum
                      </h4>
                      <p className="text-xs text-amber-700/80 dark:text-slate-300 mt-1 leading-relaxed">
                        Database bawaan gratisan membatasi total pembacaan harian. Anda dapat terus menggunakan aplikasi dengan memasukkan kredensial **Supabase gratis** Anda sendiri di bawah ini.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={() => handleToggleEngine("firestore")}
                        className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs font-black tracking-wider ${
                          activeEngine === "firestore"
                            ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/10"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Radio className={`w-4 h-4 ${activeEngine === "firestore" ? "animate-ping" : ""}`} />
                          FIREBASE FIRESTORE (DEFAULT)
                        </span>
                        <span className="text-[10px] opacity-75">Bawaan</span>
                      </button>

                      <button
                        onClick={() => handleToggleEngine("supabase")}
                        className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs font-black tracking-wider ${
                          activeEngine === "supabase"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/10"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          SUPABASE POSTGRESQL ENGINE
                        </span>
                        <span className="text-[10px] opacity-75">Aktif</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Configuration Fields */}
                <div className="lg:col-span-5 space-y-5">
                  <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                    <span>SEAL 1</span> &bull; KREDENSIAL KONEKSI
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Supabase Project URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://your-project-id.supabase.co"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Anon Public API Key
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                        value={anonKey}
                        onChange={(e) => setAnonKey(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <button
                      onClick={handleSaveAndTest}
                      disabled={testStatus === "testing"}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer"
                    >
                      {testStatus === "testing" ? (
                        <>
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                          MENGUJI KONEKSI...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          SIMPAN & TEST KONEKSI
                        </>
                      )}
                    </button>

                    {testStatus === "success" && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <Check className="w-4 h-4" />
                        Terhubung dengan sukses ke Supabase API!
                      </div>
                    )}

                    {testStatus === "error" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs space-y-2 leading-relaxed">
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                      <Info className="w-4 h-4 text-slate-400" />
                      Cara Menemukan Kunci:
                    </div>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Buka Dashboard <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline inline-flex items-center gap-0.5">Supabase<ExternalLink className="w-3 h-3" /></a></li>
                      <li>Pilih Proyek Anda &bull; Navigasi ke <strong>Project Settings &gt; API</strong></li>
                      <li>Salin <strong>Project URL</strong> dan <strong>anon secret public key</strong> Anda.</li>
                    </ol>
                  </div>
                </div>

                {/* Right Panel: SQL Migration Script Copier */}
                <div className="lg:col-span-7 space-y-4 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                      <span>SEAL 2</span> &bull; SQL SCHEMA MIGRATION
                    </h4>
                    <button
                      onClick={handleCopySchema}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          TERSALIN!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          SALIN SCRIPT SQL
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col min-h-[250px] bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden font-mono text-[10px] text-slate-300">
                    <div className="absolute top-2 right-2 text-[9px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 tracking-wider">
                      PostgreSQL
                    </div>
                    <div className="overflow-auto max-h-[280px] h-full whitespace-pre select-all pr-4 scrollbar-thin leading-relaxed">
                      {SUPABASE_SQL_SCHEMA}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl">
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                      <PlaySquare className="w-4 h-4 text-emerald-500" />
                      Langkah Eksekusi Migrasi:
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Supabase membutuhkan tabel-tabel relational untuk menyimpan iuran, warga, keuangan, surat pengantar, dll. Cukup klik tombol <strong>"SALIN SCRIPT SQL"</strong> di atas, masuk ke dashboard Supabase Anda, cari menu <strong>SQL Editor</strong>, ketuk <strong>"New Query"</strong>, paste kode tersebut, dan tekan tombol <strong>RUN</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between rounded-b-3xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Status Engine Terpilih: </span>
                <span className={`font-black uppercase ${activeEngine === "supabase" ? "text-emerald-600" : "text-amber-600"}`}>
                  {activeEngine}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 transform active:scale-95 cursor-pointer"
              >
                TUTUP
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
