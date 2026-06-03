import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  tenantId: string;
}

export function ElectionAnnouncementBoard({ tenantId, currentUser }: { tenantId: string; currentUser: any }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    const q = query(
      collection(db, "election_announcements"),
      where("tenantId", "==", tenantId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
  }, [tenantId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await addDoc(collection(db, "election_announcements"), {
        title,
        content,
        tenantId,
        createdAt: serverTimestamp(),
        authorId: currentUser?.uid,
      });
      setTitle("");
      setContent("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 uppercase italic">Pengumuman Pemilu</h2>
        {currentUser?.role === "admin" && (
          <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold">
            {isAdding ? "Batal" : "+ Buat Pengumuman Baru"}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul Pengumuman" className="w-full p-2 mb-2 rounded-lg border border-slate-200" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Isi Pengumuman" className="w-full p-2 mb-2 rounded-lg border border-slate-200" rows={3} />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold">Kirim</button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
            <h3 className="font-bold text-slate-900">{a.title}</h3>
            <p className="text-sm text-slate-600">{a.content}</p>
            {a.createdAt && <p className="text-xs text-slate-400 mt-2">{new Date(a.createdAt.toDate()).toLocaleDateString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
