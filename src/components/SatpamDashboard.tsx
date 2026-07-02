import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { EmergencyLog } from '../types';
import { ShieldAlert, MapPin, CheckCircle, History, Clock, Phone, Map as MapIcon, Bell, Trash2 } from 'lucide-react';
import { SOSDashboardMap } from './SOSDashboardMap';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: (auth.currentUser as any)?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface SatpamDashboardProps {
  tenantId: string;
  activeTenantIds?: string[];
  pushSubscriptionStatus?: string;
  requestPushPermission?: () => void;
}

export const SatpamDashboard: React.FC<SatpamDashboardProps> = ({ 
  tenantId,
  activeTenantIds = [],
  pushSubscriptionStatus,
  requestPushPermission
}) => {
  const [emergencies, setEmergencies] = useState<EmergencyLog[]>([]);
  const [history, setHistory] = useState<EmergencyLog[]>([]);
  const lastNotificationIdRef = useRef<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Stable string representation of active tenant IDs for useEffect dependencies
  const activeTenantIdsStr = (activeTenantIds || []).slice().sort().join(",");

  const handleNoteChange = (id: string, value: string) => {
    setNotesState(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveNote = async (id: string) => {
    const note = notesState[id] !== undefined ? notesState[id] : (emergencies.find(e => e.id === id)?.locationNotes || "");
    try {
      await updateDoc(doc(db, 'emergency_logs', id), { 
        locationNotes: note
      });
      
      try {
        await updateDoc(doc(db, 'emergencies', id), { 
          locationNotes: note
        });
      } catch (eCent) {
        console.warn("Central emergencies notes sync failed:", eCent);
      }
      
      setSavedStatus(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedStatus(prev => ({ ...prev, [id]: false }));
      }, 2500);
    } catch (e) {
      console.error("Error saving location notes:", e);
      handleFirestoreError(e, OperationType.UPDATE, `emergency_logs/${id}`);
    }
  };

  // Sound effect helper - Synthesize native siren sound using Web Audio API
  const playSOSSounds = () => {
    // Vibrate HP if supported
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // We will create a clean siren sound using an oscillator swept by an LFO
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime); // Base frequency 600Hz
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2.5, ctx.currentTime); // 2.5Hz sweep rate
      lfoGain.gain.setValueAtTime(150, ctx.currentTime); // +/- 150Hz sweep range
      
      // Connect LFO to oscillator frequency
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      // Control volume and fade out smoothly over 2 seconds
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      lfo.start();
      osc.start();
      
      lfo.stop(ctx.currentTime + 2.0);
      osc.stop(ctx.currentTime + 2.0);
    } catch (err) {
      console.warn("Web Audio API siren generation failed: ", err);
    }
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
    
    // Fetch all pending logs globally, then filter by tenantId in memory.
    // This avoids needing complex multi-field Firestore indexes.
    const qPending = query(
      collection(db, 'emergency_logs'), 
      where('status', '==', 'pending')
    );

    const idsToQuery = activeTenantIds && activeTenantIds.length > 0 ? activeTenantIds : [tenantId];

    const unsubscribe = onSnapshot(qPending, (snapshot) => {
      let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyLog));
      
      // Filter by tenantId unless MASTER view
      if (tenantId !== "MASTER") {
        logs = logs.filter(log => log.tenantId && idsToQuery.includes(log.tenantId));
      }

      // Sort pending logs by timestamp descending
      const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Check for new emergency safely using ref
      if (sortedLogs.length > 0 && sortedLogs[0].id !== lastNotificationIdRef.current) {
          playSOSSounds();
          lastNotificationIdRef.current = sortedLogs[0].id;
      }
      
      setEmergencies(sortedLogs);
    }, (err) => {
      console.error("Error subscribing to qPending:", err);
    });
    return () => unsubscribe();
  }, [tenantId, activeTenantIdsStr]);

  useEffect(() => {
    if (!tenantId) return;
    
    // Fetch latest 200 logs globally sorted by timestamp descending, then filter by tenantId in memory.
    // This avoids needing complex composite indexes while guaranteeing we always get the newest logs first (and not old, alphabetical ones).
    const qResolved = query(
      collection(db, 'emergency_logs'), 
      orderBy('timestamp', 'desc'),
      limit(200)
    );

    const idsToQuery = activeTenantIds && activeTenantIds.length > 0 ? activeTenantIds : [tenantId];

    const unsubscribe = onSnapshot(qResolved, (snapshot) => {
      let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyLog));
      
      // Filter by tenantId unless MASTER view
      if (tenantId !== "MASTER") {
        logs = logs.filter(log => log.tenantId && idsToQuery.includes(log.tenantId));
      }

      // Sort in-memory to be absolutely sure they are sorted by timestamp desc
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(logs);
    }, (err) => {
      console.error("Error subscribing to qResolved:", err);
    });
    return () => unsubscribe();
  }, [tenantId, activeTenantIdsStr]);

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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'emergency_logs', id));
      try {
        await deleteDoc(doc(db, 'emergencies', id));
      } catch (eCent) {
        console.warn("Central emergencies delete failed (non-blocking):", eCent);
      }
      setConfirmDeleteId(null);
    } catch (e) {
      console.error("Error deleting emergency log:", e);
      handleFirestoreError(e, OperationType.DELETE, `emergency_logs/${id}`);
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
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 relative z-10 w-full">
                <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white">
                        {emergency.userName}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 bg-red-600/20 text-red-400 font-extrabold uppercase tracking-widest rounded-full border border-red-500/20 animate-pulse">
                        Laporan SOS Aktif
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-400 text-sm font-medium">
                      <p className="flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-500" /> {emergency.userPhone}
                      </p>
                      {/* Jam & Tanggal Laporan */}
                      <p className="text-xs font-bold text-red-400/95 font-mono flex items-center gap-1.5 uppercase tracking-wide">
                        <Clock size={14} className="text-red-500 shrink-0 animate-pulse" />
                        {formatDateTime(emergency.timestamp)}
                      </p>
                    </div>

                    {/* DETAIL LOKASI TERAKHIR & ALAMAT KEJADIAN */}
                    <div className="space-y-2 p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 shadow-inner">
                      <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                        <MapPin size={14} /> Informasi Lokasi Terakhir
                      </h4>
                      {emergency.userAddress && (
                        <p className="text-xs text-slate-200 leading-relaxed">
                          <span className="font-extrabold text-slate-400 uppercase tracking-tight text-[10px] block mb-0.5">Alamat Terdaftar Warga:</span>
                          <span className="font-medium">{emergency.userAddress}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-900/50 p-2 rounded-xl border border-slate-800/30">
                        <span className="font-extrabold text-slate-500 block mb-1 uppercase tracking-wider text-[9px]">Sinyal & Koordinat GPS Kejadian:</span>
                        <span className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span>
                            {emergency.userLocation || (
                              `📍 Koordinat GPS: ${emergency.location?.lat?.toFixed(6) ?? 0}, ${emergency.location?.lng?.toFixed(6) ?? 0}`
                            )}
                          </span>
                          {emergency.location && typeof emergency.location.lat === 'number' && typeof emergency.location.lng === 'number' && (
                            <a 
                              href={`https://www.google.com/maps?q=${emergency.location.lat},${emergency.location.lng}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-blue-500/10 text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 transition-all font-bold text-[9px] uppercase tracking-wider sm:ml-2 w-fit cursor-pointer"
                              title="Buka titik koordinat di Google Maps"
                            >
                              <MapIcon size={10} />
                              Buka di Maps
                            </a>
                          )}
                        </span>
                      </p>
                    </div>

                    {/* FORM INPUT CATATAN / KETERANGAN KEJADIAN */}
                    <div className="pt-2 space-y-2 max-w-2xl">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        ✍️ Keterangan / Catatan Tambahan Lokasi Kejadian:
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={notesState[emergency.id] ?? emergency.locationNotes ?? ""} 
                          onChange={(e) => handleNoteChange(emergency.id, e.target.value)}
                          placeholder="Contoh: Kejadian di gang mawar RT 01 dekat pos keamanan, warga terpeleset..."
                          className="flex-1 bg-slate-950/90 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                        />
                        <button 
                          onClick={() => handleSaveNote(emergency.id)}
                          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-black uppercase tracking-wider px-4 py-2 text-white rounded-xl transition-all cursor-pointer border-none shrink-0"
                        >
                          Simpan Catatan
                        </button>
                      </div>
                      {savedStatus[emergency.id] && (
                        <span className="text-xs text-green-400 font-bold block animate-fade-in-out">
                          ✓ Catatan Lokasi Kejadian Berhasil Disimpan
                        </span>
                      )}
                    </div>
                    
                    <div className="pt-3">
                      {(() => {
                        const lat = emergency.location?.lat ?? (emergency as any).latitude ?? (emergency as any).lat ?? 0;
                        const lng = emergency.location?.lng ?? (emergency as any).longitude ?? (emergency as any).lng ?? 0;
                        return (
                          <a 
                            href={`https://www.google.com/maps?q=loc:${lat},${lng}&z=19`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-extrabold bg-slate-900/90 hover:bg-red-950/60 text-blue-400 hover:text-red-400 border border-slate-800/80 hover:border-red-500/30 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg"
                          >
                            <MapPin size={14} className="text-red-500" /> Buka di Google Maps
                          </a>
                        );
                      })()}
                    </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-start">
                  <button 
                      onClick={() => handleResolve(emergency.id)}
                      className="bg-green-600 p-3.5 rounded-2xl hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-green-950/40 cursor-pointer border-none flex items-center justify-center"
                      title="Selesaikan"
                  >
                      <CheckCircle className="w-5 h-5 text-white" />
                  </button>
                  {confirmDeleteId === emergency.id ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(emergency.id)}
                        className="bg-red-600 text-white p-3.5 rounded-2xl font-bold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                      >
                        Yakin?
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-slate-700 text-white p-3.5 rounded-2xl font-bold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button 
                        onClick={() => setConfirmDeleteId(emergency.id)}
                        className="bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white p-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95 border border-red-900/40 hover:border-red-600 shadow-md cursor-pointer flex items-center justify-center"
                        title="Hapus Laporan"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
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
              <div key={item.id} className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 transition-colors hover:bg-slate-900/80 shadow-md">
                  <div className="space-y-2 flex-1 w-full">
                    <span className="font-extrabold text-sm text-slate-200 tracking-wide block">{item.userName}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-600" />
                        Lapor: {formatDateTime(item.timestamp)}
                      </span>
                      {item.resolvedAt && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle size={12} className="text-emerald-500" />
                          Selesai: {formatDateTime(item.resolvedAt)}
                        </span>
                      )}
                    </div>
                    
                    {(item.userAddress || item.userLocation) && (
                      <div className="text-[11px] text-slate-400 leading-normal font-medium bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40 space-y-1">
                        {item.userAddress && (
                          <p className="text-slate-300">
                            <span className="font-extrabold text-slate-500">Alamat:</span> {item.userAddress}
                          </p>
                        )}
                        <div className="text-slate-400 font-mono text-[10px] flex flex-col sm:flex-row sm:items-center gap-2">
                          <div>
                            <span className="font-extrabold text-slate-500">Lokasi:</span> {item.userLocation || `📍 Koordinat GPS: ${item.location?.lat?.toFixed(6) ?? 0}, ${item.location?.lng?.toFixed(6) ?? 0}`}
                          </div>
                          {item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number' && (
                            <a 
                              href={`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-blue-500/10 text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 transition-all font-bold text-[9px] uppercase tracking-wider w-fit cursor-pointer"
                              title="Buka titik koordinat di Google Maps"
                            >
                              <MapIcon size={10} />
                              Buka di Maps
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {item.locationNotes && (
                      <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-900/25 text-[11px] text-slate-200 leading-relaxed">
                        <span className="font-black uppercase tracking-wider text-blue-400 block mb-0.5 text-[9px]">Catatan Kejadian / Lokasi Terakhir:</span>
                        <span className="font-medium italic">"{item.locationNotes}"</span>
                      </div>
                    )}
                  </div>
                   <div className="flex sm:flex-col items-end gap-2 self-start sm:self-auto shrink-0">
                    {item.status === 'pending' ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-2.5 py-1.5 rounded-full border border-red-500/20 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-full border border-emerald-500/10">
                        <CheckCircle size={12} />
                        Resolved
                      </div>
                    )}
                    {confirmDeleteId === item.id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-md transition-all hover:scale-105 cursor-pointer"
                        >
                          Yakin?
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-slate-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-md transition-all hover:scale-105 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="text-red-400 hover:text-white hover:bg-red-950/60 p-2 rounded-xl transition-all border border-transparent hover:border-red-900/40 cursor-pointer flex items-center justify-center shrink-0"
                        title="Hapus Riwayat"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
