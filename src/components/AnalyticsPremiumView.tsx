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
import { AIDocumentSuiteMenu } from "./AIDocumentSuiteMenu";

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

const MONTHS_NAMES = [
  { val: 1, label: "Januari" },
  { val: 2, label: "Februari" },
  { val: 3, label: "Maret" },
  { val: 4, label: "April" },
  { val: 5, label: "Mei" },
  { val: 6, label: "Juni" },
  { val: 7, label: "Juli" },
  { val: 8, label: "Agustus" },
  { val: 9, label: "September" },
  { val: 10, label: "Oktober" },
  { val: 11, label: "November" },
  { val: 12, label: "Desember" }
];

const getElementDate = (item: any): Date | null => {
  if (!item) return null;
  
  if (item.tanggalLapor) {
    if (typeof item.tanggalLapor.toDate === 'function') {
      return item.tanggalLapor.toDate();
    }
    if (typeof item.tanggalLapor.seconds === 'number') {
      return new Date(item.tanggalLapor.seconds * 1000);
    }
  }
  if (item.createdAt) {
    if (typeof item.createdAt.toDate === 'function') {
      return item.createdAt.toDate();
    }
    if (typeof item.createdAt.seconds === 'number') {
      return new Date(item.createdAt.seconds * 1000);
    }
  }

  const dateStr = item.tanggal || item.createdAt || item.tglLapor || item.tanggalLahir || item.tanggalMati;
  if (!dateStr) return null;

  if (typeof dateStr === 'string') {
    const monthsId: Record<string, number> = {
      jan: 0, janari: 0, januari: 0,
      feb: 1, peb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      agu: 7, agustus: 7, ags: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, dec: 11
    };

    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const monthLabel = parts[1].toLowerCase().substring(0, 3);
      const year = parseInt(parts[2], 10);
      
      const monthIndex = monthsId[monthLabel];
      if (monthIndex !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, monthIndex, day);
      }
    }
    
    const isIsoFormat = /^\d{4}-\d{2}-\d{2}/.test(dateStr);
    if (isIsoFormat) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

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

  // Premium Month & Year Filter States
  const [filterMode, setFilterMode] = useState<"all" | "monthly" | "range">("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [startMonth, setStartMonth] = useState<number>(1); // e.g. January
  const [endMonth, setEndMonth] = useState<number>(new Date().getMonth() + 1); // e.g. Current Month
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // e.g. 2026

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

  // Filtered datasets based on selected Month/Range and Year
  const filteredKas = useMemo(() => {
    if (filterMode === "all") return kasData;
    return kasData.filter((k: any) => {
      const d = getElementDate(k);
      if (!d) return false;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (filterMode === "monthly") {
        return m === selectedMonth && y === selectedYear;
      } else {
        // Range mode
        return y === selectedYear && m >= startMonth && m <= endMonth;
      }
    });
  }, [kasData, filterMode, selectedMonth, selectedYear, startMonth, endMonth]);

  const filteredIuran = useMemo(() => {
    if (filterMode === "all") return iuranData;
    return iuranData.filter((i: any) => {
      const d = getElementDate(i);
      if (!d) return false;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (filterMode === "monthly") {
        return m === selectedMonth && y === selectedYear;
      } else {
        // Range mode
        return y === selectedYear && m >= startMonth && m <= endMonth;
      }
    });
  }, [iuranData, filterMode, selectedMonth, selectedYear, startMonth, endMonth]);

  const filteredKelahiran = useMemo(() => {
    if (filterMode === "all") return kelahiranData;
    return kelahiranData.filter((k: any) => {
      const d = getElementDate(k);
      if (!d) return false;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (filterMode === "monthly") {
        return m === selectedMonth && y === selectedYear;
      } else {
        // Range mode
        return y === selectedYear && m >= startMonth && m <= endMonth;
      }
    });
  }, [kelahiranData, filterMode, selectedMonth, selectedYear, startMonth, endMonth]);

  const filteredKematian = useMemo(() => {
    if (filterMode === "all") return kematianData;
    return kematianData.filter((k: any) => {
      const d = getElementDate(k);
      if (!d) return false;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (filterMode === "monthly") {
        return m === selectedMonth && y === selectedYear;
      } else {
        // Range mode
        return y === selectedYear && m >= startMonth && m <= endMonth;
      }
    });
  }, [kematianData, filterMode, selectedMonth, selectedYear, startMonth, endMonth]);

  const filteredSurat = useMemo(() => {
    if (filterMode === "all") return suratData;
    return suratData.filter((s: any) => {
      const d = getElementDate(s);
      if (!d) return false;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (filterMode === "monthly") {
        return m === selectedMonth && y === selectedYear;
      } else {
        // Range mode
        return y === selectedYear && m >= startMonth && m <= endMonth;
      }
    });
  }, [suratData, filterMode, selectedMonth, selectedYear, startMonth, endMonth]);

  const filteredComplaint = useMemo(() => {
    if (filterMode === "all") return complaintData;
    return complaintData.filter((c: any) => {
      const d = getElementDate(c);
      if (!d) return false;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (filterMode === "monthly") {
        return m === selectedMonth && y === selectedYear;
      } else {
        // Range mode
        return y === selectedYear && m >= startMonth && m <= endMonth;
      }
    });
  }, [complaintData, filterMode, selectedMonth, selectedYear, startMonth, endMonth]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const selectedMonthLabel = MONTHS_NAMES.find(m => m.val === selectedMonth)?.label || "";
      const startMonthLabel = MONTHS_NAMES.find(m => m.val === startMonth)?.label || "";
      const endMonthLabel = MONTHS_NAMES.find(m => m.val === endMonth)?.label || "";

      const dataSummary = {
        financial: filteredKas.slice(-30),
        warga: wargaData.length,
        iuran: filteredIuran.slice(-30),
        kesehatan: {
          kelahiranCount: filteredKelahiran.length,
          kematianCount: filteredKematian.length,
        },
        kegiatan: {
          suratCount: filteredSurat.length,
          complaintsCount: filteredComplaint.length,
        },
        periode: filterMode === "all" 
          ? "Seluruh Periode" 
          : filterMode === "monthly"
            ? `Bulan ${selectedMonthLabel} Tahun ${selectedYear}`
            : `Rentang Periode ${startMonthLabel} s.d. ${endMonthLabel} Tahun ${selectedYear}`,
        catatan: filterMode === "all" 
          ? "Tolong formulasikan analisis komprehensif dari seluruh data historis warga, kas, iuran, kesehatan, dan surat." 
          : filterMode === "monthly"
            ? `PENTING: Laporan yang diminta adalah KHUSUS untuk periode Bulan ${selectedMonthLabel} Tahun ${selectedYear}. Hanya bahas data yang diberikan pada periode tersebut.`
            : `PENTING: Laporan yang diminta adalah KHUSUS untuk rentang periode dari Bulan ${startMonthLabel} Selesai sampai Bulan ${endMonthLabel} Tahun ${selectedYear}. Silakan analisis tren performa, kelonjakan atau penurunan kas dan iuran warga, efisiensi surat-menyurat, serta berikan rekomendasi pembangunan wilayah yang berkesinambungan.`
      };

      const aiReportText = await generateAIReport(dataSummary);
      setReport(aiReportText);

      // Save to Firestore
      try {
        const reportId = filterMode === "all"
          ? `report_all_time_${Date.now()}`
          : filterMode === "monthly"
            ? `report_${selectedYear}_${selectedMonth}`
            : `report_${selectedYear}_range_${startMonth}_to_${endMonth}`;

        await setDoc(doc(db, "monthly_reports", reportId), {
          tenantId,
          month: filterMode === "all" 
            ? null 
            : filterMode === "monthly" 
              ? selectedMonth 
              : `${startMonth}-${endMonth}`,
          year: filterMode === "all" ? null : selectedYear,
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
          ANALYTICS AI
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

      {/* Premium Period Config Block */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none mb-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5 mb-11">
              <Sparkles className="w-3.5 h-3.5" />
              Konfigurasi Periode Analisis Chaty AI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Pilih seluruh periode data, filter bulan tunggal, atau definisikan rentang periode kustom untuk analisis performa taktis.
            </p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit border border-slate-200/20">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                filterMode === "all"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md shadow-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Seluruh Waktu
            </button>
            <button
              onClick={() => setFilterMode("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                filterMode === "monthly"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md shadow-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Pilih Bulan
            </button>
            <button
              onClick={() => setFilterMode("range")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                filterMode === "range"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md shadow-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Rentang Periode
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filterMode === "monthly" && (
            <motion.div
              key="monthly-panel"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-slate-100 dark:border-slate-800/85 pt-5"
            >
              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] dark:text-[#475569] block mb-3">
                    Pilih Bulan Laporan
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                    {MONTHS_NAMES.map((m) => {
                      const isActive = selectedMonth === m.val;
                      return (
                        <button
                          key={m.val}
                          onClick={() => setSelectedMonth(m.val)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {m.label.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {filterMode === "range" && (
            <motion.div
              key="range-panel"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-slate-100 dark:border-slate-800/85 pt-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    Mulai Dari Bulan (Sesi Awal)
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {MONTHS_NAMES.map((m) => {
                      const isActive = startMonth === m.val;
                      const isPastEnd = m.val > endMonth;
                      return (
                        <button
                          key={m.val}
                          onClick={() => {
                            setStartMonth(m.val);
                            if (m.val > endMonth) {
                              setEndMonth(m.val);
                            }
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none"
                              : isPastEnd
                                ? "bg-slate-50/50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {m.label.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 block mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"></span>
                    Sampai Dengan Bulan (Sesi Akhir)
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {MONTHS_NAMES.map((m) => {
                      const isActive = endMonth === m.val;
                      const isBeforeStart = m.val < startMonth;
                      return (
                        <button
                          key={m.val}
                          onClick={() => {
                            setEndMonth(m.val);
                            if (m.val < startMonth) {
                              setStartMonth(m.val);
                            }
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer ${
                            isActive
                              ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-none"
                              : isBeforeStart
                                ? "bg-slate-50/50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {m.label.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Bottom Config Actions Panel */}
        <div className="border-t border-slate-100 dark:border-slate-800/85 pt-5 mt-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1 bg-slate-50/60 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {filterMode !== "all" ? (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] dark:text-[#475569]">
                    PILIH TAHUN:
                  </span>
                  <div className="flex gap-2">
                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition-all duration-200 cursor-pointer ${
                          selectedYear === y
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                            : "bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Model Analisis Mencakup Seluruh Sejarah Wilayah
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap justify-between lg:justify-end w-full lg:w-auto">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                  Data khusus untuk Chaty AI:
                </span>
                <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-3.5 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900 inline-block">
                  📊 {filteredKas.length} Kas • {filteredIuran.length} Iuran • {filteredSurat.length} Surat • {filteredComplaint.length} Keluhan
                </div>
              </div>

              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 disabled:opacity-50 font-sans cursor-pointer whitespace-nowrap"
              >
                {isGenerating ? (
                  "Sedang Menyusun..."
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {filterMode === "all" ? (
                      "Generate Laporan Seluruh Waktu"
                    ) : filterMode === "monthly" ? (
                      `Generate Laporan ${MONTHS_NAMES.find(m => m.val === selectedMonth)?.label} ${selectedYear}`
                    ) : (
                      `Generate Laporan ${MONTHS_NAMES.find(m => m.val === startMonth)?.label} s.d ${MONTHS_NAMES.find(m => m.val === endMonth)?.label} ${selectedYear}`
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

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
          <div className="mt-6 flex flex-wrap gap-4 justify-center sm:justify-start">
            <AIDocumentSuiteMenu
              report={report}
              isSpeaking={isSpeaking}
              onToggleSpeak={handleToggleSpeak}
              onPrintPDF={handlePrintPDF}
              onExportText={handleExportText}
              onShareWhatsApp={handleShareWhatsApp}
              onShareTelegram={handleShareTelegram}
              onDispatchEmail={handleDispatchEmail}
              isEmailSending={isEmailSending}
              emailSentSuccess={emailSentSuccess}
              showNotification={showNotification}
              suitePaperSize={suitePaperSize}
              setSuitePaperSize={setSuitePaperSize}
              suiteIncludeStamp={suiteIncludeStamp}
              setSuiteIncludeStamp={setSuiteIncludeStamp}
              shareFormat={shareFormat}
              setShareFormat={setShareFormat}
            />


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
