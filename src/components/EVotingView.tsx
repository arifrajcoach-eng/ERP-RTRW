import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Vote, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck,
  BarChart3,
  Users2,
  Settings2,
  FileText
} from "lucide-react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CandidateManagementView } from "./CandidateManagementView";

export function EVotingView({
  userRole,
  tenantId,
  candidates,
  config,
  userVotes,
  currentUser,
  wargaAuth,
  handleFirestoreError,
  handleFileUpload,
  showNotification,
}: {
  userRole: string;
  tenantId: string;
  candidates: any[];
  config: any;
  userVotes: any[];
  currentUser: any;
  wargaAuth: any;
  handleFirestoreError: any;
  handleFileUpload: (file: File, folder: string) => Promise<string>;
  showNotification: any;
  localTitleOverride?: string;
}) {
  const localTitleProp = arguments[0]?.localTitleOverride;
  const [activeView, setActiveView] = useState<"vote" | "admin">("vote");
  const [activeAdminTab, setActiveAdminTab] = useState<"stats" | "candidates" | "settings">("stats");
  const [electionLevel, setElectionLevel] = useState<"rt" | "rw">("rt");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<any | null>(null);
  const [localTitle, setLocalTitle] = useState(localTitleProp || "🗳️ E-PEMILU");
  const [now, setNow] = useState(new Date().getTime());
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoTitle, setInfoTitle] = useState(config?.infoTitle || "Pemilihan RW 26");
  const [infoDescription, setInfoDescription] = useState(config?.infoDescription || "Sistem pemilihan demokratis yang diawasi oleh pengawas RT/RW dan dijamin keamanannya.");

  React.useEffect(() => {
    if (config?.infoTitle) setInfoTitle(config.infoTitle);
    if (config?.infoDescription) setInfoDescription(config.infoDescription);
  }, [config?.infoTitle, config?.infoDescription]);

  React.useEffect(() => {
    if (config?.title) {
      setLocalTitle(config.title);
    } else if (localTitleProp) {
      setLocalTitle(localTitleProp);
    }
  }, [config?.title, localTitleProp]);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleUpper = userRole?.toUpperCase() || "";
  const isAdmin =
    roleUpper === "ADMIN" ||
    roleUpper === "SUPER_ADMIN" ||
    roleUpper === "OWNER" ||
    roleUpper === "RW" ||
    roleUpper === "RT";

  React.useEffect(() => {
    if (isAdmin && config?.status === "OPEN" && config?.closeTime) {
      if (now > new Date(config.closeTime).getTime()) {
        const updateAutoClose = async () => {
          try {
            await setDoc(doc(db, "voting_config", config?.id || tenantId), { status: "CLOSED" }, { merge: true });
            if (showNotification) showNotification("Voting otomatis ditutup sesuai batas waktu", "success");
          } catch(e) {}
        };
        updateAutoClose();
      }
    }
  }, [now, config?.status, config?.closeTime, config?.id, isAdmin, tenantId, showNotification]);

  const voterId = wargaAuth?.nik || currentUser?.uid;
  const filteredCandidates = (candidates || []).filter(c => (c.kategori || 'rt') === electionLevel);
  const userVote = (userVotes || []).find((v) => {
    if (v.voterId !== voterId) return false;
    const votedCand = (candidates || []).find(c => (c.docId || c.id) === v.candidateId);
    return (votedCand?.kategori || 'rt') === electionLevel;
  });

  const isVotingClosed = () => {
    if (config?.status !== "OPEN") return true;
    if (config?.closeTime) {
      if (now > new Date(config.closeTime).getTime()) {
        return true;
      }
    }
    return false;
  };

  const getStatusText = () => {
    if (config?.status !== "OPEN") return "● Voting Belum Dibuka";
    if (config?.closeTime && now > new Date(config.closeTime).getTime()) return "● Voting Selesai";
    return "● Voting Dibuka";
  };

  const calculateTimeLeftText = () => {
    if (isVotingClosed()) return "Waktu Habis";
    if (!config?.closeTime) return "Tak Terbatas";
    
    const diff = new Date(config.closeTime).getTime() - now;
    if (diff <= 0 || isNaN(diff)) return "Waktu Habis";
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return `${h} Jam : ${m} Menit`;
  };

  const calculateTimeLeftPercentage = () => {
    if (isVotingClosed() || !config?.closeTime || !config?.openTime) return 0;
    const total = new Date(config.closeTime).getTime() - new Date(config.openTime).getTime();
    const current = now - new Date(config.openTime).getTime();
    if (total <= 0 || isNaN(total) || isNaN(current)) return 0;
    const pct = ((total - current) / total) * 100;
    return Math.max(0, Math.min(100, pct));
  };
  
  const handleVote = async (cand: any) => {
    if (!voterId) {
      showNotification("Sistem Identitas Error. Silakan Login Ulang.", "error");
      return;
    }
    if (userVote) {
      showNotification("Anda sudah memberikan suara di pemilihan ini.", "error");
      return;
    }
    if (isVotingClosed()) {
      showNotification("Pemilihan belum dibuka atau sudah berkahir.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const voteId = `VOTE-${voterId}-${Date.now()}`;
      const candIdToUse = cand.docId || cand.id;
      
      await setDoc(doc(db, "voting_votes", voteId), {
        id: voteId,
        voterId,
        candidateId: candIdToUse,
        candidateName: cand.name,
        timestamp: new Date().toISOString(),
        tenantId,
      });

      // Update candidate local count
      await updateDoc(doc(db, "voting_candidates", candIdToUse), {
        votes: (cand.votes || 0) + 1,
      });

      showNotification("Terima kasih! Suara Anda telah terekam.", "success");
      setShowConfirm(null);
    } catch (err) {
      handleFirestoreError(err, "vote", "voting_votes");
    } finally {
      setIsLoading(false);
    }
  };

  const totalSuara = filteredCandidates.reduce((acc, c) => acc + (c.votes || 0), 0);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          {activeView === "admin" && isAdmin ? (
             <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter uppercase italic bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-blue w-full"
                  value={localTitle}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setLocalTitle(newTitle);
                    // Debounced update to avoid too many writes
                    clearTimeout((window as any).titleTimeout);
                    (window as any).titleTimeout = setTimeout(async () => {
                      if (!isAdmin) return;
                      try {
                        await setDoc(doc(db, "voting_config", config?.id || tenantId), { title: newTitle }, { merge: true });
                      } catch (err) {}
                    }, 500);
                  }}
                />
             </div>
          ) : (
             <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
               {config?.title || localTitle}
             </h2>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${!isVotingClosed() ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
            >
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {isAdmin && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveView("vote")}
                className={`px-6 py-2.5 rounded-xl text-[11px] flex-1 sm:flex-none font-black uppercase tracking-widest transition-all shadow-sm border ${activeView === "vote" ? "bg-gradient-to-r from-brand-blue to-indigo-600 text-white border-transparent" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-slate-200/80"}`}
              >
                Bilik Suara
              </button>
              <button
                onClick={() => setActiveView("admin")}
                className={`px-6 py-2.5 rounded-xl text-[11px] flex-1 sm:flex-none font-black uppercase tracking-widest transition-all shadow-sm border ${activeView === "admin" ? "bg-gradient-to-r from-brand-blue to-indigo-600 text-white border-transparent" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-slate-200/80"}`}
              >
                Panel Kontrol
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-3xl border border-slate-200 mb-8 max-w-sm mt-[-10px]">
        <button
          onClick={() => setElectionLevel("rt")}
          className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${electionLevel === "rt" ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"}`}
        >
          Pilihan RT
        </button>
        <button
          onClick={() => setElectionLevel("rw")}
          className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${electionLevel === "rw" ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"}`}
        >
          Pilihan RW
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {activeView === "vote" ? (
            <>
              {userVote ? (
                <div className="bg-emerald-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white/30">
                      <Vote className="w-12 h-12" />
                    </div>
                    <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">
                      Partisipasi Berhasil!
                    </h3>
                    <p className="text-emerald-100 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                      Anda telah memberikan hak suara secara sah melalui sistem
                      enkripsi warga. Hasil pemilihan akan diumumkan setelah bilik
                      suara ditutup secara resmi.
                    </p>
                    <div className="bg-white/10 p-6 rounded-3xl border border-white/10 inline-block">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                        Token Pilihan Anda
                      </p>
                      <p className="text-lg font-mono font-black tracking-widest">
                        {userVote.id.split("-").pop()?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-6 md:col-span-2 lg:col-span-3">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-4 border-slate-100 italic">
                    <Vote className="w-10 h-10 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                      Belum Ada Kandidat
                    </h3>
                    <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto mt-2">
                      Daftar calon pemimpin untuk level pemilihan <strong>{electionLevel.toUpperCase()}</strong> belum tersedia atau belum didaftarkan.
                    </p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setActiveView("admin");
                        setActiveAdminTab("candidates");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                    >
                      Daftarkan Kandidat Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredCandidates.map((cand) => (
                    <motion.div
                      key={cand.id}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col group transition-all hover:border-brand-blue/30"
                    >
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img
                          src={cand.photo || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400"}
                          alt={cand.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-8 right-8">
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 block">
                            Kandidat No. {cand.number || "0"}
                          </span>
                          <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                            {cand.name}
                          </h4>
                        </div>
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-4 mb-8">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">
                              Visi Utama
                            </p>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic line-clamp-3">
                              "{cand.vision}"
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">
                              Program Prioritas
                            </p>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed truncate">
                              {cand.mission}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowConfirm(cand)}
                          disabled={isVotingClosed()}
                          className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:grayscale disabled:opacity-50 ${
                            isVotingClosed() 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                            : "bg-brand-blue text-white shadow-xl shadow-blue-100 hover:bg-blue-600"
                          }`}
                        >
                          {isVotingClosed() ? "Voting Belum Dibuka" : "Pilih Kandidat"} 
                          {!isVotingClosed() && <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div 
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden"
              style={{ height: '568.629px', paddingTop: '82px' }}
            >
              {/* Premium Document Suite Menu */}
              <div 
                className="flex flex-col xl:flex-row xl:items-center gap-6 mb-10 pb-6 border-b border-slate-100"
                style={{ paddingBottom: '24px', marginTop: '-68px' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">Panel Administrasi</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-Pemilu Document Suite</p>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 w-full sm:w-max xl:w-auto">
                    <button
                      onClick={() => setActiveAdminTab("stats")}
                      className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative group shrink-0 ${
                        activeAdminTab === "stats" 
                          ? "bg-white text-brand-blue shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <BarChart3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 ${activeAdminTab === "stats" ? "text-brand-blue" : "text-slate-400"}`} />
                      <span className="hidden sm:inline">Statistik</span>
                      {activeAdminTab === "stats" && (
                        <motion.div layoutId="activeTabPill" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("candidates")}
                      className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative group shrink-0 ${
                        activeAdminTab === "candidates" 
                          ? "bg-white text-brand-blue shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Users2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 ${activeAdminTab === "candidates" ? "text-brand-blue" : "text-slate-400"}`} />
                      <span className="hidden sm:inline">Kandidat</span>
                      {activeAdminTab === "candidates" && (
                        <motion.div layoutId="activeTabPill" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("settings")}
                      className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative group shrink-0 ${
                        activeAdminTab === "settings" 
                          ? "bg-white text-brand-blue shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                      style={{ 
                        height: '54.3466px',
                        width: '82.148px', 
                        paddingTop: '11px', 
                        paddingLeft: '5px'
                      }}
                    >
                      <Settings2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 ${activeAdminTab === "settings" ? "text-brand-blue" : "text-slate-400"}`} />
                      <span className="hidden sm:inline">Pengaturan</span>
                      {activeAdminTab === "settings" && (
                        <motion.div layoutId="activeTabPill" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {activeAdminTab === "candidates" ? (
                <CandidateManagementView
                  tenantId={tenantId}
                  candidates={filteredCandidates}
                  showNotification={showNotification}
                  handleFileUpload={handleFileUpload}
                  activeElectionLevel={electionLevel}
                />
              ) : activeAdminTab === "settings" ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Judul Pemilihan</label>
                    <input
                      type="text"
                      className="w-full p-3 text-lg font-bold text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-blue"
                      value={localTitle}
                      onChange={(e) => {
                        setLocalTitle(e.target.value);
                        clearTimeout((window as any).titleTimeout);
                        (window as any).titleTimeout = setTimeout(async () => {
                          try { await setDoc(doc(db, "voting_config", config?.id || tenantId), { title: e.target.value }, { merge: true }); } catch (err) {}
                        }, 500);
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Sub-Judul Info</label>
                      <input
                        type="text"
                        className="w-full p-3 text-sm font-bold text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-blue"
                        placeholder="e.g. Pemilihan RW 26"
                        value={infoTitle}
                        onChange={(e) => {
                          setInfoTitle(e.target.value);
                          clearTimeout((window as any).infoTitleTimeout);
                          (window as any).infoTitleTimeout = setTimeout(async () => {
                            try { await setDoc(doc(db, "voting_config", config?.id || tenantId), { infoTitle: e.target.value }, { merge: true }); } catch (err) {}
                          }, 500);
                        }}
                      />
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Deskripsi Info</label>
                      <textarea
                        className="w-full p-3 text-sm font-bold text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-brand-blue min-h-[46px]"
                        placeholder="Deskripsi singkat pemilihan..."
                        value={infoDescription}
                        onChange={(e) => {
                          setInfoDescription(e.target.value);
                          clearTimeout((window as any).infoDescTimeout);
                          (window as any).infoDescTimeout = setTimeout(async () => {
                            try { await setDoc(doc(db, "voting_config", config?.id || tenantId), { infoDescription: e.target.value }, { merge: true }); } catch (err) {}
                          }, 500);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Deadline (Waktu Tutup)</label>
                      <input
                        type="datetime-local"
                        className="w-full p-3 text-xs border border-slate-200 rounded-lg outline-none focus:border-brand-blue"
                        value={config?.closeTime || ""}
                        onChange={async (e) => {
                          try {
                             await setDoc(doc(db, "voting_config", config?.id || tenantId), { closeTime: e.target.value }, { merge: true });
                             showNotification("Waktu tutup otomatis diperbarui", "success");
                          } catch(err) {}
                        }}
                      />
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Status Bilik</label>
                      <button
                        onClick={async () => {
                          const newStatus = config?.status === "OPEN" ? "CLOSED" : "OPEN";
                          const updateData: any = { status: newStatus };
                          if (newStatus === "OPEN") {
                            updateData.openTime = new Date().toISOString();
                          }
                          try {
                            await setDoc(doc(db, "voting_config", config?.id || tenantId), updateData, { merge: true });
                            showNotification(newStatus === "OPEN" ? "Bilik suara dibuka." : "Bilik suara ditutup.", "success");
                          } catch(e) {
                            showNotification("Gagal mengubah status", "error");
                          }
                        }}
                        className={`w-full p-4 rounded-xl font-black uppercase tracking-widest transition-all border ${config?.status === "OPEN" ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-sm" : "bg-white hover:bg-slate-50 text-brand-blue border-slate-200 shadow-sm"}`}
                        style={{ fontSize: '11px', textAlign: 'center' }}
                      >
                        {config?.status === "OPEN" ? "Tutup Voting" : "Buka Voting"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const csvRows = [];
                      csvRows.push("Kandidat,Nomor Urut,Total Suara,Persentase");
                      const totalVotes = filteredCandidates.reduce((acc, c) => acc + (c.votes || 0), 0);
                      filteredCandidates.forEach(c => {
                        const pct = totalVotes > 0 ? ((c.votes || 0) / totalVotes * 100).toFixed(1) + "%" : "0%";
                        csvRows.push(`"${c.name}",${c.number},${c.votes || 0},${pct}`);
                      });
                      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `Hasil_Pemilihan_${electionLevel.toUpperCase()}_${config?.title || 'E-PEMILU'}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full bg-brand-blue text-white px-6 py-4 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all font-bold"
                  >
                    Download Hasil CSV
                  </button>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Pengaturan Informasi Sidepanel</label>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Judul Info</label>
                      <input
                        type="text"
                        className="w-full p-2 text-xs font-bold border border-slate-200 rounded-lg"
                        value={infoTitle}
                        onChange={(e) => setInfoTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Deskripsi Info</label>
                      <textarea
                        className="w-full p-2 text-[10px] border border-slate-200 rounded-lg min-h-[80px]"
                        value={infoDescription}
                        onChange={(e) => setInfoDescription(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, "voting_config", config?.id || tenantId), {
                            infoTitle,
                            infoDescription
                          });
                          showNotification("Informasi sidepanel diperbarui", "success");
                        } catch (err) {
                          showNotification("Gagal memperbarui informasi", "error");
                        }
                      }}
                      className="w-full py-2 bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-700"
                    >
                      Update Informasi Sidepanel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <h3 
                      className="text-xl font-black text-slate-800 uppercase italic flex-1"
                      style={{ marginTop: '-38px', fontSize: '17px', textAlign: 'center' }}
                    >
                      Statistik Perolehan Suara
                    </h3>
                  </div>

              <div className="space-y-6">
                {filteredCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="flex flex-col md:flex-row items-center gap-6 p-6 border border-slate-50 rounded-3xl hover:bg-slate-50/50 transition-all"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                      <img src={cand.photo} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-slate-800">
                        {cand.name}
                      </h4>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${totalSuara > 0 ? (cand.votes / totalSuara) * 100 : 0}%`,
                            }}
                            className="h-full bg-brand-blue"
                          />
                        </div>
                        <span className="text-sm font-black text-slate-400">
                          {totalSuara > 0
                            ? Math.round((cand.votes / totalSuara) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="text-center px-6 border-l border-slate-100 hidden md:block">
                      <p className="text-2xl font-black text-slate-800 tracking-tighter">
                        {cand.votes || 0}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Suara
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl opacity-50"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 font-mono">
              Status Bilik Suara
            </h3>
            <div className="space-y-10">
              <div>
                <p className="text-5xl font-black tracking-tighter mb-2 italic">
                  {totalSuara}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                  Total Partisipasi Masuk
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span className="opacity-50">Tingkat Partisipasi</span>
                    <span className="text-indigo-400">76%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[76%] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span className="opacity-50">Waktu Tersisa</span>
                    <span className="text-red-400">{calculateTimeLeftText()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: `${calculateTimeLeftPercentage()}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Informasi Pemilihan
              </h3>
              {isAdmin && activeView === "admin" && (
                <button 
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="text-[9px] font-black uppercase text-brand-blue hover:underline"
                >
                  {isEditingInfo ? "Selesai" : "Edit"}
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                {isEditingInfo && isAdmin ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      className="w-full p-2 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-brand-blue"
                      value={infoTitle}
                      onChange={(e) => {
                        setInfoTitle(e.target.value);
                        clearTimeout((window as any).infoTitleTimeout);
                        (window as any).infoTitleTimeout = setTimeout(async () => {
                          try { await setDoc(doc(db, "voting_config", config?.id || tenantId), { infoTitle: e.target.value }, { merge: true }); } catch (err) {}
                        }, 500);
                      }}
                    />
                    <textarea
                      className="w-full p-2 text-[10px] border border-slate-200 rounded-lg outline-none focus:border-brand-blue min-h-[60px]"
                      value={infoDescription}
                      onChange={(e) => {
                        setInfoDescription(e.target.value);
                        clearTimeout((window as any).infoDescTimeout);
                        (window as any).infoDescTimeout = setTimeout(async () => {
                          try { await setDoc(doc(db, "voting_config", config?.id || tenantId), { infoDescription: e.target.value }, { merge: true }); } catch (err) {}
                        }, 500);
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">
                      {config?.infoTitle || infoTitle}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                      {config?.infoDescription || infoDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 max-w-md w-full relative z-10 shadow-3xl text-center"
            >
              <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden mx-auto mb-8 shadow-2xl ring-4 ring-slate-50">
                <img
                  src={showConfirm.photo}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2">
                Konfirmasi Pilihan
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
                Yakin dengan pilihan <span className="text-brand-blue">"{showConfirm.name}"</span>?
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleVote(showConfirm)}
                  disabled={isLoading}
                  className="w-full py-5 bg-brand-blue text-white rounded-2.5xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Vote className="w-5 h-5" /> Ya, Saya Yakin!
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="w-full py-5 bg-slate-50 text-slate-600 rounded-2.5xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-bold"
                >
                  Mungkin Nanti
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Pilihan Anda bersifat
                Rahasia & Anonim
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
