import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, FileText, ChevronDown, Check, X, FileDown, FileCheck, 
  Share2, Volume2, VolumeX, Send, RefreshCw, CheckCircle, Mail,
  Bot, Award, Settings, Printer, Volume, ExternalLink
} from "lucide-react";

interface AIDocumentSuiteMenuProps {
  report: string;
  isSpeaking: boolean;
  onToggleSpeak: () => void;
  onPrintPDF: (format: "official" | "executive") => void;
  onExportText: () => void;
  onShareWhatsApp: () => void;
  onShareTelegram: () => void;
  onDispatchEmail: () => void;
  isEmailSending: boolean;
  emailSentSuccess: boolean;
  showNotification: (text: string, type: "success" | "error" | "info") => void;
  // Shared state props from parent
  suitePaperSize: "a4" | "letter";
  setSuitePaperSize: (size: "a4" | "letter") => void;
  suiteIncludeStamp: boolean;
  setSuiteIncludeStamp: (include: boolean) => void;
  shareFormat: "full" | "highlights";
  setShareFormat: (format: "full" | "highlights") => void;
}

export function AIDocumentSuiteMenu({
  report,
  isSpeaking,
  onToggleSpeak,
  onPrintPDF,
  onExportText,
  onShareWhatsApp,
  onShareTelegram,
  onDispatchEmail,
  isEmailSending,
  emailSentSuccess,
  showNotification,
  suitePaperSize,
  setSuitePaperSize,
  suiteIncludeStamp,
  setSuiteIncludeStamp,
  shareFormat,
  setShareFormat,
}: AIDocumentSuiteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "voice" | "share">("document");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopyHighlights = () => {
    try {
      if (!report) return;
      const highlights = report
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
        .slice(0, 5)
        .join('\n');
      
      const finalHighlight = highlights || report.substring(0, 400) + "...";
      navigator.clipboard.writeText(finalHighlight);
      showNotification?.("Intisari & Poin Penting Laporan berhasil disalin ke clipboard!", "success");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyFullText = () => {
    try {
      if (!report) return;
      navigator.clipboard.writeText(report);
      showNotification?.("Teks laporan lengkap berhasil disalin ke clipboard!", "success");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const menuContent = (
    <div className="flex flex-col h-full text-slate-100">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h4 className="text-[11px] font-black tracking-widest text-[#a0b3ff] uppercase font-elegant">
              SmaRtRw AI Suite
            </h4>
            <p className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
              Kelola dokumen, diseminasi, dan asisten audio Chaty.
            </p>
          </div>
        </div>
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-900 border border-indigo-500/10 text-indigo-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SEGMENTED TAB SELECTOR */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-indigo-500/10 mb-4 text-[9px] font-black uppercase tracking-widest">
        <button
          onClick={() => setActiveTab("document")}
          className={`py-2 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
            activeTab === "document" 
              ? "bg-gradient-to-r from-indigo-600/90 to-blue-600/90 text-white shadow-md shadow-indigo-500/10" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dokumen</span>
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`py-2 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
            activeTab === "voice" 
              ? "bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 text-white shadow-md shadow-fuchsia-500/10" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Suara AI</span>
        </button>
        <button
          onClick={() => setActiveTab("share")}
          className={`py-2 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
            activeTab === "share" 
              ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-md shadow-emerald-500/10" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan</span>
        </button>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-indigo">
        <AnimatePresence mode="wait">
          {activeTab === "document" && (
            <motion.div
              key="tab-document"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Controls */}
              <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-indigo-500/15 space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-indigo-400" />
                    Ukuran Dokumen:
                  </span>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-indigo-500/20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSuitePaperSize("a4"); }}
                      className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${suitePaperSize === "a4" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-indigo-200/50 hover:text-indigo-200"}`}
                    >
                      A4
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSuitePaperSize("letter"); }}
                      className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${suitePaperSize === "letter" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-indigo-200/50 hover:text-indigo-200"}`}
                    >
                      Letter
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    Segel Digital Wilayah:
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSuiteIncludeStamp(!suiteIncludeStamp); }}
                    className={`h-5.5 w-10.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${suiteIncludeStamp ? "bg-emerald-500" : "bg-slate-950 border border-indigo-500/25"}`}
                  >
                    <div className={`h-4.5 w-4.5 rounded-full bg-white transition-all duration-200 transform ${suiteIncludeStamp ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => { setIsOpen(false); onPrintPDF("official"); }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-indigo-950/30 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 text-[#a0b3ff] transition-all shrink-0">
                    <FileDown className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      Format Resmi RW ({suitePaperSize.toUpperCase()})
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Kop formal wilayah, penomoran halaman, & stempel validasi.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setIsOpen(false); onPrintPDF("executive"); }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/20 border border-indigo-500/10 hover:border-emerald-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 transition-all shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      Format Eksekutif Navy
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Estetika modern korporat formal dengan block bar warna malam.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setIsOpen(false); onExportText(); }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-cyan-950/20 border border-indigo-500/10 hover:border-cyan-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 transition-all shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      Salinan Arsip Teks (TXT)
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Unduh transkrip laporan lengkap ke fomat .txt secara offline.
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleCopyFullText}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-pink-950/20 border border-indigo-500/10 hover:border-pink-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 text-pink-400 transition-all shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      Salin Lengkap ke Papan Klip
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Salin teks mentah penuh untuk ditempel bebas di sosial media warga.
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "voice" && (
            <motion.div
              key="tab-voice"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Reader status card */}
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-fuchsia-500/15 flex items-center justify-between">
                <div>
                  <span className="text-[8px] bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Chaty Voice Engine V2.0
                  </span>
                  <div className="text-white text-[11px] font-black mt-1 uppercase tracking-wider">
                    {isSpeaking ? "🔊 SEDANG MEMBACA..." : "💤 MODUL AUDIO SIAP"}
                  </div>
                </div>

                {isSpeaking ? (
                  <div className="flex gap-1 items-end h-5">
                    <span className="w-1 bg-fuchsia-400 animate-bounce h-3" style={{ animationDelay: '50ms' }} />
                    <span className="w-1 bg-fuchsia-400 animate-bounce h-5" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-fuchsia-400 animate-bounce h-2.5" style={{ animationDelay: '250ms' }} />
                    <span className="w-1 bg-fuchsia-400 animate-bounce h-4" style={{ animationDelay: '350ms' }} />
                  </div>
                ) : (
                  <Volume className="w-5 h-5 text-fuchsia-400/40" />
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { setIsOpen(false); onToggleSpeak(); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                    isSpeaking 
                      ? "bg-red-500/10 border-red-500/40 hover:bg-red-500/20 text-red-100" 
                      : "bg-slate-900 hover:bg-fuchsia-950/20 border-indigo-500/10 hover:border-fuchsia-500/30"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all shrink-0 ${
                    isSpeaking 
                      ? "bg-red-500/20 text-red-400 group-hover:bg-red-500/30" 
                      : "bg-fuchsia-500/10 text-fuchsia-400 group-hover:bg-fuchsia-500/20"
                  }`}>
                    {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      {isSpeaking ? "HENTIKAN SUARA ASISTEN" : "DENGARKAN NARASI BULANAN"}
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Konversi intisari laporan bulanan wilayah menjadi audio asisten Chaty yang merdu & luwes.
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleCopyHighlights}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-purple-950/20 border border-indigo-500/10 hover:border-purple-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 transition-all shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      SALIN INTI POIN PENTING (ABSTRACT)
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Ambil 5 butir ringkasan pokok keputusan strategis wilayah secara instan untuk draf surat.
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "share" && (
            <motion.div
              key="tab-share"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Density Options */}
              <div className="bg-slate-900/60 rounded-2xl p-3 border border-emerald-500/15 space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-[#5eead4] uppercase tracking-wider">Kerapatan Teks:</span>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-emerald-500/20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareFormat("full"); }}
                      className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${shareFormat === "full" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-emerald-200/50 hover:text-emerald-200"}`}
                    >
                      Lengkap
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareFormat("highlights"); }}
                      className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${shareFormat === "highlights" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-emerald-200/50 hover:text-emerald-200"}`}
                    >
                      Intisari
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] font-mono text-emerald-300 border-t border-emerald-500/10 pt-2">
                  <span className="text-emerald-200/40 uppercase tracking-widest">PAYLOAD SIZE:</span>
                  <span>
                    {report ? (shareFormat === "full" ? `${report.length} karakter` : "~450 karakter") : "Sedang memuat..."}
                  </span>
                </div>
              </div>

              {/* Share actions list */}
              <div className="space-y-2">
                <button
                  onClick={() => { setIsOpen(false); onShareWhatsApp(); }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-[#25D366]/10 border border-indigo-500/10 hover:border-[#25D366]/40 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2.5 rounded-lg bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366]/20 transition-all shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3.15 5.319.151 5.4 0 9.79-4.394 9.793-9.799.002-2.618-1.017-5.08-2.87-6.934C17.035 4.718 14.57 3.7 11.992 3.7c-5.399 0-9.79 4.39-9.794 9.795-.002 1.838.48 3.633 1.395 5.215l-.915 3.342 3.423-.898h-.054zM16.4 13.911c-.241-.12-.1.014-1.424-.775-.12-.072-.208-.108-.289.012-.08.12-.313.385-.385.469-.072.084-.144.096-.385-.024-.241-.12-.1-.014-2.887-1.432-.693-.618-1.161-1.382-1.297-1.622-.136-.24-.015-.37.106-.49.109-.108.241-.282.361-.421.12-.139.16-.24.241-.4.08-.163.04-.302-.02-.421-.06-.12-.289-.415-.494-.903-.131-.314-.27-.272-.383-.272-.081-.004-.174-.006-.272-.006-.29 0-.763.109-1.161.547-.398.437-1.517 1.482-1.517 3.612 0 2.13 1.549 4.19 1.765 4.49.217.3 3.05 4.654 7.39 6.533 1.033.447 1.84.714 2.468.913 1.037.33 1.982.284 2.727.173.831-.124 1.517-.506 1.733-.993.217-.487.217-.905.151-1.011-.067-.107-.241-.19-.482-.31z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">WhatsApp Pengurus</div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Kirim pesan langsung ke grup kepengurusan wilayah via WhatsApp Web.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setIsOpen(false); onShareTelegram(); }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-[#0088cc]/10 border border-indigo-500/10 hover:border-[#0088cc]/30 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2.5 rounded-lg bg-[#0088cc]/10 text-[#0088cc] group-hover:bg-[#0088cc]/20 transition-all shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">Telegram Wilayah</div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Diseminasi rilis cepat langsung ke kanal info warga di Telegram.
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onDispatchEmail(); }}
                  disabled={isEmailSending}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                    emailSentSuccess 
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-100' 
                      : 'bg-slate-900 hover:bg-indigo-950/20 border-indigo-500/10 hover:border-indigo-500/30'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg transition-all shrink-0 ${
                    emailSentSuccess 
                      ? 'bg-emerald-500/15 text-emerald-400' 
                      : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'
                  }`}>
                    {isEmailSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : emailSentSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider">
                      {emailSentSuccess ? "NEWSLETTER TERKIRIM!" : "DISPATCH NEWSLETTER WARGA"}
                    </div>
                    <div className="text-[9px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                      Sebarkan buletin digital bulanan ke seluruh alamat email warga yang terdaftar.
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block text-left">
      {/* TRIGGER BUTTON */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:from-indigo-500 hover:to-indigo-700 transition-all duration-300 shadow-xl shadow-indigo-900/40 cursor-pointer border border-indigo-500/30 overflow-hidden relative group active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
        <span>Menu Hub AI</span>
        <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse tracking-widest shrink-0">
          PRO ACTIVE
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-indigo-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile ? (
              // Mobile View: Perfect Centered Premium Full Modal with Blurred Atmospheric Backdrop
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                  onClick={() => setIsOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-[340px] bg-slate-950 border border-indigo-500/30 rounded-[2.5rem] shadow-2xl p-6 flex flex-col gap-4 z-50 overflow-hidden"
                  style={{ backgroundImage: "radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 70%)" }}
                >
                  {menuContent}
                </motion.div>
              </div>
            ) : (
              // Desktop View: Contextual Overlay Dropdown
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 bottom-full mb-3 w-[360px] bg-slate-950/95 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-5 shadow-2xl z-50 text-left overflow-hidden"
                  style={{ backgroundImage: "radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 70%)" }}
                >
                  {menuContent}
                </motion.div>
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
