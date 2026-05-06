import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { EmergencyLog } from '../types';
import { ShieldAlert, MapPin, Phone, CheckCircle } from 'lucide-react';

export const SatpamDashboard: React.FC = () => {
  const [emergencies, setEmergencies] = useState<EmergencyLog[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'emergency_logs'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyLog));
      setEmergencies(logs);
    });
    return () => unsubscribe();
  }, []);

  const handleResolve = async (id: string) => {
    await updateDoc(doc(db, 'emergency_logs', id), { status: 'resolved' });
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-6">Dashboard Satpam</h1>
      <div className="grid gap-4">
        {emergencies.map(emergency => (
          <div key={emergency.id} className="p-5 bg-slate-900 border-2 border-red-900 rounded-2xl animate-pulse">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldAlert className="text-red-500" />
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
          <div className="text-center p-10 text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
            Tidak ada laporan darurat.
          </div>
        )}
      </div>
    </div>
  );
};
