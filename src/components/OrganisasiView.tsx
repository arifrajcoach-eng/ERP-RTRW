import React, { useState, useEffect } from "react";
import { 
  Network, 
  GitBranch, 
  Plus, 
  Trash2, 
  Edit3, 
  User, 
  Phone, 
  Mail, 
  Info, 
  Check, 
  Users, 
  Search, 
  Globe, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  X
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Member {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
  phone?: string;
  email?: string;
  level: "TOP" | "MIDDLE" | "STAFF"; // TOP: Ketua, MIDDLE: Sekretaris/Bendahara, STAFF: Seksi/Anggota
  colorTheme: string; // Tailwind gradient classes e.g. 'indigo', 'green', 'purple', 'amber', 'rose'
}

interface OrganisasiViewProps {
  currentUser: any;
  currentTenant: any;
  showNotification: (msg: string, type: "success" | "error") => void;
}

const GRADIENT_THEMES = [
  { id: "indigo", name: "Royal Purple", classes: "from-indigo-600 via-indigo-500 to-blue-500 bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400" },
  { id: "emerald", name: "Forest Green", classes: "from-emerald-600 via-emerald-500 to-teal-500 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" },
  { id: "purple", name: "Deep Violet", classes: "from-purple-600 via-purple-500 to-pink-500 bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400" },
  { id: "amber", name: "Amber Orange", classes: "from-amber-500 via-amber-400 to-yellow-500 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400" },
  { id: "rose", name: "Crimson Red", classes: "from-rose-600 via-rose-500 to-pink-500 bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400" },
  { id: "cyan", name: "Ocean Breeze", classes: "from-cyan-600 via-cyan-500 to-sky-500 bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400" },
];

export function OrganisasiView({ currentUser, currentTenant, showNotification }: OrganisasiViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"visual" | "list">("visual");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAtasan, setSelectedAtasan] = useState<string>("ALL");

  // Add/Edit Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("");
  const [formParentId, setFormParentId] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formLevel, setFormLevel] = useState<"TOP" | "MIDDLE" | "STAFF">("STAFF");
  const [formColor, setFormColor] = useState<string>("indigo");

  const tenantId = currentUser?.tenantId || currentTenant?.id || "rw26_berjuang";

  // Check if writing operations are allowed (RW/RT/Admin/SuperAdmin)
  const isPengurus = ["SUPER_ADMIN", "ADMIN", "RW", "RT"].includes(currentUser?.role?.toUpperCase() || "");

  useEffect(() => {
    fetchOrganisasi();
  }, [tenantId]);

  const fetchOrganisasi = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "organisasi_struktur", tenantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().members) {
        setMembers(docSnap.data().members as Member[]);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching organisasi data:", error);
      showNotification("Gagal mengambil struktur organisasi dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveToFirestore = async (newMembers: Member[]) => {
    try {
      const docRef = doc(db, "organisasi_struktur", tenantId);
      await setDoc(docRef, {
        tenantId,
        members: newMembers,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || "system",
      });
      setMembers(newMembers);
      return true;
    } catch (error) {
      console.error("Error saving organisasi data:", error);
      showNotification("Gagal menyimpan perubahan ke database.", "error");
      return false;
    }
  };

  const loadDefaultPresets = async () => {
    const defaultPreset: Member[] = [
      {
        id: "m-1",
        name: "Bpk. Sugianto",
        role: "Ketua Pengurus (RW)",
        parentId: null,
        level: "TOP",
        colorTheme: "indigo",
        phone: "08123456789",
        email: "sugianto@gmail.com"
      },
      {
        id: "m-2",
        name: "Ibu Handayani",
        role: "Sekretaris I",
        parentId: "m-1",
        level: "MIDDLE",
        colorTheme: "purple",
        phone: "08129876543",
        email: "handayani@gmail.com"
      },
      {
        id: "m-3",
        name: "Bpk. Hermawan",
        role: "Bendahara Umum",
        parentId: "m-1",
        level: "MIDDLE",
        colorTheme: "emerald",
        phone: "08134455667",
        email: "hermawan@gmail.com"
      },
      {
        id: "m-4",
        name: "Bpk. Joko Susilo",
        role: "Koordinator Seksi Humas",
        parentId: "m-1",
        level: "STAFF",
        colorTheme: "amber",
        phone: "08151234455"
      },
      {
        id: "m-5",
        name: "Bpk. Slamet",
        role: "Kepala Seksi Keamanan",
        parentId: "m-1",
        level: "STAFF",
        colorTheme: "rose",
        phone: "08128889990"
      },
      {
        id: "m-6",
        name: "Ibu Rahmawati",
        role: "Koodinator Seksi Sosial & Kepemudaan",
        parentId: "m-2",
        level: "STAFF",
        colorTheme: "cyan",
        phone: "08523300112"
      }
    ];

    const success = await saveToFirestore(defaultPreset);
    if (success) {
      showNotification("Preset Pengurus RT/RW berhasil dimuat!", "success");
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName("");
    setFormRole("");
    setFormParentId("");
    setFormPhone("");
    setFormEmail("");
    setFormLevel("STAFF");
    setFormColor("indigo");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingId(member.id);
    setFormName(member.name);
    setFormRole(member.role);
    setFormParentId(member.parentId || "");
    setFormPhone(member.phone || "");
    setFormEmail(member.email || "");
    setFormLevel(member.level);
    setFormColor(member.colorTheme);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim()) {
      showNotification("Nama dan Jabatan tidak boleh kosong", "error");
      return;
    }

    // Determine parent Id logic
    const selectedParent = formParentId === "" ? null : formParentId;

    if (editingId) {
      // Avoid cycles (a member cannot report to itself)
      if (selectedParent === editingId) {
        showNotification("Anggota tidak boleh melapor kepada diri sendiri", "error");
        return;
      }

      const updated = members.map(m => {
        if (m.id === editingId) {
          return {
            ...m,
            name: formName.trim(),
            role: formRole.trim(),
            parentId: selectedParent,
            phone: formPhone.trim() || undefined,
            email: formEmail.trim() || undefined,
            level: formLevel,
            colorTheme: formColor,
          };
        }
        return m;
      });

      const success = await saveToFirestore(updated);
      if (success) {
        showNotification("Personel berhasil diperbarui!", "success");
        setIsModalOpen(false);
      }
    } else {
      const newMember: Member = {
        id: "m-" + Date.now().toString(),
        name: formName.trim(),
        role: formRole.trim(),
        parentId: selectedParent,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        level: formLevel,
        colorTheme: formColor,
      };

      const success = await saveToFirestore([...members, newMember]);
      if (success) {
        showNotification("Personel baru berhasil ditambahkan!", "success");
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (idOfMember: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus personel ini dari struktur organisasi?")) {
      return;
    }

    // Find children reporting to this member and reset their parent to this member's parent
    const memberToDelete = members.find(m => m.id === idOfMember);
    const delegatedParent = memberToDelete ? memberToDelete.parentId : null;

    const updated = members
      .filter(m => m.id !== idOfMember)
      .map(m => {
        if (m.parentId === idOfMember) {
          return { ...m, parentId: delegatedParent };
        }
        return m;
      });

    const success = await saveToFirestore(updated);
    if (success) {
      showNotification("Personel berhasil dihapus dari struktur.", "success");
    }
  };

  // Hierarchy matching
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedAtasan === "ALL") return matchesSearch;
    if (selectedAtasan === "TOP") return matchesSearch && m.parentId === null;
    return matchesSearch && m.parentId === selectedAtasan;
  });

  // Organize by hierarchy level for Visual View
  const topLevel = members.filter(m => m.level === "TOP" || m.parentId === null);
  const midLevel = members.filter(m => m.level === "MIDDLE" && m.parentId !== null);
  const staffLevel = members.filter(m => m.level === "STAFF" && m.parentId !== null);

  // Helper functions
  const getThemeClasses = (themeId: string) => {
    return GRADIENT_THEMES.find(t => t.id === themeId) || GRADIENT_THEMES[0];
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = members.find(m => m.id === parentId);
    return parent ? parent.name : null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10 min-h-screen">
      {/* Visual Ambient Panel */}
      <div className="bg-gradient-to-r from-brand-blue/10 via-indigo-500/5 to-purple-500/10 p-6 md:p-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-elegant flex items-center gap-2">
                STRUKTUR ORGANISASI
                <span className="text-[10px] uppercase font-black tracking-widest bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-3 py-1 font-sans">
                  Interactive
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Peta jabatan kepengurusan rukun tetangga dan rukun warga dalam struktur bento moderen
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-presetal-org"
              onClick={() => {
                setActiveTab(activeTab === "visual" ? "list" : "visual");
              }}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-black uppercase text-slate-600 dark:text-slate-200 outline-none hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {activeTab === "visual" ? (
                <>
                  <FolderOpen className="w-4 h-4 text-purple-500" />
                  Lihat Kontak Pengurus
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4 text-brand-blue" />
                  Lihat Bagan Hierarki
                </>
              )}
            </button>

            {isPengurus && (
              <button
                id="btn-add-personnel"
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-brand-blue/30 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Personel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Empty State / Initial Preset Selector */}
        {members.length === 0 && !loading && (
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6 my-10 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-brand-blue to-indigo-600"></div>
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl mx-auto flex items-center justify-center">
              <Network className="w-8 h-8 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-elegant">Struktur Organisasi Kosong</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Belum ada struktur organisasi atau bagan pengurus yang terdaftar di wilayah Anda. Anda dapat menambahkan personel secara manual atau memuat preset pengurus default kami.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {isPengurus ? (
                <>
                  <button
                    onClick={loadDefaultPresets}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    Muat Preset Pengurus RW
                  </button>
                  <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Input Manual
                  </button>
                </>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs font-medium text-slate-400">
                  ⚠️ Hanya Pengurus (RT/RW/Admin) yang diperbolehkan untuk memuat preset atau mengelola struktur organisasi.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Mengambil Data Bagan...</p>
          </div>
        )}

        {/* Interactive Controls Panel when we have data */}
        {members.length > 0 && !loading && (
          <div className="space-y-6">
            
            {/* Search and Quick Filters bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau jabatan pengurus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-xs font-bold font-sans text-slate-700 dark:text-slate-200 outline-none focus:border-brand-blue/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 hidden lg:inline">Filter Atasan:</span>
                <select
                  value={selectedAtasan}
                  onChange={(e) => setSelectedAtasan(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 border-none select-none appearance-none cursor-pointer outline-none min-w-[140px]"
                >
                  <option value="ALL">Semua Atasan</option>
                  <option value="TOP">Level Tertinggi (Tanpa Atasan)</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>Lapor ke: {m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TAB CONTENT: BAGAN VISUAL (MODERN GRADASI TREE LAYOUT) */}
            {activeTab === "visual" && (
              <div className="space-y-12 pb-10">
                
                {/* Visual Level 1: LEVEL TOP (Ketua) */}
                {topLevel.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                        Pimpinan Tertinggi
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                      {topLevel.map(m => {
                        const theme = getThemeClasses(m.colorTheme);
                        return (
                          <div key={m.id} className="relative group max-w-sm w-full sm:w-[280px]">
                            {/* Visual Glow behind card */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${theme.classes} rounded-3xl blur-md opacity-30 group-hover:opacity-75 transition duration-500`}></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-lg flex flex-col justify-between h-full">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${theme.classes} flex items-center justify-center text-white font-black`}>
                                    {m.name.charAt(0)}
                                  </div>
                                  
                                  {isPengurus && (
                                    <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleOpenEdit(m)}
                                        className="p-1.5 bg-slate-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-slate-900 rounded-lg text-slate-500 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(m.id)}
                                        className="p-1.5 bg-slate-50 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-900 rounded-lg text-slate-500 transition-colors"
                                        title="Hapus"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{m.name}</h4>
                                  <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mt-0.5">{m.role}</p>
                                </div>
                              </div>

                              <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-700/80 flex flex-col gap-1 text-[11px] text-slate-400">
                                {m.phone && (
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-emerald-500" /> {m.phone}
                                  </span>
                                )}
                                {m.email && (
                                  <span className="flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-indigo-500" /> {m.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Arrow Flow line simulator */}
                {topLevel.length > 0 && midLevel.length > 0 && (
                  <div className="flex justify-center -my-6 h-10">
                    <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                  </div>
                )}

                {/* Visual Level 2: UNTUK STAF MIDDLE (Sekretaris & Bendahara) */}
                {midLevel.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/30">
                        Administrasi & Keuangan
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                      {midLevel.map(m => {
                        const theme = getThemeClasses(m.colorTheme);
                        const atasan = getParentName(m.parentId);
                        return (
                          <div key={m.id} className="relative group bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-md hover:shadow-lg hover:border-violet-100 dark:hover:border-slate-600 transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${theme.classes} flex items-center justify-center text-white font-black`}>
                                  {m.name.charAt(0)}
                                </div>
                                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                  Lapor ke : {atasan || "Ketua"}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">{m.name}</h4>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mt-0.5">{m.role}</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-1 text-[11px] text-slate-400">
                              {m.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-500" /> {m.phone}</span>}
                              
                              {isPengurus && (
                                <div className="flex gap-2 mt-2 justify-end">
                                  <button onClick={() => handleOpenEdit(m)} className="p-1 px-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-amber-100 hover:text-amber-700 text-xs font-bold transition-all">Edit</button>
                                  <button onClick={() => handleDelete(m.id)} className="p-1 px-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-rose-100 hover:text-rose-700 text-xs font-bold transition-all">Hapus</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Arrow Flow line simulator */}
                {midLevel.length > 0 && staffLevel.length > 0 && (
                  <div className="flex justify-center -my-6 h-10">
                    <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                  </div>
                )}

                {/* Visual Level 3: UNTUK STAF / SEKSI / BIDANG */}
                {staffLevel.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                        Seksi Bidang & Keanggotaan
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {staffLevel.map(m => {
                        const theme = getThemeClasses(m.colorTheme);
                        const atasan = getParentName(m.parentId);
                        return (
                          <div key={m.id} className="relative group bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${theme.classes} flex items-center justify-center text-white font-black text-sm`}>
                                  {m.name.charAt(0)}
                                </div>
                                <div className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                                  Atasan: <span className="font-bold text-slate-700 dark:text-slate-300">{atasan || "Ketua"}</span>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{m.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{m.role}</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-1 text-[11px] text-slate-400">
                              {m.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-500" /> {m.phone}</span>}
                              
                              {isPengurus && (
                                <div className="flex gap-2 mt-2 justify-end">
                                  <button onClick={() => handleOpenEdit(m)} className="p-1 px-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-amber-100 hover:text-amber-700 rounded-lg text-xs font-bold transition-all">Edit</button>
                                  <button onClick={() => handleDelete(m.id)} className="p-1 px-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-xs font-bold transition-all">Hapus</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT: CONTACT LIST / GRID VIEW */}
            {activeTab === "list" && (
              <div className="space-y-6">
                
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Hasil pencarian tidak ada</p>
                    <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian atau filter atasan lainnya.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredMembers.map(m => {
                      const theme = getThemeClasses(m.colorTheme);
                      const atasan = getParentName(m.parentId);
                      return (
                        <div key={m.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-5 hover:shadow-lg transition-all flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${theme.classes} flex items-center justify-center text-white font-black text-sm`}>
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug">{m.name}</h4>
                                <span className="text-[10px] font-black uppercase text-brand-blue tracking-widest block">{m.role}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-700/50 pt-3">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">Reports To</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{atasan || "Level Atas (Mandiri)"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">Level</span>
                                <span className="font-black text-indigo-500 uppercase">{m.level}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-1 text-[11px] text-slate-400">
                            {m.phone && (
                              <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                                <Phone className="w-3 h-3 text-emerald-500" /> {m.phone}
                              </a>
                            )}
                            {m.email && (
                              <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                                <Mail className="w-3 h-3 text-indigo-500" /> {m.email}
                              </a>
                            )}

                            {isPengurus && (
                              <div className="flex gap-2 mt-3 justify-end">
                                <button onClick={() => handleOpenEdit(m)} className="p-1 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-amber-100 hover:text-amber-700 text-xs font-bold transition-all cursor-pointer">Edit</button>
                                <button onClick={() => handleDelete(m.id)} className="p-1 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-rose-100 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer">Hapus</button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* COMPREHENSIVE ADD / EDIT DIALOG (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-750 flex flex-col">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-blue via-indigo-500 to-purple-600"></div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider font-elegant">
                  {editingId ? "Edit Personel Organisasi" : "Tambah Anggota Pengurus"}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Lengkapi data kepengurusan wilayah RT/RW</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-500 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Sugianto"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan / Role</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sekretaris Utama / Seksi Humas"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Level Struktur</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="TOP">Pimpinan Tertinggi</option>
                    <option value="MIDDLE">Administrasi / Keuangan</option>
                    <option value="STAFF">Seksi / Staff</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tema Warna</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    {GRADIENT_THEMES.map(theme => (
                      <option key={theme.id} value={theme.id}>{theme.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Melapor Kepada (Atasan langsung)</label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="">-- Tanpa Atasan (Mandiri) --</option>
                  {members
                    .filter(m => m.id !== editingId) // Exclude self
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Contoh: 0812345..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-all"
                >
                  {editingId ? "Simpan Perubahan" : "Tambah Personel"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
