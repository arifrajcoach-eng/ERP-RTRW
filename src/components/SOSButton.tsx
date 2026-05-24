import React, { useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';

interface SOSButtonProps {
  currentUser: any;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ currentUser }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    setIsPressing(true);
    let count = 0;
    timerRef.current = setInterval(() => {
      count += 100;
      setProgress((count / 3000) * 100);
      if (count >= 3000) {
        clearInterval(timerRef.current!);
        triggerSOS();
        setIsPressing(false);
        setProgress(0);
      }
    }, 100);
  };

  const endPress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPressing(false);
    setProgress(0);
  };

  const triggerSOS = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const id = `SOS-${Date.now()}`;
        await addDoc(collection(db, 'emergencies'), {
          tenantId: currentUser.tenantId || 'RW26_SMART',
          id,
          userId: currentUser.uid,
          userName: currentUser.name,
          userPhone: currentUser.hp || '-',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          userLocation: `Koordinat: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          status: 'ACTIVE',
          timestamp: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
        alert("SOS Terkirim!");
      } catch (e) {
        console.error("Error sending SOS:", e);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-3xl border-2 border-red-900/50 shadow-2xl">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        className={`relative w-40 h-40 rounded-full flex items-center justify-center ${isPressing ? 'bg-red-700' : 'bg-red-600'} transition-colors duration-300 shadow-[0_0_50px_rgba(220,38,38,0.5)]`}
      >
        <AlertTriangle className="w-20 h-20 text-white" />
        {isPressing && (
          <div className="absolute inset-0 rounded-full border-4 border-white animate-spin-slow" />
        )}
      </motion.button>
      <p className="mt-4 text-white font-black uppercase tracking-widest text-sm">
        {isPressing ? 'MENGIRIM SOS...' : 'TEKAN & TAHAN 3 DETIK'}
      </p>
    </div>
  );
};
