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
}) {
  const [activeView, setActiveView] = useState<"vote" | "admin">("vote");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<any | null>(null);

  const roleUpper = userRole?.toUpperCase() || "";
  const isAdmin =
    roleUpper === "ADMIN" ||
    roleUpper === "SUPER_ADMIN" ||
    roleUpper === "OWNER" ||
    roleUpper === "RW" ||
    roleUpper === "RT";

  const voterId = wargaAuth?.nik || currentUser?.uid;
  const userVote = userVotes.find((v) => v.voterId === voterId);

  const handleVote = async (cand: any) => {
    if (!voterId) {
      showNotification("Sistem Identitas Error. Silakan Login Ulang.", "error");
      return;
    }
    if (userVote) {
      showNotification("Anda sudah memberikan suara di pemilihan ini.", "error");
      return;
    }
    if (config?.status !== "OPEN") {
      showNotification("Pemilihan belum dibuka atau sudah berakhir.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const voteId = `VOTE-${voterId}-${Date.now()}`;
      await setDoc(doc(db, "evoting_votes", voteId), {
        id: voteId,
        voterId,
        candidateId: cand.id,
        candidateName: cand.name,
        timestamp: new Date().toISOString(),
        tenantId,
      });

      // Simple implementation: update candidate local count (demo only)
      await updateDoc(doc(db, "evoting_candidates", cand.id), {
        votes: (cand.votes || 0) + 1,
      });

      showNotification("Terima kasih! Suara Anda telah terekam.", "success");
      setShowConfirm(null);
    } catch (err) {
      handleFirestoreError(err, "vote", "evoting_votes");
    } finally {
      setIsLoading(false);
    }
  };

  const totalSuara = candidates.reduce((acc, c) => acc + (c.votes || 0), 0);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
            🗳️ E-DEMOKRASI 26
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config?.status === "OPEN" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
            >
              {config?.status === "OPEN" ? "● Voting Dibuka" : "● Voting Selesai"}
            </span>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Digital Secure Voting System
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
            <button
              onClick={() => setActiveView("vote")}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "vote" ? "bg-brand-blue text-white shadow-xl shadow-blue-100" : "text-slate-400 hover:text-slate-600"}`}
            >
              Bilik Suara
            </button>
            <button
              onClick={() => setActiveView("admin")}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "admin" ? "bg-brand-blue text-white shadow-xl shadow-blue-100" : "text-slate-400 hover:text-slate-600"}`}
            >
              Panel Kontrol
            </button>
          </div>
        )}
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
                  {candidates.map((cand) => (
                    <motion.div
                      key={cand.id}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col group transition-all hover:border-brand-blue/30"
                    >
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img
                          src={cand.photo || "https://via.placeholder.com/400"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-8 right-8">
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 block">
                            Kandidat No. {cand.pomer || "0"}
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
                          disabled={config?.status !== "OPEN"}
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
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                  Manajemen Pemilihan
                </h3>
                <button
                  className="bg-brand-blue text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  Download Hasil Real-time
                </button>
              </div>

              <div className="space-y-6">
                {candidates.map((cand) => (
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
                    <span className="text-red-400">24 Jam : 12 Menit</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 w-[40%]"></div>
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
