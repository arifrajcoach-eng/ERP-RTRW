import React, { useState } from "react";
import { motion } from "motion/react";
import { PlusCircle, Trash2, Edit2, X, Save, Upload } from "lucide-react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Candidate {
  id: string;
  name: string;
  number: string;
  vision: string;
  mission: string;
  photo?: string;
  votes?: number;
  kategori?: 'rt' | 'rw';
}

export function CandidateManagementView({
  tenantId,
  candidates,
  showNotification,
  handleFileUpload,
  activeElectionLevel = 'rt',
}: {
  tenantId: string;
  candidates: Candidate[];
  showNotification: any;
  handleFileUpload: (file: File, folder: string) => Promise<string>;
  activeElectionLevel?: 'rt' | 'rw';
}) {
  const [editingCandidate, setEditingCandidate] = useState<Partial<Candidate> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (candidate: Partial<Candidate>) => {
    if (!candidate.name || !candidate.number) {
      showNotification("Nama dan Nomor Urut wajib diisi.", "error");
      return;
    }
    setLoading(true);
    try {
      const id = candidate.id || `${tenantId}_${Date.now()}`;
      await setDoc(doc(db, "voting_candidates", id), {
        ...candidate,
        id: id.split("_").pop(), // keep original format if new
        tenantId,
        kategori: candidate.kategori || activeElectionLevel,
        votes: candidate.votes || 0,
      }, { merge: true });
      showNotification("Kandidat berhasil disimpan.", "success");
      setEditingCandidate(null);
      setIsAdding(false);
    } catch (e) {
      showNotification("Gagal menyimpan kandidat.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kandidat ini?")) return;
    try {
      await deleteDoc(doc(db, "voting_candidates", `${tenantId}_${id}`));
      showNotification("Kandidat berhasil dihapus.", "success");
    } catch(e) {
      showNotification("Gagal menghapus kandidat.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
          Kelola Kandidat
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Kandidat
        </button>
      </div>

      {(isAdding || editingCandidate) && (
        <form
          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleSave(editingCandidate || {}); }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Kandidat"
              className="w-full p-3 rounded-lg border border-slate-200"
              value={editingCandidate?.name || ""}
              onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nomor Urut"
              className="w-full p-3 rounded-lg border border-slate-200"
              value={editingCandidate?.number || ""}
              onChange={(e) => setEditingCandidate({ ...editingCandidate, number: e.target.value })}
            />
          </div>
          <div>
            <select
              className="w-full p-3 rounded-lg border border-slate-200 font-bold bg-white text-sm"
              value={editingCandidate?.kategori || activeElectionLevel}
              onChange={(e) => setEditingCandidate({ ...editingCandidate, kategori: e.target.value as 'rt' | 'rw' })}
            >
              <option value="rt">Kandidat Ketua RT</option>
              <option value="rw">Kandidat Ketua RW</option>
            </select>
          </div>
          <textarea
            placeholder="Visi"
            className="w-full p-3 rounded-lg border border-slate-200"
            value={editingCandidate?.vision || ""}
            onChange={(e) => setEditingCandidate({ ...editingCandidate, vision: e.target.value })}
          />
          <textarea
            placeholder="Misi"
            className="w-full p-3 rounded-lg border border-slate-200"
            value={editingCandidate?.mission || ""}
            onChange={(e) => setEditingCandidate({ ...editingCandidate, mission: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLoading(true);
                  try {
                    const url = await handleFileUpload(file, "candidates");
                    setEditingCandidate({ ...editingCandidate, photo: url });
                  } catch (e) {
                    showNotification("Gagal upload foto.", "error");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {editingCandidate?.photo && (
            <img src={editingCandidate.photo} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              disabled={loading}
            >
              <Save className="w-4 h-4" /> Simpan
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
              onClick={() => { setEditingCandidate(null); setIsAdding(false); }}
            >
              <X className="w-4 h-4" /> Batal
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {candidates.map((cand) => (
          <div key={cand.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-4">
              {cand.photo && (
                <img src={cand.photo} alt={cand.name} className="w-10 h-10 object-cover rounded-full" />
              )}
              <span className="font-black text-slate-400">#{cand.number}</span>
              <span className="font-bold text-slate-800">{cand.name}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-white tracking-widest bg-slate-800">
                {cand.kategori === 'rw' ? 'RW' : 'RT'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCandidate(cand)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cand.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
