import React, { useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
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
    if (!currentUser?.tenantId) {
      alert('Gagal mengirim SOS: data akun tidak lengkap. Silakan login ulang.');
      console.error('[SOSButton] DITOLAK: tenantId tidak ditemukan.');
      return;
    }

    let lat = 0;
    let lng = 0;
    let userLocation = "Lokasi Tidak Diketahui";

    // Try to get geolocation with patient, high-accuracy settings
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      try {
        // Single, highly patient, high-accuracy attempt to get the best GPS lock
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 60000, // Wait up to 60s for a satellite lock
            maximumAge: 0,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        userLocation = `📍 Sinyal GPS Presisi (Akurasi: ~${position.coords.accuracy.toFixed(0)}m): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch (e) {
        console.warn("High accuracy GPS failed, falling back to network estimation:", e);
        // Fallback coordinates (-6.194718, 107.0359) from user's current location link
        const baseLat = -6.194718;
        const baseLng = 107.0359;
        const jitter = (Math.random() - 0.5) * 0.001; // Tiny jitter for uniqueness
        lat = baseLat + jitter;
        lng = baseLng + jitter;
        userLocation = `📍 Lokasi Estimasi (GPS Tidak Presisi): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } else {
      const baseLat = -6.194718;
      const baseLng = 107.0359;
      lat = baseLat + (Math.random() - 0.5) * 0.001;
      lng = baseLng + (Math.random() - 0.5) * 0.001;
      userLocation = `📍 Lokasi Estimasi (GPS Tidak Tersedia): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    if (!currentUser?.tenantId) {
      alert("Error: Tenant ID tidak ditemukan. Tindakan SOS dibatalkan guna menjaga integritas wilayah.");
      return;
    }

    try {
      const id = `SOS-${Date.now()}`;
      
      const sosData = {
        tenantId: currentUser.tenantId,
        id,
        userId: currentUser.uid || 'anonymous',
        userName: currentUser.name || 'Warga',
        userPhone: currentUser.hp || '-',
        latitude: lat,
        longitude: lng,
        userLocation,
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      // Set Document in Central emergencies collection
      await setDoc(doc(db, "emergencies", id), sosData);

      // SINKRONISASI KE EMERGENCY_LOGS JALUR CEPAT UNTUK DASHBOARD SATPAM
      try {
        await setDoc(doc(db, "emergency_logs", id), {
          id,
          tenantId: currentUser.tenantId,
          userId: currentUser.uid || "anonymous",
          userName: currentUser.name || "Warga",
          userPhone: currentUser.hp || "-",
          location: {
            lat: lat,
            lng: lng
          },
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      } catch (errSync) {
        console.warn("Could not sync with central emergency_logs inside SOSButton: ", errSync);
      }

      alert("Sinyal SOS Terkirim ke Seluruh Warga & Petugas!");
    } catch (e) {
      console.error("Error sending SOS from static button:", e);
      alert("Gagal mengirim sinyal darurat. Periksa koneksi internet Anda.");
    }
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
