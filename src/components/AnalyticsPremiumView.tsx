import React, { useState, useRef, useMemo } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  X,
  QrCode,
  CheckCircle,
  FileCheck,
  Bot,
  TrendingUp,
  Volume2,
  VolumeX,
  FileDown,
  Sparkles,
  Send,
  Mail,
  Share2,
  MessageSquare,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { generateAIReport, textToSpeech } from "../services/aiService";
import UpgradeModal from "./UpgradeModal";

export function RegistrationQRModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
}: {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
}) {
  const regUrl = `${window.location.origin}?reg=${tenantId}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">
              QR Self-Registration
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
              Tunjukkan QR Code ini kepada tamu atau warga baru. Mereka cukup
              scan untuk mengisi formulir pendaftaran secara mandiri.
            </p>

            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 flex items-center justify-center mb-8 mx-auto w-fit">
              <QRCodeSVG
                value={regUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl mb-8 flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Target Tenant
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                {tenantName} ({tenantId})
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(regUrl);
                  alert("Link pendaftaran berhasil disalin!");
                }}
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Salin Link
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                Cetak QR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AnalyticsPremiumView({
  tenantId,
  kasData,
  wargaData,
  iuranData,
  kelahiranData = [],
  kematianData = [],
  suratData = [],
  complaintData = [],
  organizationName = "RW DIGITAL",
  showNotification,
}: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState("");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showDocumentSuite, setShowDocumentSuite] = useState(false);
  const [suitePaperSize, setSuitePaperSize] = useState<"a4" | "letter">("a4");
  const [suiteIncludeStamp, setSuiteIncludeStamp] = useState(true);
  const [shareFormat, setShareFormat] = useState<"full" | "highlights">("full");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleShareWhatsApp = () => {
    if (!report) return;
    let shareText = report;
    if (shareFormat === "highlights") {
      const highlights = report
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
        .slice(0, 5)
        .join('\n');
      shareText = highlights || report.substring(0, 400) + "...";
    }

    let truncatedReport = shareText;
    if (shareText.length > 1500) {
      truncatedReport = shareText.substring(0, 1500) + "... (baca selengkapnya di sistem SmaRtRw AI)";
    }
    const text = `📢 *LAPORAN BULANAN (AI FEATURE)*\nRW: *${organizationName}*\nAsisten AI: *Chaty*\n\nBerikut adalah rangkuman analisis bulanan:\n\n${truncatedReport}\n\n---\n_Laporan dikirim otomatis via SmaRtRw AI Hub_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShowShareMenu(false);
  };

  const handleShareTelegram = () => {
    if (!report) return;
    let shareText = report;
    if (shareFormat === "highlights") {
      const highlights = report
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
        .slice(0, 5)
        .join('\n');
      shareText = highlights || report.substring(0, 400) + "...";
    }

    let truncatedReport = shareText;
    if (shareText.length > 1500) {
      truncatedReport = shareText.substring(0, 1500) + "...";
    }
    const text = `📢 *LAPORAN BULANAN (AI FEATURE)*\nRW: *${organizationName}*\n\n${truncatedReport}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent("https://smartrw.ai")}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShowShareMenu(false);
  };

  const handleDispatchEmail = () => {
    if (!report) return;
    setIsEmailSending(true);
    setEmailSentSuccess(false);
    setTimeout(() => {
      setIsEmailSending(false);
      setEmailSentSuccess(true);
      showNotification?.("Laporan berhasil disebarkan melalui Newsletter pengurus & warga!", "success");
      setTimeout(() => {
        setEmailSentSuccess(false);
      }, 3500);
    }, 2000);
  };

  const handleCopyClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    showNotification?.("Seluruh teks laporan berhasil disalin ke clipboard!", "success");
    setShowShareMenu(false);
  };

  const handlePrintPDF = (format: "official" | "executive") => {
    try {
      const isLetter = suitePaperSize === "letter";
      const doc = new jsPDF('p', 'mm', isLetter ? 'letter' : 'a4');
      const pageWidth = isLetter ? 215.9 : 210;
      const pageHeight = isLetter ? 279.4 : 297;
      const margin = format === "executive" ? 18 : 15;
      const contentWidth = pageWidth - (margin * 2);

      if (format === "executive") {
        // Draw Navy background header block
        doc.setFillColor(15, 23, 42); // slate-900 / navy
        doc.rect(0, 0, pageWidth, 42, "F");

        // Premium typography in white/gold for executive
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        const titleText = (organizationName || "SmaRtRw AI").toUpperCase();
        doc.text(titleText, margin, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(165, 180, 252); // light indigo
        doc.text("LAPORAN BULANAN EKSEKUTIF - SMART ELEKTORAL & ADMINISTRASI", margin, 24);

        // Subtitle details
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(`ID Wilayah: ${tenantId || '-'}  |  Sistem Intelijen Laporan Chaty`, margin, 32);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, margin, 36);

        // Top accent line in positive purple/teal accent
        doc.setDrawColor(160, 179, 255);
        doc.setLineWidth(1);
        doc.line(margin, 42, pageWidth - margin, 42);
      } else {
        // Setup Header Font properties for Official / Classic
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        
        // Draw Title / Organization
        const titleText = (organizationName || "SmaRtRw AI").toUpperCase();
        doc.text(titleText, margin, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("Sistem Pengelolaan Lingkungan RT/RW Pintar Terintegrasi", margin, 25);
        
        // Draw line divider below header
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, 28, pageWidth - margin, 28);
        
        // Report Document Type title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text("LAPORAN BULANAN OTOMATIS (AI FEATURE)", margin, 38);
        
        // Date and metadata info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tenant ID: ${tenantId || '-'}`, margin, 44);
        doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, margin, 49);
        
        // Line divisor for body beginning
        doc.line(margin, 52, pageWidth - margin, 52);
      }
      
      // Split the dynamic report body text by width constraint
      doc.setFont("helvetica", "normal");
      doc.setFontSize(format === "executive" ? 9.5 : 10);
      doc.setTextColor(format === "executive" ? 30 : 51, format === "executive" ? 41 : 65, format === "executive" ? 59 : 85);
      
      const splitLines = doc.splitTextToSize(report, contentWidth);
      
      let currentY = format === "executive" ? 54 : 59;
      const lineHeight = format === "executive" ? 5.8 : 6.2;
      
      splitLines.forEach((line: string) => {
        // Check page boundary
        if (currentY + lineHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin + 12;
          
          if (format === "executive") {
            // Executive secondary page header
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(99, 102, 241); // Indigo
            doc.text(`SmaRtRw AI - Laporan Eksekutif Bulanan (Halaman ${doc.getNumberOfPages()})`, margin, margin);
            doc.setDrawColor(224, 231, 255);
            doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
          } else {
            // Secondary page header
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Laporan Bulanan RT/RW - Halaman ${doc.getNumberOfPages()}`, margin, margin);
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
          }
          
          currentY += 8;
          
          // Restore content fonts
          doc.setFont("helvetica", "normal");
          doc.setFontSize(format === "executive" ? 9.5 : 10);
          doc.setTextColor(format === "executive" ? 30 : 51, format === "executive" ? 41 : 65, format === "executive" ? 59 : 85);
        }
        
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
      
      // Page numbering
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
      }

      // Legal authentication stamp
      if (suiteIncludeStamp) {
        doc.setPage(totalPages);
        const stampX = pageWidth - margin - 45;
        const stampY = Math.min(currentY + 12, pageHeight - 38);
        doc.setDrawColor(79, 70, 229); // Indigo brand
        doc.setLineWidth(0.6);
        doc.circle(stampX + 20, stampY + 12, 10);
        doc.circle(stampX + 20, stampY + 12, 8.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(79, 70, 229);
        doc.text("SMARTRW AI ASSISTANT", stampX + 11.5, stampY + 10.5);
        doc.text("VERIFIED LEGAL SEAL", stampX + 12, stampY + 13.5);
        doc.setFontSize(4);
        doc.setFont("helvetica", "normal");
        doc.text(`ID: ${(tenantId || "SRW-SEC").substring(0, 10).toUpperCase()}`, stampX + 12.5, stampY + 16.5);
      }
      
      showNotification?.("Sedang memproses & mengunduh PDF Laporan Bulanan AI...", "info");
      doc.save(`Laporan_${format === "executive" ? "Eksekutif" : "Bulanan"}_AI_${tenantId}.pdf`);
      showNotification?.("Laporan Bulanan AI berhasil disimpan sebagai PDF!", "success");
    } catch (err) {
      console.error("Gagal mencetak PDF:", err);
      showNotification?.("Gagal mengunduh dokumen PDF.", "error");
    }
  };

  const handleExportText = () => {
    try {
      if (!report) return;
      const element = document.createElement("a");
      const file = new Blob([report], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Laporan_Bulanan_AI_${tenantId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showNotification?.("Laporan berhasil diunduh sebagai teks mentah!", "success");
    } catch (err) {
      console.error("Gagal mengekspor teks:", err);
      showNotification?.("Gagal mengunduh berkas teks.", "error");
    }
  };

  const handleToggleSpeak = async () => {
    if (isSpeaking) {
      sourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    if (!report) return;

    try {
      setIsSpeaking(true);
      const response = await textToSpeech(report, true);
      if (!response) return;
      const base64Audio = response.data;

      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const buffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
      const data = buffer.getChannelData(0);
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < data.length; i++) {
        data[i] = view.getInt16(i * 2, true) / 32768;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
      sourceRef.current = source;
    } catch (error) {
      console.error("Speech Error:", error);
      setIsSpeaking(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const dataSummary = {
        financial: kasData.slice(-20),
        warga: wargaData.length,
        iuran: iuranData.slice(-20),
        kesehatan: {
          kelahiranCount: kelahiranData.length,
          kematianCount: kematianData.length,
        },
        kegiatan: {
          suratCount: suratData.length,
          complaintsCount: complaintData.length,
        }
      };

      const aiReportText = await generateAIReport(dataSummary);
      setReport(aiReportText);

      // Save to Firestore
      try {
        const reportId = `report_${new Date().getFullYear()}_${new Date().getMonth() + 1}`;
        await setDoc(doc(db, "monthly_reports", reportId), {
          tenantId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          content: aiReportText,
          createdAt: new Date().toISOString(),
          generatedBy: "AI_SYSTEM",
        });
      } catch (err) {
        console.error("Failed to save report to firestore");
      }
    } catch (e) {
      alert("Gagal membuat laporan AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const data = useMemo(() => {
    // Group financial by month for predictive trend
    const monthlyTotal: Record<string, number> = {};
    kasData.forEach((k: any) => {
      const month = k.tanggal.split(" ")[1] || "Jan";
      monthlyTotal[month] = (monthlyTotal[month] || 0) + (k.debit || 0);
    });
    return Object.entries(monthlyTotal)
      .map(([name, val]) => ({
        name,
        actual: val,
        prediction: val * 1.05 + 500000,
      }))
      .slice(-6);
  }, [kasData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
          ANALYTICS PREDIKTIF AI
        </h2>
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              "Sedang Menyusun..."
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                Generate Laporan Bulanan
              </>
            )}
          </button>
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 flex items-center gap-2 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
          >
            <Bot className="w-4 h-4" />
            🚀 AI Premium
          </button>
        </div>
      </div>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative"
        >
          <button
            onClick={() => setReport("")}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <Bot className="w-6 h-6" />
            LAPORAN BULANAN OTOMATIS (AI)
          </h3>
          <div id="report-content" className="bg-indigo-950/50 p-8 rounded-3xl border border-indigo-800 mb-6 group relative overflow-hidden">
            {/* Header / KOP Dokumen */}
            <div className="flex items-center justify-between border-b border-indigo-800 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileDown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    LAPORAN RINGKASAN & ANALISIS (PDF FORMAT)
                  </h4>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
                    Organisasi: <span className="text-white">{organizationName}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Waktu Generate
                </p>
                <p className="text-xs font-black text-white uppercase">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-indigo-50 leading-relaxed text-sm">
              {report}
            </pre>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowPrintMenu(!showPrintMenu)}
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)' }}
                className="px-4 py-2 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:opacity-95 transition-all duration-300 shadow-xl shadow-indigo-500/20 cursor-pointer active:scale-95 relative overflow-hidden group"
              >
                {/* Shimmer element */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
                <span className="hidden sm:inline">AI Document Suite</span>
                <span className="hidden sm:inline bg-white/20 text-[9px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse">PRO</span>
              </button>

              <AnimatePresence>
                {showPrintMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowPrintMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 bottom-full mb-3 w-80 bg-slate-950/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-2xl z-45 text-left"
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[10px] font-black tracking-widest text-[#a0b3ff] uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                            AI DOCUMENT SUITE
                          </h4>
                          <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            SYSTEM READY
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-200/60 leading-normal font-sans normal-case tracking-normal">
                          Pilih gaya cetak profesional formal atau eksekutif bersertifikasi stempel digital wilayah.
                        </p>
                      </div>

                      {/* INTERACTIVE CONTROLS */}
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-indigo-500/10 space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-200/70 uppercase tracking-widest">Kerapatan / Ukuran:</span>
                          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-indigo-500/20">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSuitePaperSize("a4"); }}
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${suitePaperSize === "a4" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-indigo-200/50 hover:text-indigo-200"}`}
                            >
                              A4
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSuitePaperSize("letter"); }}
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${suitePaperSize === "letter" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-indigo-200/50 hover:text-indigo-200"}`}
                            >
                              Letter
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-200/70 uppercase tracking-widest flex items-center gap-1">
                            Segel Digital:
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSuiteIncludeStamp(!suiteIncludeStamp); }}
                            className={`h-5 w-9 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${suiteIncludeStamp ? "bg-emerald-500" : "bg-slate-950 border border-indigo-500/25"}`}
                          >
                            <div className={`h-4 w-4 rounded-full bg-white transition-all duration-200 transform ${suiteIncludeStamp ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* OFFICIAL A4 */}
                        <button
                          onClick={() => {
                            setShowPrintMenu(false);
                            handlePrintPDF("official");
                          }}
                          className="w-full text-left p-3 rounded-xl bg-indigo-950/40 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/25 text-[#a0b3ff] transition-all">
                            <FileDown className="w-4 h-4 animate-pulse" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-wider">
                              Format Resmi RW ({suitePaperSize.toUpperCase()})
                            </div>
                            <div className="text-[10px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                              Sertifikasi kop surat formal, penomoran halaman, & layout klasik.
                            </div>
                          </div>
                        </button>

                        {/* EXECUTIVE NAVY */}
                        <button
                          onClick={() => {
                            setShowPrintMenu(false);
                            handlePrintPDF("executive");
                          }}
                          className="w-full text-left p-3 rounded-xl bg-indigo-950/40 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/25 text-emerald-400 transition-all">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-wider">
                              Format Eksekutif Navy
                            </div>
                            <div className="text-[10px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                              Estetika modern korporat dengan kop block bar gelap & stempel digital.
                            </div>
                          </div>
                        </button>

                        {/* EXPORT TXT */}
                        <button
                          onClick={() => {
                            setShowPrintMenu(false);
                            handleExportText();
                          }}
                          className="w-full text-left p-3 rounded-xl bg-indigo-950/40 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/25 text-cyan-400 transition-all">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-wider">
                              Salinan Arsip Teks (TXT)
                            </div>
                            <div className="text-[10px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                              Salin & simpan catatan data mentah sebagai arsip teks di folder lokal.
                            </div>
                          </div>
                        </button>

                        {/* QUICK CLIPBOARD COPY */}
                        <button
                          onClick={() => {
                            setShowPrintMenu(false);
                            try {
                              if (!report) return;
                              navigator.clipboard.writeText(report);
                              showNotification?.("Teks laporan lengkap berhasil disalin ke clipboard!", "success");
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full text-left p-3 rounded-xl bg-indigo-950/40 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/25 text-pink-400 transition-all">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-wider">
                              Salin Salinan Lengkap
                            </div>
                            <div className="text-[10px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                              Salin seluruh isi laporan langsung ke clipboard untuk dibagikan.
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* DOCUMENT SUITE MENU (REPLACES OLD SPEAK BUTTON) */}
            <div className="relative">
              <button 
                onClick={() => setShowDocumentSuite(!showDocumentSuite)}
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}
                className="px-4 py-2 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:opacity-95 transition-all duration-300 shadow-xl shadow-indigo-500/15 cursor-pointer active:scale-95"
              >
                <Bot className="w-4 h-4 animate-bounce" />
                <span className="hidden sm:inline">Dokumen & Suara AI</span>
                {isSpeaking && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {showDocumentSuite && (
                  <>
                    <div 
                      className="fixed inset-0 z-25" 
                      onClick={() => setShowDocumentSuite(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 bottom-full mb-3 w-80 bg-slate-950/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-2xl z-30 text-left"
                    >
                      <div className="mb-4">
                        <h4 className="text-[10px] font-black tracking-widest text-[#a0b3ff] uppercase mb-1 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Document Suite Chaty
                        </h4>
                        <p className="text-[11px] text-indigo-200/60 leading-normal font-sans normal-case tracking-normal">
                          Dengarkan narasi suara AI atau salin intisari penting laporan bulanan dengan asisten pintar Chaty.
                        </p>
                      </div>

                      {/* STATS SEGMENT */}
                      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-indigo-500/10 text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-indigo-200/40 normal-case font-sans">Panjang Laporan</span>
                          <span className="text-white font-mono mt-0.5">
                            {report ? report.split(/\s+/).filter(Boolean).length : 0} kata
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-indigo-200/40 normal-case font-sans">Waktu Membaca</span>
                          <span className="text-white font-mono mt-0.5">
                            ~{Math.ceil((report ? report.split(/\s+/).filter(Boolean).length : 0) / 180) || 1} Mnt
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* TOGGLE SPEAK / AUDIO ASISTEN */}
                        <button
                          onClick={() => {
                            setShowDocumentSuite(false);
                            handleToggleSpeak();
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer group border ${isSpeaking ? "bg-red-500/10 border-red-500/40 hover:bg-red-500/20" : "bg-indigo-950/40 hover:bg-slate-900 border-indigo-500/10 hover:border-indigo-500/30"}`}
                        >
                          <div className={`p-2 rounded-lg transition-all ${isSpeaking ? "bg-red-500/20 text-red-400 group-hover:bg-red-500/30" : "bg-indigo-500/10 text-[#a0b3ff] group-hover:bg-indigo-500/20"}`}>
                            {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-[11px] font-black text-white uppercase tracking-wider flex items-center justify-between">
                              <span>{isSpeaking ? "Matikan Pengeras" : "Dengarkan Narator"}</span>
                              {isSpeaking && (
                                <span className="flex gap-0.5 items-end h-3">
                                  <span className="w-0.5 bg-red-400 animate-bounce h-2" style={{ animationDelay: '50ms' }} />
                                  <span className="w-0.5 bg-red-400 animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
                                  <span className="w-0.5 bg-red-400 animate-bounce h-1.5" style={{ animationDelay: '250ms' }} />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                              {isSpeaking ? "Hentikan reproduksi audio asisten suara Chaty." : "Konversi teks laporan menjadi suara asisten Chaty."}
                            </div>
                          </div>
                        </button>

                        {/* COPIED ABSTRACT / SUMMARY */}
                        <button
                          onClick={() => {
                            try {
                              if (!report) return;
                              const highlights = report
                                .split('\n')
                                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
                                .slice(0, 5)
                                .join('\n');
                              
                              const finalHighlight = highlights || report.substring(0, 400) + "...";
                              navigator.clipboard.writeText(finalHighlight);
                              showNotification?.("Intisari & Poin Penting Laporan berhasil disalin!", "success");
                              setShowDocumentSuite(false);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full text-left p-3 rounded-xl bg-indigo-950/40 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 transition-all">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-wider">
                              Salin Poin Penting (Abstract)
                            </div>
                            <div className="text-[10px] text-indigo-200/50 normal-case font-sans tracking-normal mt-0.5">
                              Salin 5 butir ringkasan pokok bulanan secara instan.
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
                      {/* PREMIUM INTERACTIVE DOCUMENT DISTRIBUTION SUITE */}
            <div className="relative">
              <button 
                id="share-distribution-suite-btn"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="px-4 py-2 bg-[#0d1527] hover:bg-[#121c33] text-white border-2 border-emerald-500/30 hover:border-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer relative group overflow-hidden"
              >
                <Share2 className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">Bagi & Distribusi AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowShareMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 bottom-full mb-3 w-80 bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-5 shadow-2xl z-40 text-left"
                    >
                      {/* HEADER */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[10px] font-black tracking-widest text-[#5eead4] uppercase flex items-center gap-1.5">
                            <Share2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                            AI DISTRIBUTION SUITE
                          </h4>
                          <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full font-mono font-black animate-pulse">
                            READY TO DISPATCH
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-200/50 leading-normal font-sans normal-case tracking-normal">
                          Sebarkan ringkasan keputusan daerah ke WhatsApp pengurus, Telegram wilayah, atau buletin warga secara instan.
                        </p>
                      </div>

                      {/* SELECTION CONFIGS */}
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-emerald-500/10 space-y-3 mb-4">
                        {/* Format selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-emerald-200/70 uppercase tracking-widest">Kerapatan Teks:</span>
                          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-emerald-500/20">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShareFormat("full"); }}
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${shareFormat === "full" ? "bg-emerald-600 text-white" : "text-emerald-200/50 hover:text-emerald-200"}`}
                            >
                              Lengkap
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShareFormat("highlights"); }}
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${shareFormat === "highlights" ? "bg-emerald-600 text-white" : "text-emerald-200/50 hover:text-emerald-200"}`}
                            >
                              Intisari
                            </button>
                          </div>
                        </div>

                        {/* Dispatch Metadata */}
                        <div className="flex items-center justify-between border-t border-emerald-500/10 pt-2 text-[9px] font-mono text-emerald-300">
                          <span className="text-emerald-200/40 uppercase tracking-widest normal-case">Perkiraan Payload:</span>
                          <span>
                            {report ? (shareFormat === "full" ? `${report.length} karakter` : "~450 karakter") : "Empty"}
                          </span>
                        </div>
                      </div>

                      {/* DISTRIBUTION ROUTES */}
                      <div className="space-y-2">
                        {/* WhatsApp Custom Dispatch */}
                        <button
                          onClick={handleShareWhatsApp}
                          className="w-full text-left p-2.5 rounded-xl bg-emerald-950/20 hover:bg-[#128c7e]/10 border border-emerald-500/10 hover:border-emerald-500/40 transition-all flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366]/20 transition-all">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3.15 5.319.151 5.4 0 9.79-4.394 9.793-9.799.002-2.618-1.017-5.08-2.87-6.934C17.035 4.718 14.57 3.7 11.992 3.7c-5.399 0-9.79 4.39-9.794 9.795-.002 1.838.48 3.633 1.395 5.215l-.915 3.342 3.423-.898h-.054zM16.4 13.911c-.241-.12-.1.014-1.424-.775-.12-.072-.208-.108-.289.012-.08.12-.313.385-.385.469-.072.084-.144.096-.385-.024-.241-.12-.1-.014-2.887-1.432-.693-.618-1.161-1.382-1.297-1.622-.136-.24-.015-.37.106-.49.109-.108.241-.282.361-.421.12-.139.16-.24.241-.4.08-.163.04-.302-.02-.421-.06-.12-.289-.415-.494-.903-.131-.314-.27-.272-.383-.272-.081-.004-.174-.006-.272-.006-.29 0-.763.109-1.161.547-.398.437-1.517 1.482-1.517 3.612 0 2.13 1.549 4.19 1.765 4.49.217.3 3.05 4.654 7.39 6.533 1.033.447 1.84.714 2.468.913 1.037.33 1.982.284 2.727.173.831-.124 1.517-.506 1.733-.993.217-.487.217-.905.151-1.011-.067-.107-.241-.19-.482-.31z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-wider">Kirim WhatsApp Pengurus</div>
                            <div className="text-[8px] text-emerald-200/40 normal-case font-sans">Kirim ke grup pengurus via WhatsApp web / app</div>
                          </div>
                        </button>

                        {/* Telegram Custom Dispatch */}
                        <button
                          onClick={handleShareTelegram}
                          className="w-full text-left p-2.5 rounded-xl bg-[#0a1e36]/30 hover:bg-[#0088cc]/10 border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-[#0088cc]/10 text-[#0088cc] group-hover:bg-[#0088cc]/20 transition-all">
                            <Send className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-wider">Kirim Telegram Wilayah</div>
                            <div className="text-[8px] text-blue-200/40 normal-case font-sans">Format pesan tebal & kirim ke kanal Telegram</div>
                          </div>
                        </button>

                        {/* Automated Resident Newsletter Dispatch (Email simulation) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDispatchEmail(); }}
                          disabled={isEmailSending}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group ${emailSentSuccess ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-[#0f0e1c] hover:bg-indigo-950/15 border-indigo-500/10 hover:border-indigo-500/20'}`}
                        >
                          <div className={`p-2 rounded-lg transition-all ${emailSentSuccess ? 'bg-emerald-500/15 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'}`}>
                            {isEmailSending ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : emailSentSuccess ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-black text-white uppercase tracking-wider flex items-center justify-between">
                              <span>Buletin Warga</span>
                              {emailSentSuccess && (
                                <span className="text-[7px] font-mono text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded">SENT 128x</span>
                              )}
                            </div>
                            <div className={`text-[8px] normal-case font-sans ${emailSentSuccess ? 'text-emerald-400' : 'text-indigo-200/40'}`}>
                              {isEmailSending ? "Sedang mendistribusikan laporan..." : emailSentSuccess ? "Buletin laporan sukses tersirat ke surat pengurus!" : "Siarkan draf ke seluruh email warga formal"}
                            </div>
                          </div>
                        </button>

                        {/* Local clipboard action */}
                        <button
                          onClick={handleCopyClipboard}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-slate-700 transition-all">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-wider">Salin Clipboard</div>
                            <div className="text-[8px] text-slate-400 normal-case font-sans">Kopi draf laporan mentah lengkap</div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>   </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Prediksi Pendapatan (6 Bulan Ke Depan)
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="prediction"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.05}
                  strokeDasharray="5 5"
                  name="Prediksi AI"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fill="#4f46e5"
                  fillOpacity={0.1}
                  name="Realisasi"
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <Bot className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
            <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-4">
              AI Insight Hari Ini
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-sm font-bold leading-relaxed italic">
                  "Berdasarkan tren 3 bulan terakhir, pembayaran iuran memuncak
                  di minggu ke-2. Kami merekomendasikan pengiriman pengingat di
                  tanggal 5 setiap bulannya untuk efisiensi tertagih +15%."
                </p>
              </div>
              <p className="text-[10px] font-medium opacity-60">
                Insight dihasilkan otomatis pukul 08:00 WIB
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Metrik Efisiensi
            </h4>
            <div className="space-y-4">
              {[
                {
                  label: "Kepatuhan Iuran",
                  val: "92%",
                  change: "+4.5%",
                  color: "emerald",
                },
                {
                  label: "Respon Admin",
                  val: "12m",
                  change: "-5m",
                  color: "blue",
                },
                {
                  label: "Kepuasan Warga",
                  val: "4.8",
                  change: "+0.2",
                  color: "amber",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
                >
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      {stat.val}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}
                  >
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
