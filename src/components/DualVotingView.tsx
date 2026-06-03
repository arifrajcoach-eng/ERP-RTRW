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
    <div className="p-6 space-y-8">
        <ElectionAnnouncementBoard tenantId={currentTenantId} currentUser={currentUser} />
        
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("rt")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest ${activeTab === "rt" ? "bg-brand-blue text-white" : "hover:bg-slate-50 text-slate-600"}`}
            >
              Voting RT
            </button>
            {parentTenantId && (
              <button
                onClick={() => setActiveTab("rw")}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest ${activeTab === "rw" ? "bg-brand-blue text-white" : "hover:bg-slate-50 text-slate-600"}`}
              >
                Voting RW
              </button>
            )}
          </div>
          <div className="p-8">
            {activeTab === "rt" ? (
              <EVotingView {...props} />
            ) : (
              parentTenantId && (
                <EVotingView 
                  {...props} 
                  tenantId={parentTenantId}
                  config={rwConfig}
                  candidates={rwCandidates}
                  userVotes={rwVotes}
                />
              )
            )}
          </div>
        </div>
    </div>
  );
}
