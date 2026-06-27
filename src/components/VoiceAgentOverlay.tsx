import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, X, Bot, RadioReceiver } from 'lucide-react';

interface VoiceAgentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  status: string | null;
  agentName: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function VoiceAgentOverlay({
  isOpen,
  onClose,
  status,
  agentName,
  isListening = false,
  isSpeaking = false,
  isMuted = false,
  onToggleMute
}: VoiceAgentOverlayProps) {
  const [bars, setBars] = useState<number[]>(new Array(20).fill(10));
  
  // Simulated visualizer for listening/speaking states
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      if (isListening || isSpeaking) {
        setBars(prev => prev.map(() => Math.random() * 60 + 10));
      } else {
        setBars(prev => prev.map(v => Math.max(10, v * 0.9)));
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isOpen, isListening, isSpeaking]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-6"
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-lg bg-slate-900/40 border border-slate-800/50 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{agentName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Mode</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Central Visualizer */}
            <div className="flex flex-col items-center justify-center py-4 md:py-8 overflow-y-auto max-h-[70vh]">
              <div className="relative mb-6 md:mb-12">
                {/* Pulse Rings */}
                <AnimatePresence>
                  {(isListening || isSpeaking) && (
                    <>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.3 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-blue-500/20"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 2, opacity: 0.1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 rounded-full bg-blue-500/10"
                      />
                    </>
                  )}
                </AnimatePresence>

                <div className={`
                  w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative z-10
                  ${isListening ? 'bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.4)]' : 
                    isSpeaking ? 'bg-purple-600 shadow-[0_0_50px_rgba(147,51,234,0.4)]' : 
                    'bg-slate-800 border border-slate-700'}
                `}>
                  {isListening ? (
                    <Mic size={48} className="text-white animate-pulse" />
                  ) : isSpeaking ? (
                    <Volume2 size={48} className="text-white" />
                  ) : (
                    <Bot size={48} className="text-slate-500" />
                  )}
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center space-y-2 mb-6 md:mb-12">
                <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {isListening ? "Mendengarkan..." : isSpeaking ? "Chaty Berbicara..." : "Siap Bicara!"}
                </h4>
                <p className="text-slate-400 text-xs md:text-sm max-w-[280px] mx-auto leading-relaxed">
                  {status || "Silakan bicara, Chaty siap membantu Anda."}
                </p>
              </div>

              {/* Visualizer Bars */}
              <div className="flex items-center justify-center gap-1.5 h-12 md:h-16 mb-6 md:mb-12">
                {bars.map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${height}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-1 rounded-full ${isSpeaking ? 'bg-purple-400' : 'bg-blue-400'}`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onToggleMute}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border
                  ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}
                `}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={onClose}
                className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/40 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all"
              >
                <PhoneOff size={32} />
              </button>

              <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 flex items-center justify-center">
                 <RadioReceiver size={24} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
