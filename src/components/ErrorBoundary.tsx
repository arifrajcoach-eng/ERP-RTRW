import React from "react";
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp, MessageSquare, ShieldAlert, FileText } from "lucide-react";
import { safeLocalStorage, safeSessionStorage } from "../lib/safeStorage";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
    this.setState({ errorInfo });
    
    const isStateCorrupted = 
      error.message?.toLowerCase().includes("null") || 
      error.message?.toLowerCase().includes("undefined") ||
      error.message?.toLowerCase().includes("json") ||
      error.message?.toLowerCase().includes("parse");

    if (isStateCorrupted) {
      console.warn("Potential corrupted local memory detected. Preparing auto-healing checks...");
    }
  }

  private handleResetAndClean = () => {
    try {
      const keysToKeep = [
        "firebase:auth",
        "impersonatedTenantId",
        "currentTenant",
        "parentTenant",
        "firebaseLocalStorageDb"
      ];
      const keys = safeLocalStorage.getKeys();
      
      keys.forEach((key) => {
        if (!keysToKeep.some(k => key.includes(k))) {
          safeLocalStorage.removeItem(key);
        }
      });
      
      safeSessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error("Failed to perform auto-healing clear:", e);
      safeLocalStorage.clear();
      safeSessionStorage.clear();
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev }));
  };

  public render() {
    if (this.state.hasError) {
      const waNumber = "6287726741143";
      const errorMsg = this.state.error?.message || "Unknown Runtime Error";
      const waText = encodeURIComponent(
        `Halo Admin SmartRW AI, aplikasi kami mengalami gangguan tak terduga.\n\n` +
        `ID Tenant / Nama Wilayah: (Masukkan Nama/ID Anda)\n` +
        `Eror Terdeteksi: ${errorMsg}\n\n` +
        `Mohon dibantu pemeriksaan QC.`
      );
      const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

      return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
          <div className="absolute top-10 right-10 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

          <div className="max-w-xl w-full bg-slate-900/40 backdrop-blur-3xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 mb-6 shadow-inner animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight leading-snug">
              Sistem Mengalami Gangguan
            </h2>
            <div className="mt-2 text-amber-400 font-extrabold uppercase text-[10px] tracking-widest pl-3 pr-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 inline-block mb-6">
              Mode Pemulihan Otomatis Aktif
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Terjadi eror tak terduga yang menyebabkan sistem terhenti sementara. Don't worry! Data Anda tetap tersimpan dengan aman di server utama SmartRW AI. Anda dapat memulihkan aplikasi secara mandiri menggunakan langkah di bawah:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
              <button
                onClick={this.handleReload}
                className="px-5 py-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                Segarkan Halaman
              </button>

              <button
                onClick={this.handleResetAndClean}
                className="px-5 py-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                title="Menghapus file cache memory lokal yang kemungkinan rusak lalu memuat ulang halaman secara aman."
              >
                <AlertOctagon className="w-4 h-4" />
                Auto-Heal & Reset
              </button>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-4 px-6 py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 shadow-md shadow-sky-600/10"
            >
              <MessageSquare className="w-4 h-4" />
              Lapor Gangguan Melalui WA Admin
            </a>

            <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl text-left overflow-hidden">
              <button
                onClick={this.toggleDetails}
                className="w-full px-5 py-3 flex items-center justify-between text-xs text-slate-400 font-extrabold uppercase tracking-widest hover:bg-slate-900/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Detail Diagnostik Eror
                </span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {this.state.showDetails && (
                <div className="px-5 pb-5 border-t border-slate-800/60 pt-4 font-mono text-[11px] text-slate-400 overflow-y-auto max-h-40 space-y-2 select-all">
                  <p className="text-red-400 font-bold font-sans">
                    Exception: {errorMsg}
                  </p>
                  {this.state.error && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-slate-500 whitespace-pre-wrap leading-relaxed">
                      {this.state.error.stack || "Stack trace not available."}
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="text-[10px] text-slate-650 italic">
                      Component stack: {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
