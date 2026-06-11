import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { EmergencyLog } from '../types';
import { ShieldAlert, MapPin, CheckCircle, History } from 'lucide-react';

export const SatpamDashboard: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [emergencies, setEmergencies] = useState<EmergencyLog[]>([]);
  const [history, setHistory] = useState<EmergencyLog[]>([]);

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
      setEmergencies(logs);
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
      limit(10)
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
            <ShieldAlert size={20} /> Laporan Aktif ({emergencies.length})
        </h2>
        <div className="grid gap-4">
            {emergencies.map(emergency => (
            <div key={emergency.id} className="p-5 bg-slate-900 border-2 border-red-900 rounded-2xl animate-pulse">
                <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                    {emergency.userName}
                    </h2>
                    <p className="text-slate-400 mt-1">{emergency.userPhone}</p>
                    <a 
                    href={`https://www.google.com/maps?q=${emergency.location.lat},${emergency.location.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 mt-2 hover:underline"
                    >
                    <MapPin size={16} /> Lihat Lokasi
                    </a>
                </div>
                <button 
                    onClick={() => handleResolve(emergency.id)}
                    className="bg-green-600 p-3 rounded-xl hover:bg-green-700 transition-colors"
                    title="Selesaikan"
                >
                    <CheckCircle />
                </button>
                </div>
            </div>
            ))}
            {emergencies.length === 0 && (
            <div className="text-center p-6 text-slate-600 border border-slate-800 rounded-2xl">
                Tidak ada laporan darurat aktif.
            </div>
            )}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-bold text-slate-400 mb-4 flex items-center gap-2">
            <History size={20} /> Riwayat Laporan
        </h2>
        <div className="grid gap-2">
          {history.map(item => (
              <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm flex justify-between items-center">
                  <span>{item.userName}</span>
                  <span className="text-slate-500">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="text-green-500 font-bold">Resolved</span>
              </div>
          ))}
          {history.length === 0 && (
            <div className="text-center p-4 text-slate-700 text-sm">
                Belum ada riwayat.
            </div>
            )}
        </div>
      </section>
    </div>
  );
};
