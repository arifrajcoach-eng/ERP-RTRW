import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { EmergencyLog } from '../types';
import { ShieldAlert, MapPin, CheckCircle, History, Clock, Phone, Map as MapIcon, Bell } from 'lucide-react';
import { SOSDashboardMap } from './SOSDashboardMap';

interface SatpamDashboardProps {
  tenantId: string;
  pushSubscriptionStatus?: string;
  requestPushPermission?: () => void;
}

export const SatpamDashboard: React.FC<SatpamDashboardProps> = ({ 
  tenantId,
  pushSubscriptionStatus,
  requestPushPermission
}) => {
  const [emergencies, setEmergencies] = useState<EmergencyLog[]>([]);
  const [history, setHistory] = useState<EmergencyLog[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  // Sound effect helper
  const playSOSSounds = () => {
    // Vibrate
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
    // Simple sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2347/2347-preview.mp3');
    audio.play().catch(e => console.error("Sound play failed:", e));
  };
 
  // Format Helper: "15 Jun 2026, 15:40:12 WIB"
  const formatDateTime = (timestampStr: string) => {
    if (!timestampStr) return '-';
    try {
      const d = new Date(timestampStr);
      if (isNaN(d.getTime())) return '-';
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hour = pad(d.getHours());
      const minute = pad(d.getMinutes());
      const second = pad(d.getSeconds());
      
      return `${day} ${month} ${year}, ${hour}:${minute}:${second} WIB`;
    } catch (e) {
      return '-';
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    // Pending alerts
    const qPending = query(
      collection(db, 'emergency_logs'), 
      where('tenantId', '==', tenantId),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(qPending, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyLog));
      // Sort pending logs by timestamp descending
      const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Check for new emergency
      if (sortedLogs.length > 0 && sortedLogs[0].id !== lastNotificationId) {
          playSOSSounds();
          setLastNotificationId(sortedLogs[0].id);
      }
      
      setEmergencies(sortedLogs);
    });
    return () => unsubscribe();
  }, [tenantId, lastNotificationId]);

  useEffect(() => {
    if (!tenantId) return;
    // Resolved history
    const qResolved = query(
      collection(db, 'emergency_logs'), 
      where('tenantId', '==', tenantId),
      where('status', '==', 'resolved'),
      limit(15)
    );
    const unsubscribe = onSnapshot(qResolved, (snapshot) => {
      const logs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EmergencyLog))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(logs);
    });
    return () => unsubscribe();
  }, [tenantId]);

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, 'emergency_logs', id), { 
        status: 'resolved',
        resolvedBy: 'Satpam / Petugas',
        resolvedAt: new Date().toISOString()
      });
      
      try {
        await updateDoc(doc(db, 'emergencies', id), { 
          status: 'RESOLVED',
          resolvedBy: 'Satpam / Petugas',
          resolvedAt: new Date().toISOString()
        });
      } catch (eCent) {
        console.warn("Central emergencies sync failed (non-blocking):", eCent);
      }
    } catch (e) {
      console.error("Error resolving Satpam emergency log:", e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest leading-none">Dashboard SOS</h1>
        <button 
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all border-none cursor-pointer ${showMap ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <MapIcon size={16} />
          {showMap ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
        </button>
      </div>

      {pushSubscriptionStatus && requestPushPermission && (
        <div className="mb-6 p-5 bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800/80 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-blue-400 tracking-wider flex items-center gap-2">
              <Bell size={16} className={`${pushSubscriptionStatus === "SUBSCRIBED" ? "text-green-500 animate-pulse" : "text-blue-400"}`} />
              {pushSubscriptionStatus === "SUBSCRIBED" ? "🟢 Notifikasi Background Aktif" : "🔔 Setel Notifikasi SOS Background"}
            </h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {pushSubscriptionStatus === "SUBSCRIBED"
                ? "Sistem PWA di peramban Anda sudah terdaftar. Anda akan menerima sinyal darurat langsung di layar utama gawai/HP Anda meskipun aplikasi sedang ditutup!"
                : "Aktifkan Web Push Notification agar Anda (RT, RW, atau Satpam) langsung menerima bunyi sirene & koordinat darurat di HP secara real-time meskipun peramban sedang tertutup."}
            </p>
          </div>
          {pushSubscriptionStatus !== "SUBSCRIBED" && (
            <button 
              onClick={requestPushPermission}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-black uppercase tracking-wider text-white rounded-2xl transition-all shadow-md shadow-blue-900/30 cursor-pointer border-none shrink-0"
            >
              Aktifkan Sekarang
            </button>
          )}
        </div>
      )}

      {/* SOS Map Section */}
      {showMap && (
        <div className="mb-8 overflow-hidden rounded-3xl border-2 border-red-900/20 shadow-2xl">
            <SOSDashboardMap emergencies={emergencies} />
        </div>
      )}
      
      {/* Active Alerts */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <ShieldAlert size={20} className="animate-bounce text-red-500" /> Laporan Aktif ({emergencies.length})
        </h2>
        <div className="grid gap-4">
            {emergencies.map(emergency => (
            <div key={emergency.id} className="p-5 bg-gradient-to-r from-slate-900 to-red-950/20 border-2 border-red-900 rounded-3xl relative overflow-hidden transition-all shadow-lg hover:shadow-red-950/30">
                {/* Red pulsing glow at corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full filter blur-xl animate-pulse -mr-10 -mt-10" />
                
                <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1.5">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                      {emergency.userName}
                    </h2>
                    
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <Phone size={14} className="text-slate-500" /> {emergency.userPhone}
                    </p>

                    {/* Jam & Tanggal Laporan */}
                    <p className="text-xs font-bold text-red-400/95 font-mono flex items-center gap-1.5 uppercase tracking-wide">
                      <Clock size={14} className="text-red-500 shrink-0 animate-pulse" />
                      {formatDateTime(emergency.timestamp)}
                    </p>
                    
                    <div className="pt-2">
                      {(() => {
                        const lat = emergency.location?.lat ?? (emergency as any).latitude ?? (emergency as any).lat ?? 0;
                        const lng = emergency.location?.lng ?? (emergency as any).longitude ?? (emergency as any).lng ?? 0;
                        return (
                          <a 
                            href={`https://www.google.com/maps?q=loc:${lat},${lng}&z=19`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold bg-slate-800/80 hover:bg-red-900/40 text-blue-400 hover:text-red-300 border border-slate-700/50 hover:border-red-900/40 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                          >
                            <MapPin size={14} className="text-red-400" /> Lihat Lokasi GPS
                          </a>
                        );
                      })()}
                    </div>
                </div>
                
                <button 
                    onClick={() => handleResolve(emergency.id)}
                    className="bg-green-600 p-3.5 rounded-2xl hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-green-950/40 cursor-pointer border-none"
                    title="Selesaikan"
                >
                    <CheckCircle className="w-5 h-5 text-white" />
                </button>
                </div>
            </div>
            ))}
            {emergencies.length === 0 && (
            <div className="text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                Tidak ada laporan darurat aktif. Aman terkendali.
            </div>
            )}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-bold text-slate-400 mb-4 flex items-center gap-2">
            <History size={20} /> Riwayat Laporan
        </h2>
        <div className="grid gap-3">
          {history.map(item => (
              <div key={item.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors hover:bg-slate-900">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-slate-200 tracking-wide block">{item.userName}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-600" />
                        Lapor: {formatDateTime(item.timestamp)}
                      </span>
                      {item.resolvedAt && (
                        <span className="flex items-center gap-1 text-emerald-500/85">
                          <CheckCircle size={12} />
                          Selesai: {formatDateTime(item.resolvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full self-start sm:self-auto border-none">
                    <CheckCircle size={13} />
                    Resolved
                  </div>
              </div>
          ))}
          {history.length === 0 && (
            <div className="text-center p-6 text-slate-700 text-sm border border-slate-800/40 rounded-2xl">
                Belum ada riwayat laporan darurat.
            </div>
            )}
        </div>
      </section>
    </div>
  );
};
