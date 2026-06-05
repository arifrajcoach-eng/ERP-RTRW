import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Vote, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck 
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
  const filteredCandidates = candidates.filter(c => (c.kategori || 'rt') === electionLevel);
  const userVote = userVotes.find((v) => {
    if (v.voterId !== voterId) return false;
    const votedCand = candidates.find(c => c.id === v.candidateId);
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
      await setDoc(doc(db, "voting_votes", voteId), {
        id: voteId,
        voterId,
        candidateId: cand.id,
        candidateName: cand.name,
        timestamp: new Date().toISOString(),
        tenantId,
      });

      // Simple implementation: update candidate local count (demo only)
      await updateDoc(doc(db, "voting_candidates", cand.id), {
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
              {!isVotingClosed() ? "● Voting Dibuka" : "● Voting Selesai"}
            </span>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Digital Voting
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {isAdmin && (
            <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200 w-full sm:w-auto">
              <button
                onClick={() => setActiveView("vote")}
                className={`px-6 py-2 rounded-xl text-[10px] flex-1 sm:flex-none font-black uppercase tracking-widest transition-all ${activeView === "vote" ? "bg-gradient-to-r from-brand-blue to-indigo-600 text-white shadow-lg shadow-brand-blue/30" : "bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200/50"}`}
              >
                Bilik Suara
              </button>
              <button
                onClick={() => setActiveView("admin")}
                className={`px-6 py-2 rounded-xl text-[10px] flex-1 sm:flex-none font-black uppercase tracking-widest transition-all ${activeView === "admin" ? "bg-gradient-to-r from-brand-blue to-indigo-600 text-white shadow-lg shadow-brand-blue/30" : "bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200/50"}`}
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
                          className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:grayscale"
                        >
                          Pilih Kandidat <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setActiveAdminTab("stats")}
                  className={`px-4 py-2 rounded-lg text-xs font-black ${
                    activeAdminTab === "stats" ? "bg-slate-200" : "hover:bg-slate-100"
                  }`}
                >
                  Statistik
                </button>
                <button
                  onClick={() => setActiveAdminTab("candidates")}
                  className={`px-4 py-2 rounded-lg text-xs font-black ${
                    activeAdminTab === "candidates" ? "bg-slate-200" : "hover:bg-slate-100"
                  }`}
                >
                  Manajemen Kandidat
                </button>
                <button
                  onClick={() => setActiveAdminTab("settings")}
                  className={`px-4 py-2 rounded-lg text-xs font-black ${
                    activeAdminTab === "settings" ? "bg-slate-200" : "hover:bg-slate-100"
                  }`}
                >
                  Pengaturan
                </button>
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
                        className={`w-full p-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${config?.status === "OPEN" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
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
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <h3 className="text-xl font-black text-slate-800 uppercase italic flex-1">
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
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Informasi Pemilihan
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">
                    Pemilihan RW 26
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                    Sistem pemilihan demokratis yang diawasi oleh pengawas RT/RW dan dijamin keamanannya.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">
                    Satu Suara Per Identitas
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                    Sistem menggunakan NIK/Email yang terverifikasi untuk memastikan integritas data.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-pulse">
                "Pilihan Anda Menentukan Masa Depan Kita"
              </p>
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
