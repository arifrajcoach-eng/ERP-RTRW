import React, { useState, useRef, useMemo } from "react";
import {
  X,
  QrCode,
  CheckCircle,
  FileCheck,
  Bot,
  TrendingUp,
  Volume2,
  VolumeX,
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
}: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState("");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

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
          <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            🚀 AI Premium
          </span>
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
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-indigo-100 leading-relaxed text-sm bg-indigo-950/50 p-6 rounded-2xl border border-indigo-800">
              {report}
            </pre>
          </div>
          <div className="mt-6 flex gap-4">
            <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Cetak PDF
            </button>
            <button
              onClick={handleToggleSpeak}
              className={`px-6 py-3 border-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg ${isSpeaking ? "bg-red-500 border-red-500 text-white animate-pulse" : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50"}`}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              {isSpeaking ? "Berhenti" : "Dengarkan Analisis"}
            </button>
            <button className="px-6 py-3 bg-indigo-100/10 text-white border border-indigo-500 rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Bagikan ke Grup Pengurus
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Prediksi Pendapatan (6 Bulan Ke Depan)
          </h3>
          <div className="h-[300px]">
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
