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
    
    // Warmup Geolocation as soon as user starts pressing to gain 3 seconds for GPS stabilization
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true, maximumAge: 0 });
    }

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
    let lat: number | null = null;
    let lng: number | null = null;
    let accuracy = 0;
    let userLocation = "Lokasi Tidak Diketahui";

    // Try to get geolocation with patient, high-accuracy settings and multi-stage lock
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          // Robust Geolocation: Watch for best position for up to 8 seconds
          let bestPos: GeolocationPosition | null = null;
          
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
                bestPos = pos;
              }
              // If accuracy is high (< 20m), accept immediately
              if (pos.coords.accuracy <= 20) {
                navigator.geolocation.clearWatch(watchId);
                resolve(pos);
              }
            },
            () => {}, // Ignore errors during watch
            { enableHighAccuracy: true, maximumAge: 0 }
          );

          // After 8 seconds, if we have a position, use it, otherwise reject
          setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            if (bestPos) resolve(bestPos);
            else reject(new Error("Timeout waiting for high-accuracy GPS"));
          }, 8000);
        });

        lat = position.coords.latitude;
        lng = position.coords.longitude;
        accuracy = position.coords.accuracy;
        userLocation = `📍 Sinyal GPS Presisi (Akurasi: ~${accuracy.toFixed(1)}m): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch (e) {
        console.warn("GPS lock failed:", e);
      }
    }
    
    // Always prioritize custom calibrated coordinates if they exist
    const customLat = localStorage.getItem("custom_sos_lat");
    const customLng = localStorage.getItem("custom_sos_lng");
    if (customLat && customLng) {
      lat = parseFloat(customLat);
      lng = parseFloat(customLng);
      userLocation = `📍 Sinyal GPS Terkalibrasi (Kustom): ${lat?.toFixed(6)}, ${lng?.toFixed(6)}`;
    } else if (lat === null || lng === null) {
      // Allow sending SOS even without location.
      userLocation = `📍 Lokasi Tidak Diketahui / GPS Dinonaktifkan`;
      console.warn("Mengirim SOS tanpa lokasi.");
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
          tenantId: currentUser.tenantId,          userId: currentUser.uid || "anonymous",
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

  const calibrateGPS = () => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      const confirmCal = window.confirm("Kalibrasi GPS akan merekam koordinat Anda saat ini sebagai 'Titik Aman/Rumah'. Ini sangat disarankan dilakukan saat Anda berada di rumah agar akurasi SOS tetap tinggi meskipun sinyal GPS di dalam ruangan lemah. Lanjutkan?");
      if (!confirmCal) return;

      alert("Sedang mengunci koordinat presisi... Harap tetap diam di posisi Anda saat ini selama 5-10 detik.");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
           localStorage.setItem("custom_sos_lat", pos.coords.latitude.toString());
           localStorage.setItem("custom_sos_lng", pos.coords.longitude.toString());
           alert(`✅ KALIBRASI BERHASIL!\nAkurasi: ~${pos.coords.accuracy.toFixed(1)}m\n\nKoordinat ini akan digunakan otomatis saat Anda menekan SOS di masa mendatang. Anda dapat melakukan kalibrasi ulang kapan saja.`);
        },
        (err) => {
          alert("Gagal kalibrasi: " + err.message + ". Pastikan izin lokasi aktif.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  const clearCalibration = () => {
    localStorage.removeItem("custom_sos_lat");
    localStorage.removeItem("custom_sos_lng");
    alert("Kalibrasi dihapus. SOS akan menggunakan sinyal GPS real-time kembali.");
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-3xl border-2 border-red-900/50 shadow-2xl w-full max-w-sm mx-auto">
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
           <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" />
        )}
      </motion.button>
      <p className="mt-4 text-white font-black uppercase tracking-widest text-sm text-center">
        {isPressing ? 'MENGIRIM SOS...' : 'TEKAN & TAHAN 3 DETIK'}
      </p>

      <div className="mt-8 pt-6 border-t border-slate-800 w-full flex flex-col gap-3">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Opsi Akurasi GPS</p>
        <button 
          onClick={calibrateGPS}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-all"
        >
          📍 Kalibrasi GPS (Titik Aman)
        </button>
        {localStorage.getItem("custom_sos_lat") && (
          <button 
            onClick={clearCalibration}
            className="w-full py-2 text-red-400 hover:text-red-300 text-[9px] font-bold uppercase tracking-widest transition-all"
          >
            Hapus Data Kalibrasi
          </button>
        )}
      </div>
    </div>
  );
};
