import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Mail, Phone, Users } from 'lucide-react';

export function DaftarPendaftarTrialView() {
  const [registrants, setRegistrants] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrants(data.filter(t => t.id.startsWith('TRIAL_')));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Tenant Trial</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Tenant Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">No. HP</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrants.map((reg) => (
              <tr key={reg.id}>
                <td className="p-4">{reg.name}</td>
                <td className="p-4">{reg.adminEmail}</td>
                <td className="p-4">{reg.adminPhone}</td>
                <td className="p-4">{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td className="p-4 flex gap-2">
                  <a href={`mailto:${reg.adminEmail}`} className="text-blue-600 hover:text-blue-800 p-2"><Mail size={18} /></a>
                  <a href={`https://wa.me/${reg.adminPhone?.replace(/[^0-9]/g, '')}`} target="_blank" className="text-green-600 hover:text-green-800 p-2"><Phone size={18} /></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
