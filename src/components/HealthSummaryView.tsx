import React, { useState, useMemo, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { HeartPulse, PlusCircle, Trash2 } from "lucide-react";

const LANSIA_DISEASES = ["Jantung", "Diabetes Melitus", "Hipertensi", "Osteoartritis", "Asam Urat", "Demensia", "Alzheimer"];
const BALITA_DISEASES = ["ISPA", "Diare", "DBD", "Penyakit Kulit", "Campak & Cacar", "Cacingan", "Stunting"];

export default function HealthSummaryView({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nik: "", kategori: "Lansia", penyakit: [] as string[] });
  const [searchNik, setSearchNik] = useState("");

  useEffect(() => {
    const q = query(collection(db, "data_kesehatan"), where("tenantId", "==", tenantId));
    return onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [tenantId]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      item.penyakit.forEach((p: string) => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  const filteredData = useMemo(() => {
     if (!searchNik) return [];
     return data.filter(d => d.nik === searchNik);
  }, [data, searchNik]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `KES-${Date.now()}`;
    await setDoc(doc(db, "data_kesehatan", id), { ...formData, tenantId, tanggal: new Date().toISOString() });
    setFormData({ nik: "", kategori: "Lansia", penyakit: [] });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Input Data Kesehatan</h3>
        <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-4">
          <input type="text" placeholder="NIK" className="p-3 border rounded-xl" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
          <select className="p-3 border rounded-xl" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
            <option>Lansia</option>
            <option>Balita</option>
          </select>
          <div className="col-span-3 flex flex-wrap gap-2">
            {(formData.kategori === "Lansia" ? LANSIA_DISEASES : BALITA_DISEASES).map(p => (
              <button key={p} type="button" onClick={() => setFormData(prev => ({...prev, penyakit: prev.penyakit.includes(p) ? prev.penyakit.filter(x => x !== p) : [...prev.penyakit, p]}))} className={`px-4 py-2 rounded-lg text-xs font-bold ${formData.penyakit.includes(p) ? 'bg-rose-500 text-white' : 'bg-slate-100'}`}>
                {p}
              </button>
            ))}
          </div>
          <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-2xl">Simpan</button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Buku Digital Warga (Pencarian NIK)</h3>
          <input type="text" placeholder="Masukkan NIK untuk melihat rekam kesehatan..." className="w-full p-3 border rounded-xl mb-4" value={searchNik} onChange={e => setSearchNik(e.target.value)} />
          {searchNik && (
              <div className="space-y-2">
                 {filteredData.length > 0 ? filteredData.map(d => (
                     <div key={d.id} className="p-4 border rounded-xl">
                        <p className="text-xs font-bold text-slate-500">{new Date(d.tanggal).toLocaleDateString()}</p>
                        <p className="text-sm font-black">{d.kategori} - {d.penyakit.join(", ")}</p>
                     </div>
                 )) : <p className="text-xs text-slate-400">Tidak ada data ditemukan untuk NIK ini.</p>}
              </div>
          )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Statistik Penyakit</h3>
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={chartData}>
               <XAxis dataKey="name" fontSize={10} />
               <YAxis fontSize={10} />
               <Tooltip />
               <Bar dataKey="value" fill="#f43f5e" />
             </BarChart>
           </ResponsiveContainer>
         </div>
         
         <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Data Kesehatan</h3>
           <table className="w-full text-xs text-left">
             <thead className="text-slate-400"><tr><th>NIK</th><th>Kategori</th><th>Penyakit</th></tr></thead>
             <tbody>{data.map(d => <tr key={d.id} className="border-t"><td>{d.nik}</td><td>{d.kategori}</td><td>{d.penyakit.join(", ")}</td></tr>)}</tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
