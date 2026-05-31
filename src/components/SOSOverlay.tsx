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
} from "lucide-react";
import { motion } from "motion/react";

interface SOSOverlayProps {
  emergency: any;
  onResolve: (id: string) => void;
  onCloseLocal: () => void;
  canResolve: boolean;
  setActiveTab: (tab: string) => void;
}

export default function SOSOverlay({
  emergency,
  onResolve,
  onCloseLocal,
  canResolve,
  setActiveTab,
}: SOSOverlayProps) {
  // Save to log when viewed (implied)
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
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch((e) => console.warn("Could not resume context:", e));
      }

      const now = ctx.currentTime;
      const cycleDuration = 5.0;
      const maxCycles = 12;
      const totalDuration = cycleDuration * maxCycles; // 60 seconds

      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const mainGain = ctx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "sawtooth"; // massive wailing/buzzing acoustic presence

        osc1.frequency.setValueAtTime(550, now);
        osc2.frequency.setValueAtTime(550, now);

        osc1.detune.setValueAtTime(-15, now);
        osc2.detune.setValueAtTime(15, now);

        lfo.type = "triangle";
        lfo.frequency.setValueAtTime(0.2, now); // 5-second pitch sweep cycle (1/5Hz)
        lfoGain.gain.setValueAtTime(250, now); // sweeping range (+/- 250Hz around central 550Hz)

        // Volume envelope for the entire 60 seconds:
        mainGain.gain.setValueAtTime(0, now);
        for (let i = 0; i < maxCycles; i++) {
          const loopStart = now + i * cycleDuration;
          if (i === 0) {
            mainGain.gain.linearRampToValueAtTime(0.95, loopStart + 1.2); // intense sweep volume rise
          } else {
            mainGain.gain.setValueAtTime(0.02, loopStart);
            mainGain.gain.linearRampToValueAtTime(0.95, loopStart + 1.2); // intense sweep volume rise
          }
          mainGain.gain.setValueAtTime(0.95, loopStart + 3.8);
          mainGain.gain.linearRampToValueAtTime(
            0.02,
            loopStart + cycleDuration - 0.1,
          ); // sweep volume fall
        }
        mainGain.gain.setValueAtTime(0, now + totalDuration);

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        mainGain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        lfo.start(now);

        osc1.stop(now + totalDuration);
        osc2.stop(now + totalDuration);
        lfo.stop(now + totalDuration);

        activePlaybackComponentsRef.current = [{ osc1, osc2, lfo, mainGain }];
      } catch (e) {
        console.warn(
          "Sound play attempt blocked or errored during system scheduling:",
          e,
        );
      }
    }

    // Now track visual steps and trigger physical device vibration continuously on each cycle
    loopCountRef.current = 0;
    setSosLoopCount(0);

    const triggerVibration = () => {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          // Intense rhythmic pulses spanning ~4.5 seconds of the 5.0s cycle
          navigator.vibrate([1000, 250, 1000, 250, 1000, 250, 750]);
        } catch (err) {
          console.warn("Haptic vibration skipped/failed:", err);
        }
      }
    };

    const playSequenceTick = () => {
      // Limit to exactly 12 loops
      if (loopCountRef.current >= 12 || !emergency || isMuted) {
        stopSOSAlarm();
        return;
      }

      // Perform physical device vibration
      triggerVibration();

      loopCountRef.current += 1;
      setSosLoopCount(loopCountRef.current);
    };

    // Initial tick triggered immediately
    playSequenceTick();

    // Trigger looping sequences every 5.0 seconds
    sirenIntervalRef.current = setInterval(playSequenceTick, 5000);
  };

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
          startSOSAlarm();
        }
      } else {
        setAudioBlocked(true);
      }
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
        navigator.vibrate([200]);
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

        <div className="flex flex-col items-center gap-2 mb-6">
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-mono font-black border border-white/25 uppercase tracking-wider animate-pulse flex items-center gap-1.5">
            🚨 Bunyi Loop Ke: {sosLoopCount} / 12
          </span>
          {sosLoopCount >= 12 && (
            <span className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg animate-bounce">
              ✓ Limit Bunyi 12 Kali Selesai
            </span>
          )}
        </div>

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
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Lokasi Kejadian
                </p>
                {emergency.latitude && emergency.longitude ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${emergency.latitude},${emergency.longitude}`}
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
                )}
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

        {/* Maps Navigation Button */}
        {emergency.latitude && emergency.longitude && (
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`,
                "_blank",
              )
            }
            className="px-10 py-5 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-2xl mb-4 flex items-center justify-center gap-2"
          >
            <MapPin className="w-6 h-6" />
            CEK LOKASI KEJADIAN
          </button>
        )}

        {/* STOP SOS Button */}
        {canResolve && (
          <button
            onClick={() => onResolve(emergency.id)}
            className="px-10 py-5 bg-white text-rose-600 rounded-[2rem] font-black uppercase text-sm w-full tracking-widest hover:bg-rose-50 hover:scale-[1.02] transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-4 flex items-center justify-center gap-3 border-2 border-white/50"
          >
            <CheckCircle className="w-6 h-6" />
            STOP SOS & KEMBALI KE MENU UTAMA
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
              <BellOff className="w-5 h-5" /> Stop Suara
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
