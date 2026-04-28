import React, { useState } from 'react';

export default function EVotingView({ userRole }: { userRole: string }) {
  const [candidates, setCandidates] = useState([
    { id: '1', name: 'Bpk. Ahmad Suhendar', description: 'Berpengalaman dalam administrasi lingkungan.', profile: 'Latar belakang: Mantan ketua RW.', count: 10, photo: 'https://via.placeholder.com/150' },
    { id: '2', name: 'Ibu Siti Aminah', description: 'Fokus pada kesejahteraan keluarga dan kesehatan.', profile: 'Latar belakang: Tenaga medis.', count: 5, photo: 'https://via.placeholder.com/150' },
  ]);
  const [voted, setVoted] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDesc, setNewCandidateDesc] = useState('');
  const [newCandidateProfile, setNewCandidateProfile] = useState('');
  const [newCandidatePhoto, setNewCandidatePhoto] = useState('');
  const [editingCandidate, setEditingCandidate] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editProfile, setEditProfile] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [aturanMain, setAturanMain] = useState('1. Pemilih hanya bisa memilih satu calon.\n2. Keputusan berdasarkan suara terbanyak.\n3. Voting bersifat rahasia dan aman.');
  const [isEditingAturan, setIsEditingAturan] = useState(false);
  const [tempAturan, setTempAturan] = useState(aturanMain);

  const totalVotes = candidates.reduce((acc, curr) => acc + curr.count, 0);

  const handleVote = (id: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, count: c.count + 1 } : c));
    setVoted(true);
    setShowConfirm(null);
  };

  const addCandidate = () => {
    if (!newCandidateName) return;
    setCandidates(prev => [...prev, { 
        id: Date.now().toString(), 
        name: newCandidateName, 
        description: newCandidateDesc || 'Calon baru.', 
        profile: newCandidateProfile || 'Belum ada profil.',
        photo: newCandidatePhoto || 'https://via.placeholder.com/150',
        count: 0 
    }]);
    setNewCandidateName('');
    setNewCandidateDesc('');
    setNewCandidateProfile('');
    setNewCandidatePhoto('');
  };

  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const startEditCandidate = (c: any) => {
      setEditingCandidate(c.id);
      setEditName(c.name);
      setEditDesc(c.description);
      setEditProfile(c.profile);
      setEditPhoto(c.photo || '');
  };

  const saveEditCandidate = (id: string) => {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, name: editName, description: editDesc, profile: editProfile, photo: editPhoto } : c));
      setEditingCandidate(null);
  };

  const saveAturan = () => {
    setAturanMain(tempAturan);
    setIsEditingAturan(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black mb-6 text-slate-800 tracking-tighter">E-Pemilu RW 26</h2>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Aturan Main Voting</h3>
            {(userRole === 'ADMIN' || userRole === 'Super Admin') && (
              <button 
                onClick={() => isEditingAturan ? saveAturan() : setIsEditingAturan(true)}
                className={`text-sm font-bold px-3 py-1 rounded-lg \${isEditingAturan ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {isEditingAturan ? 'Simpan Aturan' : 'Edit Aturan'}
              </button>
            )}
          </div>
          {isEditingAturan ? (
            <textarea 
              value={tempAturan}
              onChange={(e) => setTempAturan(e.target.value)}
              className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm text-slate-700"
            />
          ) : (
            <pre className="text-slate-600 text-sm whitespace-pre-wrap font-sans">{aturanMain}</pre>
          )}
        </div>
        
        {(userRole === 'ADMIN' || userRole === 'Super Admin') && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-2">
            <input 
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              placeholder="Nama calon baru"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <input 
              value={newCandidateDesc}
              onChange={(e) => setNewCandidateDesc(e.target.value)}
              placeholder="Deskripsi singkat"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <textarea 
              value={newCandidateProfile}
              onChange={(e) => setNewCandidateProfile(e.target.value)}
              placeholder="Profil lengkap"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <input 
              value={newCandidatePhoto}
              onChange={(e) => setNewCandidatePhoto(e.target.value)}
              placeholder="URL Foto Calon"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <button onClick={addCandidate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Tambah Calon</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
              {editingCandidate === c.id ? (
                  <div className="flex flex-col gap-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <textarea value={editProfile} onChange={(e) => setEditProfile(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <input value={editPhoto} onChange={(e) => setEditPhoto(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <button onClick={() => saveEditCandidate(c.id)} className="bg-green-600 text-white p-2 rounded-lg">Simpan</button>
                  </div>
              ) : (
                <div>
                  <img src={c.photo || 'https://via.placeholder.com/150'} alt={c.name} className="w-full h-48 object-cover rounded-xl mb-4" />
                  <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                  <p className="text-slate-600 mb-2 font-medium">{c.description}</p>
                  <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">{c.profile}</p>
                  <div className="bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `\${totalVotes > 0 ? (c.count / totalVotes) * 100 : 0}%` }} />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-4">{c.count} suara ({totalVotes > 0 ? Math.round((c.count / totalVotes) * 100) : 0}%)</p>
                </div>
              )}
              {(userRole === 'ADMIN' || userRole === 'Super Admin') && (
                  <div className="flex gap-2 mb-4">
                      <button onClick={() => startEditCandidate(c)} className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-xs font-bold">Edit</button>
                      <button onClick={() => deleteCandidate(c.id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-bold">Hapus</button>
                  </div>
              )}
              <button
                disabled={voted}
                onClick={() => setShowConfirm(c.id)}
                className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest transition-all \${voted ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
              >
                {voted ? 'Sudah Memilih' : 'Pilih Calon'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full">
            <h3 className="text-xl font-black mb-4">Konfirmasi Pilihan</h3>
            <p className="mb-6">Anda yakin ingin memilih <span className="font-bold">{candidates.find(c => c.id === showConfirm)?.name}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Batal</button>
              <button onClick={() => handleVote(showConfirm)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Konfirmasi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
