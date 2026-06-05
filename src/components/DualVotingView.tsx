import React, { useState, useEffect } from "react";
import { EVotingView } from "./EVotingView";
import { ElectionAnnouncementBoard } from "./ElectionAnnouncementBoard";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";

export function DualVotingView(props: any) {
  const { currentUser, wargaAuth, tenantsData } = props;
  const currentTenantId = currentUser?.tenantId || wargaAuth?.tenantId;
  const myTenant = tenantsData.find((t: any) => t.id === currentTenantId);
  const parentTenantId = myTenant?.parentId;
  const [activeTab, setActiveTab] = useState<"rt" | "rw">("rt");

  // RW State
  const [rwConfig, setRwConfig] = useState(null);
  const [rwCandidates, setRwCandidates] = useState([]);
  const [rwVotes, setRwVotes] = useState([]);

  useEffect(() => {
    if (!parentTenantId) return;

    // Fetch config
    const unsubConfig = onSnapshot(doc(db, "voting_config", parentTenantId), (snap) => {
       if (snap.exists()) setRwConfig(snap.data());
    });

    // Fetch candidates
    const unsubCandidates = onSnapshot(query(collection(db, "voting_candidates"), where("tenantId", "==", parentTenantId)), (snap) => {
       setRwCandidates(snap.docs.map((doc) => doc.data()));
    });

    // Fetch votes
    const unsubVotes = onSnapshot(query(collection(db, "voting_votes"), where("tenantId", "==", parentTenantId)), (snap) => {
       setRwVotes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubConfig();
      unsubCandidates();
      unsubVotes();
    };
  }, [parentTenantId]);

  return (
    <div className="space-y-8">
        <ElectionAnnouncementBoard tenantId={currentTenantId} currentUser={currentUser} />
        
        <div className="bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden backdrop-blur-3xl">
          <div className="flex border-b border-slate-200/60 dark:border-slate-800/60 font-elegant overflow-x-auto scrollbar-hide py-2 px-2 bg-white/50 dark:bg-slate-900/50">
            <button
              onClick={() => setActiveTab("rt")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[2rem] transition-all duration-300 ${activeTab === "rt" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "hover:bg-slate-100 hover:text-slate-900 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800"}`}
            >
              Voting Lingkungan RT
            </button>
            {parentTenantId && (
              <button
                onClick={() => setActiveTab("rw")}
                 className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[2rem] transition-all duration-300 ${activeTab === "rw" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-slate-100 hover:text-slate-900 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800"}`}
              >
                Voting Pimpinan RW
              </button>
            )}
          </div>
          <div className="p-0 sm:p-2 bg-slate-50/20 dark:bg-slate-950/20">
            {activeTab === "rt" ? (
              <div className="bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-sm sm:border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-full blur-3xl pointer-events-none"></div>
                <EVotingView {...props} localTitleOverride="🗳️ Pemilihan Ketua RT" />
              </div>
            ) : (
              parentTenantId && (
                 <div className="bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-sm sm:border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-full blur-3xl pointer-events-none"></div>
                    <EVotingView 
                      {...props} 
                      tenantId={parentTenantId}
                      config={rwConfig}
                      candidates={rwCandidates}
                      userVotes={rwVotes}
                      localTitleOverride="🗳️ Pemilihan Ketua RW"
                    />
                 </div>
              )
            )}
          </div>
        </div>
    </div>
  );
}
