import React, { useState, useEffect, useRef } from "react";
import {
  Siren,
  User,
  MapPin,
  History,
  LifeBuoy,
  CheckCircle,
  LayoutDashboard,
  Volume2,
  BellOff,
  Signal,
  Radio,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";

interface SOSOverlayProps {
  emergency: any;
  onResolve: (id: string) => void;
  onStopSiren: () => void;
  onCloseLocal: () => void;
  canResolve: boolean;
  setActiveTab: (tab: string) => void;
}

export default function SOSOverlay({
  emergency,
  onResolve,
  onStopSiren,
  onCloseLocal,
  canResolve,
  setActiveTab,
}: SOSOverlayProps) {
  // Save to log when viewed (implied)
  console.log("SOSOverlay: Received emergency data:", emergency);
  useEffect(() => {
    if (emergency && !emergency.logged) {
      // Logic would be here in a real production app to log the view
    }
  }, [emergency]);

  const [isMuted, setIsMuted] = useState(false);
  const [sosLoopCount, setSosLoopCount] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);
  const loopCountRef = useRef(0);
  const activePlaybackComponentsRef = useRef<any[]>([]);

  const stopSOSAlarm = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    activePlaybackComponentsRef.current.forEach((item) => {
      try {
        item.osc1.stop();
      } catch (e) {}
      try {
        item.osc1.disconnect();
      } catch (e) {}
      try {
        item.osc2.stop();
      } catch (e) {}
      try {
        item.osc2.disconnect();
      } catch (e) {}
      try {
        item.lfo.stop();
      } catch (e) {}
      try {
        item.lfo.disconnect();
      } catch (e) {}
      try {
        item.mainGain.disconnect();
      } catch (e) {}
    });
    activePlaybackComponentsRef.current = [];

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  };

  const startSOSAlarm = () => {
    // Avoid double scheduling
    if (sirenIntervalRef.current) return;
    if (!emergency || isMuted) return;

    // Ensure Audio Context is initialized
    if (!audioCtxRef.current) {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch((e) => console.warn("Could not resume context:", e));
    }

    loopCountRef.current = 0;
    setSosLoopCount(0);

    const playCycle = () => {
      if (!emergency || isMuted) {
        stopSOSAlarm();
        return;
      }

      // Check and auto-resume if context is suspended
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch((e) => console.warn("Could not resume context inside playCycle:", e));
      }

      // Increment loop count (strictly 12 cycles as requested by user)
      loopCountRef.current += 1;
      const progress = loopCountRef.current;
      const MAX_ALARM_LOOPS = 12;

      if (progress > MAX_ALARM_LOOPS) {
        stopSOSAlarm();
        return;
      }

      setSosLoopCount(progress);

      // 1. Device Vibration Mode (Intense physical rescue pattern: multi-tier pulse)
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          // Clear any active vibration cycles and queue a highly noticeable pattern
          navigator.vibrate(0);
          navigator.vibrate([1000, 300, 1000, 300, 1000, 300, 1000]); 
        } catch (err) {
          console.warn("Haptic vibration skipped or not supported:", err);
        }
      }

      // 2. Play robust 4.8s wail sound inside this 5-second window
      if (ctx && ctx.state === "running") {
        try {
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          const mainGain = ctx.createGain();

          osc1.type = "sawtooth";
          osc2.type = "sawtooth";

          // Center frequency at 700Hz – highly penetrative to human ears
          osc1.frequency.setValueAtTime(700, now);
          osc2.frequency.setValueAtTime(700, now);

          // Deep chorus effect (detune by 25 cents) for thick, tactical auditory urgency
          osc1.detune.setValueAtTime(-25, now);
          osc2.detune.setValueAtTime(25, now);

          lfo.type = "triangle";
          // Fast Yelp pitch sweep (LFO frequency 0.8Hz = full cycle every 1.25s)
          lfo.frequency.setValueAtTime(0.8, now); 
          lfoGain.gain.setValueAtTime(300, now); // +/- 300Hz sweep for intense pitch variation

          // Volume Envelope: Get loud almost instantly (0.3s) and keep max volume until the very end
          mainGain.gain.setValueAtTime(0, now);
          mainGain.gain.linearRampToValueAtTime(0.95, now + 0.3); 
          mainGain.gain.setValueAtTime(0.95, now + 4.5);
          mainGain.gain.linearRampToValueAtTime(0.01, now + 4.8); // fade out nicely to prevent pops
          mainGain.gain.setValueAtTime(0, now + 4.9);

          lfo.connect(lfoGain);
          lfoGain.connect(osc1.frequency);
          lfoGain.connect(osc2.frequency);

          osc1.connect(mainGain);
          osc2.connect(mainGain);
          mainGain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          lfo.start(now);

          osc1.stop(now + 4.9);
          osc2.stop(now + 4.9);
          lfo.stop(now + 4.9);

          // Track only the active playback components for clean disposal/muting at any time
          activePlaybackComponentsRef.current.forEach((item) => {
            try { item.osc1.stop(); } catch (e) {}
            try { item.osc1.disconnect(); } catch (e) {}
            try { item.osc2.stop(); } catch (e) {}
            try { item.osc2.disconnect(); } catch (e) {}
            try { item.lfo.stop(); } catch (e) {}
            try { item.lfo.disconnect(); } catch (e) {}
            try { item.mainGain.disconnect(); } catch (e) {}
          });

          activePlaybackComponentsRef.current = [{ osc1, osc2, lfo, mainGain }];
        } catch (err) {
          console.warn("Siren wail component exception:", err);
        }
      }
    };

    // Execute first tick immediately
    playCycle();

    // Loop at perfect 5-second intervals up to 12 times
    sirenIntervalRef.current = setInterval(playCycle, 5000);
  };

  // Add global window gesture unlock listeners to auto-resume AudioContext and trigger vibration
  useEffect(() => {
    const unlockGesture = async () => {
      if (!emergency || isMuted) return;

      if (!audioCtxRef.current) {
        const AudioContextClass =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === "suspended") {
          try {
            await ctx.resume();
            setAudioBlocked(false);
          } catch (e) {
            console.warn("Auto-gesture resume failed:", e);
          }
        } else {
          setAudioBlocked(false);
        }
      }

      // Check and activate vibration immediately on first gesture
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([200]);
        } catch (e) {}
      }
    };

    window.addEventListener("click", unlockGesture, { passive: true });
    window.addEventListener("touchstart", unlockGesture, { passive: true });

    return () => {
      window.removeEventListener("click", unlockGesture);
      window.removeEventListener("touchstart", unlockGesture);
    };
  }, [emergency?.id, isMuted]);

  useEffect(() => {
    if (emergency && !isMuted) {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === "suspended") {
          setAudioBlocked(true);
        } else {
          setAudioBlocked(false);
        }
      } else {
        setAudioBlocked(true);
      }

      // Fix: Always start alarm visual intervals even if initially suspended
      startSOSAlarm();
    } else {
      stopSOSAlarm();
    }

    return () => {
      stopSOSAlarm();
    };
  }, [isMuted, emergency?.id]);

  // Clean Audio Context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const enableAudioManually = async () => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }

    if (audioCtxRef.current) {
      try {
        await audioCtxRef.current.resume();
        setAudioBlocked(false);
      } catch (e) {
        console.error("Failed to enable audio manually:", e);
      }
    }

    // Explicitly gesture-unlock physical vibration
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([400, 200, 400]);
      } catch (e) {}
    }

    stopSOSAlarm();
    startSOSAlarm();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center p-6 text-white text-center sm:p-12 overflow-y-auto"
    >
      {/* Flashing Background Animation */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute inset-0 bg-red-700 pointer-events-none"
      />

      {/* Top-left mute toggle */}
      <button
        onClick={() => setIsMuted((prev) => !prev)}
        className="fixed top-6 left-6 p-4 bg-white text-red-600 rounded-full hover:bg-red-50 transition-all z-[200] shadow-2xl border-2 border-white"
      >
        {isMuted ? <Volume2 className="w-8 h-8" /> : <BellOff className="w-8 h-8" />}
      </button>


      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full my-auto py-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 "
        >
          <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white " />
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black mb-1 tracking-tighter uppercase italic">
          Sinyal Darurat Aktif!
        </h1>

        {/* HIGH CONTRAST VICTIM CARD */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: [0.95, 1.02, 1], opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-yellow-400 text-slate-900 border-4 border-white font-sans rounded-[2rem] p-6 sm:p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(234,179,8,0.5)] my-6 relative overflow-hidden"
        >
          {/* Animated decorative beacon light inside the card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
          
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-800 mb-2 flex items-center justify-center gap-1.5 leading-none">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
            WARGA YANG MEMBUTUHKAN BANTUAN SEGERA
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 uppercase leading-none drop-shadow-sm select-all">
            {emergency.userName || "Warga Tetangga"}
          </h2>
          {emergency.userAddress && (
            <div className="mt-4 inline-block bg-rose-700 text-white font-black text-xs uppercase tracking-wide rounded-2xl px-5 py-2.5 shadow-md border border-rose-600 leading-tight">
              📍 {emergency.userAddress}
            </div>
          )}
        </motion.div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 mb-6 justify-center">
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-mono font-black border border-white/25 uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-lg">
            🚨 Sirine Aktif: Siklus {sosLoopCount} / 12 (Sinyal Terkirim)
          </span>

          <span className="bg-cyan-500/30 text-cyan-100 px-4 py-1.5 rounded-full text-xs font-mono font-black border border-cyan-500/50 uppercase tracking-widest flex items-center gap-1.5 shadow-lg animate-pulse">
            <Radio className="w-3.5 h-3.5 text-cyan-300 animate-ping shrink-0" />
            <Signal className="w-3.5 h-3.5 text-cyan-300 shrink-0 animate-bounce" />
            <span>GPS ACTIVE: 100% Locked</span>
          </span>

          {sosLoopCount < 12 && !isMuted ? (
            <span className="bg-emerald-500/30 text-emerald-100 px-4 py-1.5 rounded-full text-xs font-mono font-black border border-emerald-500/50 uppercase tracking-widest flex items-center gap-1.5 shadow-lg animate-pulse">
              📳 Mode Getar HP: Aktif
            </span>
          ) : (
            <span className="bg-white/10 text-white/50 px-4 py-1.5 rounded-full text-xs font-mono font-black border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
              📳 Mode Getar: Nonaktif
            </span>
          )}
          {sosLoopCount >= 12 && (
            <span className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg animate-bounce">
              ✓ Sirine Berbunyi Selama 12 Siklus Selesai! Menunggu Petugas
            </span>
          )}
        </div>

        {audioBlocked && !isMuted && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 bg-yellow-400 text-slate-950 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-2xl border-2 border-white flex items-center justify-center gap-2 animate-bounce cursor-pointer"
            onClick={enableAudioManually}
          >
            ⚠️ KETUK LAYAR DI MANA SAJA UNTUK BUNYI & GETAR SIRINE!
          </motion.div>
        )}

        <motion.div
          animate={
            sosLoopCount < 12 && !isMuted
              ? {
                  x: [0, -3, 3, -3, 3, -1, 1, -1, 1, 0],
                  y: [0, 2, -2, 2, -2, 1, -1, 1, -1, 0],
                }
              : {}
          }
          transition={{
            repeat: Infinity,
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="bg-white/10 border border-white/20 p-6 sm:p-8 rounded-3xl w-full mb-8 shadow-2xl"
        >
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                {emergency.userPhoto ? (
                  <img
                    src={emergency.userPhoto}
                    alt="Reporter"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Nama Pelapor
                </p>
                <p className="text-xl sm:text-2xl font-black leading-tight">
                  {emergency.userName}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {emergency.userPhone && (
                    <a
                      href={`https://wa.me/${emergency.userPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/50 hover:bg-green-500/50 transition-colors"
                    >
                      WhatsApp: {emergency.userPhone}
                    </a>
                  )}
                  {emergency.userEmail && (
                    <p className="text-[10px] font-bold opacity-70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                      {emergency.userEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    Lokasi Kejadian
                  </p>
                  <span className="bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-mono text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    🛰️ GPS Lock: Active
                  </span>
                </div>
                {(() => {
                  const lat = emergency.latitude ?? emergency.location?.lat ?? emergency.lat;
                  const lng = emergency.longitude ?? emergency.location?.lng ?? emergency.lng;
                  return (lat !== undefined && lng !== undefined && lat !== 0) ? (
                  <a
                    href={`https://www.google.com/maps?q=loc:${lat},${lng}&z=19`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold truncate underline hover:text-white/80 transition-colors"
                  >
                    {emergency.userLocation} ↗
                  </a>
                  ) : (
                  <p className="text-sm font-bold truncate">
                    {emergency.userLocation}
                  </p>
                  );
                })()}
                {emergency.userAddress && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-sm font-black bg-white/20 px-3 py-1.5 rounded-xl inline-block w-fit uppercase tracking-tight">
                      {emergency.userAddress}
                    </p>
                    <p className="text-sm font-black bg-white/30 px-3 py-1.5 rounded-xl inline-block w-fit uppercase tracking-tight">
                      RT: {emergency.rt || "-"} / RW: {emergency.rw || "-"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Waktu Terkirim
                </p>
                <p className="text-lg font-bold">
                  {new Date(emergency.timestamp).toLocaleTimeString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-lg sm:text-xl font-bold mb-8 animate-bounce flex items-center gap-2">
          <LifeBuoy className="w-6 h-6" />
          Membutuhkan Pertolongan Segera!
        </p>

        {/* SOS Action Button Group */}
        {(() => {
          const lat = emergency.latitude ?? emergency.location?.lat ?? emergency.lat ?? 0;
          const lng = emergency.longitude ?? emergency.location?.lng ?? emergency.lng ?? 0;
          const hasCoords = lat !== 0 || lng !== 0;

          const handleShareSOS = () => {
             const mapsUrl = `https://www.google.com/maps?q=loc:${lat},${lng}&z=19`;
             const text = `🚨 DARURAT SOS! 🚨\n\nWarga: ${emergency.userName}\nAlamat: ${emergency.userAddress}\nLaporan Tambahan: ${emergency.userLocation}\nKoordinat: ${mapsUrl}\n\nMohon warga/satpam terdekat segera menuju lokasi!`;
             if (navigator.share) {
               navigator.share({ title: 'Darurat SOS!', text: text, url: mapsUrl }).catch(() => {});
             } else {
               window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
             }
          };

          return hasCoords ? (
            <div className="flex flex-col gap-3 w-full mb-2">
              <a
                href={`https://www.google.com/maps?q=loc:${lat},${lng}&z=19`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <MapPin className="w-6 h-6 animate-pulse" />
                CEK LOKASI KEJADIAN
              </a>
              <button
                type="button"
                onClick={handleShareSOS}
                className="px-6 py-4 bg-red-800 text-white border-none rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Share2 className="w-5 h-5" />
                BAGIKAN KE GRUP WA
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => alert("Menunggu kordinat lokasi dari pengguna...")}
              className="px-10 py-5 bg-slate-100 text-slate-400 border-2 border-slate-200 rounded-2xl font-black uppercase text-sm w-full tracking-widest cursor-pointer mb-2 flex items-center justify-center gap-2"
            >
              <MapPin className="w-6 h-6" />
              CEK LOKASI KEJADIAN
            </button>
          );
        })()}

        {emergency.userLocation && (
          <p className="text-center text-xs text-white/70 font-medium mb-6">
            {emergency.userLocation.includes("Ditolak") || emergency.userLocation.includes("Gagal") ? "⚠️ Lokasi: Gagal Dimuat. Pengirim Tidak Mengizinkan Lokasi." : "✅ Lokasi: Transmisi Sinyal Diterima"}
          </p>
        )}

        {/* Toggle Siren Button */}
        {!isMuted ? (
          <button
            onClick={() => {
              onStopSiren();
              stopSOSAlarm();
              setIsMuted(true);
            }}
            className="px-10 py-5 bg-amber-400 text-slate-950 border-2 border-amber-500 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-amber-300 transition-all active:scale-95 shadow-[0_8px_30px_rgba(245,158,11,0.4)] mb-4 flex items-center justify-center gap-2 cursor-pointer"
          >
            <BellOff className="w-6 h-6 animate-bounce" />
            MATIKAN SUARA SIRINE
          </button>
        ) : (
          <button
            onClick={() => {
              setIsMuted(false);
            }}
            className="px-10 py-5 bg-emerald-500 text-white border-2 border-emerald-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_8px_30px_rgba(16,185,129,0.4)] mb-4 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
            AKTIFKAN SUARA SIRINE
          </button>
        )}

        {/* STOP SOS Button */}
        {canResolve && (
          <button
            onClick={() => onResolve(emergency.id)}
            className="px-10 py-5 bg-white text-rose-600 rounded-[2rem] font-black uppercase text-sm w-full tracking-widest hover:bg-rose-50 hover:scale-[1.02] transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-4 flex items-center justify-center gap-3 border-2 border-white/50"
          >
            <CheckCircle className="w-6 h-6" />
            OFF SOS & KEMBALI KE MENU UTAMA
          </button>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2 flex-wrap">
          {/* Back to menu without stopping */}
          <button
            onClick={() => {
              onCloseLocal();
              setActiveTab("dashboard");
            }}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <LayoutDashboard className="w-4 h-4" /> Kembali Ke Menu Utama
          </button>

          {audioBlocked && !isMuted ? (
            <button
              onClick={enableAudioManually}
              className="px-6 py-4 bg-yellow-400 text-slate-900 border border-[#ffcbcb] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-300 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto shadow-xl"
            >
              <Volume2 className="w-5 h-5" /> AKTIFKAN ALARM
            </button>
          ) : null}

          {!isMuted ? (
            <button
              onClick={() => setIsMuted(true)}
              className="px-6 py-4 bg-red-700/50 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <BellOff className="w-5 h-5" /> Off Suara
            </button>
          ) : (
            <button
              onClick={() => setIsMuted(false)}
              className="px-6 py-4 bg-emerald-600 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Volume2 className="w-5 h-5" /> On Suara
            </button>
          )}
        </div>

        <p className="mt-8 text-[10px] font-bold opacity-60 uppercase tracking-widest">
          Sinyal ini terkirim ke seluruh pengurus dan warga
        </p>
      </div>
    </motion.div>
  );
}
