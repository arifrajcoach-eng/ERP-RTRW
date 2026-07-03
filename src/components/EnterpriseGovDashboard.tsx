import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  RefreshCw,
  Zap,
  X,
  VolumeX,
  Volume2,
  Download,
  MapPin,
  BarChart3,
  Globe,
  ChevronLeft
} from "lucide-react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";

import { generateRegionalInsight, textToSpeech } from "../services/aiService";

export default function EnterpriseGovDashboard({
  tenantId,
  wargaData = [],
  currentUser,
  wargaAuth,
  onBack,
}: {
  tenantId: string;
  wargaData: any[];
  currentUser: any;
  wargaAuth?: any;
  onBack?: () => void;
}) {
  const defaultRegion = useMemo(() => {
    const rawRw = currentUser?.rw || wargaAuth?.rw || "26";
    const digits = rawRw.match(/\d+/);
    return digits ? `RW ${digits[0].padStart(2, "0")}` : `RW ${rawRw}`;
  }, [currentUser, wargaAuth]);

  const [activeRegion, setActiveRegion] = useState(defaultRegion);
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleToggleSpeak = async () => {
    if (isSpeaking) {
      sourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    if (!insight) return;

    try {
      setIsSpeaking(true);
      const response: any = await textToSpeech(insight, true);
      if (!response) {
        setIsSpeaking(false);
        return;
      }
      const base64Audio = response.data;
      const audioContext = new (
        (window as any).AudioContext || (window as any).webkitAudioContext
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

  // Real-time calculation from synced wargaData:
  const monitoringData = useMemo(() => {
    const rwMap = new Map<string, number>();
    wargaData.forEach((w: any) => {
      let rawRw = (w.rw || "").toString().trim();
      if (rawRw) {
        const digits = rawRw.match(/\d+/);
        if (digits) {
          const formatted = digits[0].padStart(2, "0");
          if (formatted !== "05") {
            const rwKey = `RW ${formatted}`;
            rwMap.set(rwKey, (rwMap.get(rwKey) || 0) + 1);
          }
        } else {
          if (!rawRw.includes("05")) {
            const rwKey = `RW ${rawRw}`;
            rwMap.set(rwKey, (rwMap.get(rwKey) || 0) + 1);
          }
        }
      }
    });

    if (rwMap.size === 0) {
      // Fallback to real active RW 26 if no citizens exist in the database yet
      const fallbackRw = currentUser?.rw || wargaAuth?.rw || "26";
      const digits = fallbackRw.match(/\d+/);
      const rwKey = digits ? `RW ${digits[0].padStart(2, "0")}` : `RW ${fallbackRw}`;
      rwMap.set(rwKey, 0);
    }

    const calculated = Array.from(rwMap.entries()).map(([rwName, count]) => {
      let status = "STABIL";
      if (count > 5) status = "SANGAT AKTIF";
      else if (count === 0) status = "PERLU ATENSI";

      return {
        name: rwName,
        status: status,
        budget: count * 1250000,
        compliance: count > 0 ? Math.min(100, 70 + (count % 6) * 5) : 0,
        health: count > 0 ? Math.min(100, 80 + (count % 4) * 3) : 0,
      };
    });

    return calculated.sort((a, b) => a.name.localeCompare(b.name));
  }, [wargaData, currentUser, wargaAuth]);

  // Sync activeRegion if the monitoringData layout updates
  useEffect(() => {
    if (monitoringData.length > 0 && !monitoringData.some((c) => c.name === activeRegion)) {
      setActiveRegion(monitoringData[0].name);
    }
  }, [monitoringData, activeRegion]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-3 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 border border-slate-200 shadow-xl transition-all hover:scale-105 active:scale-95"
              title="Kembali ke Dashboard"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                🏛️ DASHBOARD KELURAHAN
              </h1>
              <span className="bg-indigo-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
                Enterprise
              </span>
            </div>
            <p className="text-slate-500 font-medium">
              Monitoring Real-time & Decision Support Wilayah Terintegrasi.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            id="btn-generate-regional-insight"
            disabled={isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                const result = await generateRegionalInsight(monitoringData);
                setInsight(result);
              } catch (error) {
                console.error("Failed to generate insight:", error);
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-8 py-4 bg-sky-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-sky-200/50 hover:bg-sky-500 hover:shadow-sky-200/70 hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 border border-sky-300/30 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Decision Insight (AI)
          </button>
        </div>
      </div>

      {insight && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
            <button
              onClick={() => setInsight("")}
              className="absolute top-8 right-8 text-slate-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 font-mono">
              Goverment AI System v1.0
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 leading-relaxed font-medium text-slate-300">
                {insight.split("\n").map((line, i) => (
                  <p key={i} className="mb-4">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleToggleSpeak}
                className={`px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all shadow-2xl border-2 ${isSpeaking ? "bg-red-500 border-red-500 text-white animate-pulse" : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"}`}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                {isSpeaking ? "Berhenti" : "Dengarkan Rekomendasi AI"}
              </button>
              <button className="px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {monitoringData.map((reg) => (
          <div
            key={reg.name}
            className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
              activeRegion === reg.name
                ? "bg-white border-indigo-600 shadow-2xl shadow-indigo-100"
                : "bg-white border-slate-50 hover:border-slate-200"
            }`}
            onClick={() => setActiveRegion(reg.name)}
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  reg.status.includes("SANGAT")
                    ? "bg-emerald-50 text-emerald-600"
                    : reg.status.includes("PERLU")
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-50 text-slate-600"
                }`}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                  reg.status.includes("SANGAT")
                    ? "bg-emerald-100 text-emerald-700"
                    : reg.status.includes("PERLU")
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {reg.status}
              </span>
            </div>
            <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">
              {reg.name}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
              Kawasan Cluster A-C
            </p>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Compliance
                </span>
                <span className="font-bold text-slate-700">
                  {reg.compliance}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600"
                  style={{ width: `${reg.compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Distribusi Anggaran Regional
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monitoringData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="budget"
                  fill="#4f46e5"
                  radius={[12, 12, 12, 12]}
                  barSize={60}
                >
                  {monitoringData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status.includes("PERLU") ? "#ef4444" : "#4f46e5"
                      }
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <Globe className="absolute -top-12 -right-12 w-64 h-64 opacity-10" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-8 font-mono">
              Hierarchical Info
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-4xl font-black tracking-tighter mb-2">
                  1,248
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  Total Warga Kelurahan
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-2xl font-black tracking-tighter mb-1">
                    12
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">
                    Total RW
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tighter mb-1">
                    45
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">
                    Total RT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Sistem Kelurahan Online
              </span>
            </div>
            <p className="text-xs font-medium text-indigo-100 leading-relaxed italic opacity-80">
              "Pantauan iuran mencapai 88.5% secara merata. Dibandingkan tahun
              lalu, terjadi peningkatan digitalisasi sebesar 42% di seluruh
              wilayah RW."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
