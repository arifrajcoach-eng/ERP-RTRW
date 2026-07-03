import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  Timestamp,
  orderBy,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, 
  Phone, 
  Mail,
  MapPin, 
  Calendar, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Upload,
  Download,
  UserPlus,
  Trash2,
  Package,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { PricingSection } from './PricingSection';

interface Lead {
  id: string;
  name: string;
  namaPIC: string;
  phone: string;
  adminEmail: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
  plan: string;
  createdAt: string;
  city?: string;
  province?: string;
  followUpStatus?: 'NEW' | 'CONTACTED' | 'CONVERTED';
  lastFollowUp?: string;
  lastEmailFollowUpAt?: string;
  emailFollowUpCount?: number;
}

export default function LeadManagementView({ handleFirestoreError, onAddLead, showNotification }: any) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRunningEmailAutomation, setIsRunningEmailAutomation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'tenants'),
      where('status', '==', 'TRIAL')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      // Sort by date manually if not indexed
      setLeads(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (err) => handleFirestoreError(err, 'list', 'leads'));

    return () => unsub();
  }, []);

  const runEmailAutomation = async () => {
    setIsRunningEmailAutomation(true);
    let count = 0;
    try {
      const now = new Date();
      const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
      
      for (const lead of leads) {
        if (lead.followUpStatus === 'CONVERTED') continue;
        
        const lastFollowUp = lead.lastEmailFollowUpAt ? new Date(lead.lastEmailFollowUpAt) : new Date(lead.createdAt);
        const diff = now.getTime() - lastFollowUp.getTime();
        
        if (diff >= twoWeeksMs) {
          // Simulate sending email
          await updateDoc(doc(db, 'tenants', lead.id), {
            lastEmailFollowUpAt: now.toISOString(),
            emailFollowUpCount: (lead.emailFollowUpCount || 0) + 1,
            followUpStatus: 'CONTACTED'
          });
          count++;
        }
      }
      if (showNotification) {
        showNotification(`Automasi Selesai: ${count} email follow-up dikirim secara periodik (interval 2 minggu).`, 'success');
      }
    } catch (err) {
      console.error('Email automation error:', err);
      if (showNotification) showNotification('Gagal menjalankan automasi email.', 'error');
    } finally {
      setIsRunningEmailAutomation(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tenants', leadId), {
        followUpStatus: status,
        lastFollowUp: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, 'update', 'lead_status');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          for (const row of rows) {
            // Attempt to get name, phone, email, pic from various column variants
            const name = row['Nama Area'] || row['Area'] || row['Perumahan'] || row['Name'] || row['name'] || '';
            const namaPIC = row['Nama PIC'] || row['PIC'] || row['Nama'] || row['namaPIC'] || '';
            const phone = row['No Telepon'] || row['Telepon'] || row['No WhatsApp'] || row['Phone'] || row['phone'] || '';
            const adminEmail = row['Email'] || row['Email PIC'] || row['email'] || '';
            const city = row['Kota'] || row['City'] || row['city'] || '';
            const province = row['Provinsi'] || row['Province'] || row['province'] || '';

            if (name || namaPIC || phone) {
              await addDoc(collection(db, 'tenants'), {
                name,
                namaPIC,
                phone,
                adminEmail,
                city,
                province,
                status: 'TRIAL',
                plan: 'TRIAL',
                followUpStatus: 'NEW',
                createdAt: new Date().toISOString(),
                trialStartDate: new Date().toISOString()
              });
            }
          }
          alert('Berhasil import leads dari CSV');
        } catch (err) {
          handleFirestoreError(err, 'import', 'leads_csv');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert('Gagal membaca file CSV');
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleDownloadCSV = () => {
    try {
      const csvData = leads.map(lead => ({
        'Nama Area': lead.name,
        'PIC': lead.namaPIC,
        'No Telepon': lead.phone,
        'Email': lead.adminEmail,
        'Kota': lead.city || '',
        'Provinsi': lead.province || '',
        'Status Follow Up': lead.followUpStatus || 'NEW',
        'Tanggal Buat': lead.createdAt
      }));
      
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Gagal mengunduh file CSV');
    }
  };

  const generateFollowUp = async (lead: Lead) => {
    setIsGenerating(true);
    setAiMessage('');
    try {
      // We'll use a server-side API route for this in a real app, 
      // but for this UI demo we'll simulate the AI generation or call an existing endpoint
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tulis pesan WhatsApp follow-up profesional dan ramah untuk calon klien aplikasi SmaRtRw. PIC bernama ${lead.namaPIC} dari area ${lead.name} (${lead.city || 'Indonesia'}). Dia baru saja mendaftar Paket Gratis/Trial. Tujuannya adalah menanyakan kabar, apakah ada kesulitan saat mencoba, dan menawarkan bantuan demo fitur premium. Gunakan bahasa Indonesia yang sopan namun akrab.`
        })
      });
      
      const resData = await response.json();
      setAiMessage(resData.text || 'Gagal menghasilkan pesan.');
      setSelectedLead(lead);
    } catch (err) {
      console.error(err);
      setAiMessage("Halo Pak/Bu " + lead.namaPIC + ", saya dari SmaRtRw AI ingin menanyakan bagaimana pengalaman Bapak/Ibu menggunakan SmaRtRw di " + lead.name + "? Apakah ada yang bisa kami bantu?");
      setSelectedLead(lead);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!window.confirm(`Hapus lead "${leadName}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'tenants', leadId));
      if (showNotification) showNotification(`Lead ${leadName} berhasil dihapus`, 'success');
    } catch (err) {
      handleFirestoreError(err, 'delete', 'lead');
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = (l.name?.toLowerCase().includes(filter.toLowerCase()) || 
                          l.namaPIC?.toLowerCase().includes(filter.toLowerCase()) ||
                          l.phone?.includes(filter));
    const matchesStatus = statusFilter === 'ALL' || l.followUpStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold italic text-slate-800 tracking-tighter uppercase font-outfit">CRM & Lead Hub</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] mt-2">Kelola Registrasi Paket Gratis & Follow-up Otomatis</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isUploading}
             className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:border-slate-300 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
             {isUploading ? (
               <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
             ) : (
               <Upload size={16} />
             )}
             Import CSV
          </button>
          <button 
             onClick={handleDownloadCSV}
             className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:border-slate-300 flex items-center gap-2 transition-all"
          >
             <Download size={16} />
             Export CSV
          </button>
          <button 
             onClick={() => onAddLead && onAddLead()}
             className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
             <UserPlus size={16} />
             Mulai Gratis (Manual)
          </button>
          <button 
             onClick={runEmailAutomation}
             disabled={isRunningEmailAutomation}
             className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
             {isRunningEmailAutomation ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Sparkles size={16} />
             )}
             Run Automasi Followup
          </button>
          <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase leading-none">Total Leads</p>
              <p className="text-xl font-black text-indigo-700 leading-tight">{leads.length}</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase leading-none">Converted</p>
              <p className="text-xl font-black text-emerald-700 leading-tight">
                {leads.filter(l => l.followUpStatus === 'CONVERTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari Nama Area, PIC, atau No. HP..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'NEW', 'CONTACTED', 'CONVERTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s 
                ? 'bg-slate-800 text-white shadow-xl' 
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {s === 'ALL' ? 'Semua' : s === 'NEW' ? 'BARU' : s === 'CONTACTED' ? 'DIHUBUNGI' : 'JOIN'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-32 flex flex-col items-center gap-4 text-slate-300">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-black tracking-widest uppercase animate-pulse">Menghubungkan ke Database Master...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Tidak Ada Data</h3>
          <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest leading-relaxed">Belum ada registrasi baru untuk kriteria ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredLeads.map((lead, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={lead.id}
                className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 h-40 w-40 -mr-16 -mt-16 rounded-full blur-[60px] opacity-10 ${
                  lead.followUpStatus === 'CONVERTED' ? 'bg-emerald-500' :
                  lead.followUpStatus === 'CONTACTED' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />

                <div className="relative space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-2">
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                           lead.followUpStatus === 'CONVERTED' ? 'bg-emerald-50 text-emerald-600' :
                           lead.followUpStatus === 'CONTACTED' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {lead.followUpStatus || 'NEW'}
                        </div>
                        {(lead as any).autoFollowedUpAfterTwoMonths && (
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                             <CheckCircle2 size={10} />
                             <span className="text-[8px] font-black uppercase tracking-tight">Auto Follow-up 2 Bulan Aktif</span>
                           </div>
                        )}
                        {lead.lastEmailFollowUpAt && (
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                             <Mail size={10} />
                             <span className="text-[8px] font-black uppercase tracking-tight">Email: {lead.emailFollowUpCount}x Followed</span>
                           </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-black uppercase tracking-tight">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                        <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteLead(lead.id, lead.name);
                           }}
                           className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all shadow-sm border border-rose-100"
                           title="Hapus Lead"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                  <div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-7 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase font-elegant">
                      {lead.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                       <MapPin className="w-3 h-3" />
                       {lead.city || 'Lokasi Belum Diisi'}
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Nama PIC</p>
                        <p className="text-sm font-black text-slate-700">{lead.namaPIC}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">No. WhatsApp</p>
                        <p className="text-sm font-black text-slate-700">{lead.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                       disabled={isGenerating}
                       onClick={() => generateFollowUp(lead)}
                       className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      AI Follow-up
                    </button>
                    <a 
                      href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => updateLeadStatus(lead.id, 'CONTACTED')}
                      className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      WA Sekarang
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* AI Message Drawer */}
      <AnimatePresence>
        {selectedLead && aiMessage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl"
            >
               <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                     <Sparkles className="w-20 h-20 opacity-10 rotate-12" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight uppercase font-elegant">AI Drafting...</h3>
                  <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mt-2">Pesan Follow-up Pribadi untuk {selectedLead.namaPIC}</p>
               </div>
               
               <div className="p-10 space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative">
                     <div className="absolute -top-3 left-10 bg-white px-4 py-1 rounded-full border border-slate-100 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Draft Pesan</div>
                     <p className="text-slate-600 font-medium leading-relaxed italic">"{aiMessage}"</p>
                  </div>

                  <div className="flex flex-col gap-4">
                     <button 
                       onClick={() => {
                         const text = encodeURIComponent(aiMessage);
                         window.open(`https://wa.me/${selectedLead.phone?.replace(/\D/g, '')}?text=${text}`, '_blank');
                         updateLeadStatus(selectedLead.id, 'CONTACTED');
                         setSelectedLead(null);
                       }}
                       className="w-full py-6 bg-emerald-500 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"
                     >
                       <Send className="w-5 h-5" />
                       Kirim Lewat WhatsApp
                     </button>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <button 
                        onClick={() => updateLeadStatus(selectedLead.id, 'CONVERTED')}
                        className="py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                       >
                         Mark as Converted
                       </button>
                       <button 
                         onClick={() => setSelectedLead(null)}
                         className="py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                       >
                         Tutup Panel
                       </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Guide Section */}
      <div className="mt-16 bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                <Package className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Panduan Paket & Benefits</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Struktur Kapasitas & Fitur Powered by Nexapps</p>
             </div>
          </div>
          <div className="px-5 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Master Price List</span>
          </div>
        </div>
        
        <div className="p-10">
           <PricingSection hideHeader={true} />
        </div>
      </div>
    </div>
  );
}
