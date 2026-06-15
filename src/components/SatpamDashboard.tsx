import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { EmergencyLog } from '../types';
import { ShieldAlert, MapPin, CheckCircle, History, Clock, Phone } from 'lucide-react';

export const SatpamDashboard: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [emergencies, setEmergencies] = useState<EmergencyLog[]>([]);
  const [history, setHistory] = useState<EmergencyLog[]>([]);

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
      setEmergencies(sortedLogs);
    });
    return () => unsubscribe();
  }, [tenantId]);

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
      <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-6">Dashboard Satpam</h1>
      
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
