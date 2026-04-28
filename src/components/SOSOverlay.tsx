import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Siren, User, MapPin, History, LifeBuoy, CheckCircle, BellOff, X } from 'lucide-react';
import { auth } from '../firebase';

export default function SOSOverlay({ emergency, onResolve, onCloseLocal, canResolve }: any) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let audioCtx: AudioContext | null = null;
    
    if (!isMuted) {
      const playPulse = () => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([1000, 500, 1000, 500]);
          } catch (e) {}
        }

        try {
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }

          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(300, audioCtx.currentTime); 
          oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.5); 
          oscillator.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 3); 

          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
          gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 2.5);
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);

          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 3);
        } catch (e) {
          console.error("Audio API warning/not supported", e);
        }
      };

      playPulse();
      interval = setInterval(playPulse, 3000);
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(0); } catch(e){}
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (audioCtx && audioCtx.state !== 'closed') {
        try { audioCtx.close(); } catch(e){}
      }
    };
  }, [isMuted]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-6 text-white text-center sm:p-12 overflow-hidden"
    >
      <motion.div 
        animate={{ opacity: [0.7, 1, 0.7] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute inset-0 bg-red-700"
      />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
         <motion.div 
           animate={{ scale: [1, 1.2, 1] }} 
           transition={{ repeat: Infinity, duration: 1 }}
           className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 "
         >
            <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white " />
         </motion.div>

         <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter uppercase italic">
           Sinyal Darurat Aktif!
         </h1>
         
         <div className="bg-white/10  border border-white/20 p-6 sm:p-8 rounded-3xl w-full mb-8 shadow-2xl">
            <div className="flex flex-col gap-4 text-left">
               <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                    {emergency.userPhoto ? (
                      <img src={emergency.userPhoto} alt="Reporter" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nama Pelapor</p>
                    <p className="text-xl sm:text-2xl font-black leading-tight">{emergency.userName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {emergency.userPhone && (
                        <a 
                          href={`https://wa.me/${emergency.userPhone.replace(/\D/g, '')}`} 
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
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Lokasi Kejadian</p>
                    {(emergency.latitude && emergency.longitude) ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${emergency.latitude},${emergency.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold truncate underline hover:text-white/80 transition-colors"
                      >
                        {emergency.userLocation} ↗
                      </a>
                    ) : (
                      <p className="text-sm font-bold truncate">{emergency.userLocation}</p>
                    )}
                    {emergency.userAddress && (
                      <p className="text-sm font-black bg-white/20 px-2 py-1 rounded inline-block w-fit uppercase tracking-tight">
                        {emergency.userAddress}
                      </p>
                    )}
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Waktu Terkirim</p>
                    <p className="text-lg font-bold">{new Date(emergency.timestamp).toLocaleTimeString('id-ID')}</p>
                  </div>
               </div>
            </div>
         </div>

         <p className="text-lg sm:text-xl font-bold mb-8 animate-bounce flex items-center gap-2">
           <LifeBuoy className="w-6 h-6" />
           Membutuhkan Pertolongan Segera!
         </p>

         {emergency.latitude && emergency.longitude && (
           <button 
             onClick={() => window.open(`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`, '_blank')}
             className="px-10 py-5 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-2xl mb-4 flex items-center justify-center gap-2"
           >
             <MapPin className="w-6 h-6" />
             CEK LOKASI KEJADIAN
           </button>
         )}

         {canResolve && (
            <button 
              onClick={() => onResolve(emergency.id)}
              className="px-10 py-5 bg-white text-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl mb-4 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6 border-2 border-red-600 rounded-full" />
              STOP SOS & KEMBALI KE MENU UTAMA
            </button>
         )}

         <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
           {!isMuted && (
              <button 
                onClick={() => setIsMuted(true)}
                className="px-6 py-4 bg-red-700/50  border border-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <BellOff className="w-5 h-5" /> Stop Suara/Getar
              </button>
           )}
           <button 
             onClick={onCloseLocal}
             className="px-6 py-4 bg-red-900/50  border border-red-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-950 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
           >
             <X className="w-5 h-5" /> Tutup Paksa Mode SOS
           </button>
         </div>
         
         <p className="mt-8 text-[10px] font-bold opacity-60 uppercase tracking-widest">
            Sinyal ini terkirim ke seluruh warga RW26 SMART
         </p>
      </div>
    </motion.div>
  );
}
