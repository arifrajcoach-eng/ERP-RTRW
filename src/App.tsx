import React, { useState } from 'react';
import { Users, BookOpen, FileText, LayoutDashboard, CreditCard, PlusCircle, Search, Settings, Edit, Trash2, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans print:h-auto print:bg-white text-sm">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col print:hidden">
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
            <Users className="w-6 h-6" />
            RT-Digital
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Management System v1.0</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'warga', label: 'Data Warga', icon: Users },
            { id: 'iuran', label: 'Iuran Bulanan', icon: CreditCard },
            { id: 'surat', label: 'Surat Pengantar', icon: FileText },
            { id: 'kas', label: 'Laporan Kas', icon: BookOpen },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-100 text-slate-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-[10px] font-bold text-blue-700">BACKEND STATUS</p>
            <p className="text-[11px] text-blue-600 truncate mt-0.5">Apps Script Connected</p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
             <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded border border-slate-200 uppercase font-mono tracking-wider">
               GAS-DB-V4
             </span>
             <h2 className="text-sm font-semibold text-slate-500 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-4">

             <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold leading-none text-slate-800">Bpk. Bambang</p>
                 <p className="text-xs text-slate-400 mt-1">Ketua RT</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold border border-slate-300">
                 B
               </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 h-full overflow-auto print:overflow-visible print:h-auto print:p-0">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'warga' && <WargaView />}
          {activeTab === 'iuran' && <IuranView />}
          {activeTab === 'surat' && <SuratView />}
          {activeTab === 'kas' && <KasView />}
          {activeTab === 'pengaturan' && <PengaturanView />}
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Warga</p>
          <p className="text-2xl font-black text-slate-800 flex items-baseline gap-2">
            124 <span className="text-[11px] font-normal text-slate-400">Kepala Keluarga: 45</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Kas</p>
          <p className="text-2xl font-black text-green-600 flex items-baseline gap-2">
            Rp 4.500.000 <span className="text-[11px] font-normal text-slate-400">+ Rp 450.000 (bln ini)</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Surat Pending</p>
          <p className="text-2xl font-black text-orange-500 flex items-baseline gap-2">
            3 <span className="text-[11px] font-normal text-slate-400">Pengajuan</span>
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Aktivitas Terbaru
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-semibold text-sm text-slate-800">Pembayaran Iuran - Bpk. Ahmad (Blok A1)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Iuran Keamanan & Kebersihan (Agustus)</p>
            </div>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">+ Rp 50.000</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-semibold text-sm text-slate-800">Pengajuan Surat Domisili</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ibu Siti Aminah (Blok C3)</p>
            </div>
            <span className="px-2 py-1 bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold rounded uppercase tracking-wider">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WargaView() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRT, setFilterRT] = useState("Semua");
  const [filterRW, setFilterRW] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8; // Tampilkan 8 data per halaman agar rapi

  const wargaData = [
    { nama: "Bpk. Ahmad Suhendar", posisi: "Suami", nik: "3271012345678001", kk: "1012012345678001", rt: "01", rw: "05", blok: "Blok A / 01", status: "Warga Tetap", hp: "081234567001" },
    { nama: "Ibu Siti Aminah", posisi: "Istri", nik: "3271012345678002", kk: "1012012345678001", rt: "01", rw: "05", blok: "Blok A / 01", status: "Warga Tetap", hp: "081234567002" },
    { nama: "Bpk. Budi Santoso", posisi: "Suami", nik: "3271012345678003", kk: "1012012345678002", rt: "01", rw: "05", blok: "Blok A / 02", status: "Warga Tetap", hp: "081234567003" },
    { nama: "Ananda Budi Junior", posisi: "Anak", nik: "3271012345678004", kk: "1012012345678002", rt: "01", rw: "05", blok: "Blok A / 02", status: "Warga Tetap", hp: "-" },
    { nama: "Bpk. Candra Wijaya", posisi: "Suami", nik: "3271012345678005", kk: "1012012345678003", rt: "01", rw: "05", blok: "Blok A / 03", status: "Kontrak", hp: "081234567005" },
    { nama: "Ibu Rina Marlina", posisi: "Istri", nik: "3271012345678006", kk: "1012012345678003", rt: "01", rw: "05", blok: "Blok A / 03", status: "Kontrak", hp: "081234567006" },
    { nama: "Bpk. Dedi Kurniawan", posisi: "Suami", nik: "3271012345678007", kk: "1012012345678004", rt: "01", rw: "05", blok: "Blok A / 04", status: "Warga Tetap", hp: "081234567007" },
    { nama: "Bpk. Eko Prasetyo", posisi: "Suami", nik: "3271012345678008", kk: "1012012345678005", rt: "01", rw: "05", blok: "Blok A / 05", status: "Kos", hp: "081234567008" },
    { nama: "Bpk. Fajar Ramadhan", posisi: "Suami", nik: "3271012345678009", kk: "1012012345678006", rt: "01", rw: "05", blok: "Blok B / 01", status: "Warga Tetap", hp: "081234567009" },
    { nama: "Ibu Eka Fitriani", posisi: "Istri", nik: "3271012345678010", kk: "1012012345678006", rt: "01", rw: "05", blok: "Blok B / 01", status: "Warga Tetap", hp: "081234567010" },
    { nama: "Bpk. Gilang Pratama", posisi: "Suami", nik: "3271012345678011", kk: "1012012345678007", rt: "01", rw: "05", blok: "Blok B / 02", status: "Warga Tetap", hp: "081234567011" },
    { nama: "Bpk. Hadi Saputra", posisi: "Suami", nik: "3271012345678012", kk: "1012012345678008", rt: "01", rw: "05", blok: "Blok B / 03", status: "Warga Tetap", hp: "081234567012" },
    { nama: "Ibu Hani Mulyani", posisi: "Istri", nik: "3271012345678013", kk: "1012012345678008", rt: "01", rw: "05", blok: "Blok B / 03", status: "Warga Tetap", hp: "081234567013" },
    { nama: "Bpk. Iwan Setiawan", posisi: "Suami", nik: "3271012345678014", kk: "1012012345678009", rt: "01", rw: "05", blok: "Blok B / 04", status: "Kontrak", hp: "081234567014" },
    { nama: "Bpk. Joko Susilo", posisi: "Suami", nik: "3271012345678015", kk: "1012012345678010", rt: "01", rw: "05", blok: "Blok B / 05", status: "Kos", hp: "081234567015" },
    { nama: "Bpk. Kemal Mustafa", posisi: "Suami", nik: "3271012345678016", kk: "1012012345678011", rt: "02", rw: "05", blok: "Blok C / 01", status: "Warga Tetap", hp: "081234567016" },
    { nama: "Ibu Kiki Amalia", posisi: "Istri", nik: "3271012345678017", kk: "1012012345678011", rt: "02", rw: "05", blok: "Blok C / 01", status: "Warga Tetap", hp: "081234567017" },
    { nama: "Ananda Kemal Junior", posisi: "Anak", nik: "3271012345678018", kk: "1012012345678011", rt: "02", rw: "05", blok: "Blok C / 01", status: "Warga Tetap", hp: "-" },
    { nama: "Bpk. Lukman Hakim", posisi: "Suami", nik: "3271012345678019", kk: "1012012345678012", rt: "02", rw: "05", blok: "Blok C / 02", status: "Warga Tetap", hp: "081234567019" },
    { nama: "Bpk. Mahmudin", posisi: "Suami", nik: "3271012345678020", kk: "1012012345678013", rt: "02", rw: "05", blok: "Blok C / 03", status: "Warga Tetap", hp: "081234567020" },
    { nama: "Ibu Maya Safitri", posisi: "Istri", nik: "3271012345678021", kk: "1012012345678013", rt: "02", rw: "05", blok: "Blok C / 03", status: "Warga Tetap", hp: "081234567021" },
    { nama: "Bpk. Nano Supriatna", posisi: "Suami", nik: "3271012345678022", kk: "1012012345678014", rt: "02", rw: "05", blok: "Blok C / 04", status: "Kontrak", hp: "081234567022" },
    { nama: "Bpk. Oki Lukman", posisi: "Suami", nik: "3271012345678023", kk: "1012012345678015", rt: "02", rw: "05", blok: "Blok C / 05", status: "Kos", hp: "081234567023" },
    { nama: "Bpk. Putu Bagita", posisi: "Suami", nik: "3271012345678024", kk: "1012012345678016", rt: "02", rw: "05", blok: "Blok D / 01", status: "Warga Tetap", hp: "081234567024" },
    { nama: "Bpk. Qusyairi", posisi: "Suami", nik: "3271012345678025", kk: "1012012345678017", rt: "02", rw: "05", blok: "Blok D / 02", status: "Warga Tetap", hp: "081234567025" },
    { nama: "Ibu Putri Rahmawati", posisi: "Istri", nik: "3271012345678026", kk: "1012012345678017", rt: "02", rw: "05", blok: "Blok D / 02", status: "Warga Tetap", hp: "081234567026" },
    { nama: "Bpk. Rahmat Hidayat", posisi: "Suami", nik: "3271012345678027", kk: "1012012345678018", rt: "02", rw: "05", blok: "Blok D / 03", status: "Kontrak", hp: "081234567027" },
    { nama: "Bpk. Surya Dharma", posisi: "Suami", nik: "3271012345678028", kk: "1012012345678019", rt: "02", rw: "05", blok: "Blok D / 04", status: "Warga Tetap", hp: "081234567028" },
    { nama: "Bpk. Tito Karnavian", posisi: "Suami", nik: "3271012345678029", kk: "1012012345678020", rt: "02", rw: "05", blok: "Blok D / 05", status: "Warga Tetap", hp: "081234567029" },
    { nama: "Ibu Rini Yulianti", posisi: "Istri", nik: "3271012345678030", kk: "1012012345678020", rt: "02", rw: "05", blok: "Blok D / 05", status: "Warga Tetap", hp: "081234567030" },
    { nama: "Bpk. Umar Wirahadikusumah", posisi: "Suami", nik: "3271012345678031", kk: "1012012345678021", rt: "03", rw: "05", blok: "Blok E / 01", status: "Warga Tetap", hp: "081234567031" },
    { nama: "Bpk. Vian Mahardika", posisi: "Suami", nik: "3271012345678032", kk: "1012012345678022", rt: "03", rw: "05", blok: "Blok E / 02", status: "Warga Tetap", hp: "081234567032" },
    { nama: "Bpk. Wahyu Hidayat", posisi: "Suami", nik: "3271012345678033", kk: "1012012345678023", rt: "03", rw: "05", blok: "Blok E / 03", status: "Kontrak", hp: "081234567033" },
    { nama: "Ibu Sari Indah", posisi: "Istri", nik: "3271012345678034", kk: "1012012345678023", rt: "03", rw: "05", blok: "Blok E / 03", status: "Kontrak", hp: "081234567034" },
    { nama: "Bpk. Xaverius", posisi: "Suami", nik: "3271012345678035", kk: "1012012345678024", rt: "03", rw: "05", blok: "Blok E / 04", status: "Warga Tetap", hp: "081234567035" },
    { nama: "Bpk. Yusuf Mansur", posisi: "Suami", nik: "3271012345678036", kk: "1012012345678025", rt: "03", rw: "05", blok: "Blok E / 05", status: "Kos", hp: "081234567036" },
    { nama: "Bpk. Zainal Abidin", posisi: "Suami", nik: "3271012345678037", kk: "1012012345678026", rt: "03", rw: "05", blok: "Blok F / 01", status: "Warga Tetap", hp: "081234567037" },
    { nama: "Bpk. Andi Syahputra", posisi: "Suami", nik: "3271012345678038", kk: "1012012345678027", rt: "03", rw: "05", blok: "Blok F / 02", status: "Warga Tetap", hp: "081234567038" },
    { nama: "Ibu Tari Larasati", posisi: "Istri", nik: "3271012345678039", kk: "1012012345678027", rt: "03", rw: "05", blok: "Blok F / 02", status: "Warga Tetap", hp: "081234567039" },
    { nama: "Bpk. Bagus Triyono", posisi: "Suami", nik: "3271012345678040", kk: "1012012345678028", rt: "03", rw: "05", blok: "Blok F / 03", status: "Warga Tetap", hp: "081234567040" },
    { nama: "Bpk. Chaerul Tanjung", posisi: "Suami", nik: "3271012345678041", kk: "1012012345678029", rt: "03", rw: "05", blok: "Blok F / 04", status: "Kontrak", hp: "081234567041" },
    { nama: "Bpk. Darmansyah", posisi: "Suami", nik: "3271012345678042", kk: "1012012345678030", rt: "03", rw: "05", blok: "Blok F / 05", status: "Warga Tetap", hp: "081234567042" }
  ];

  // Membuat daftar opsi statis untuk RT (20) dan RW (50)
  const uniqueRTs = ["Semua", ...Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))];
  const uniqueRWs = ["Semua", ...Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0'))];

  // Terapkan filter pada data
  const filteredWargaData = wargaData.filter(w => {
    // Filter RT/RW
    const matchRT = filterRT === "Semua" || w.rt === filterRT;
    const matchRW = filterRW === "Semua" || w.rw === filterRW;
    
    // Fiter Pencarian
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = searchQuery === "" || 
      w.nama.toLowerCase().includes(searchLower) ||
      w.nik.includes(searchQuery) ||
      w.kk.includes(searchQuery) ||
      w.hp.includes(searchQuery);

    return matchRT && matchRW && matchSearch;
  });

  const handleExportExcel = () => {
    const headers = ['Nama Lengkap', 'Posisi', 'NIK', 'No. KK', 'RT/RW', 'Blok/No', 'Status Warga', 'No. HP'];
    const rows = filteredWargaData.map(w => 
      [w.nama, w.posisi, `'${w.nik}`, `'${w.kk}`, `${w.rt}/${w.rw}`, w.blok, w.status, `'${w.hp}`].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Data_Warga_RT.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Konfigurasi Judul PDF
    doc.setFontSize(16);
    doc.text("DATA WARGA RT", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    // Konfigurasi Tabel Data Warga
    const tableColumn = ["Nama Lengkap", "Posisi", "NIK", "No. KK", "RT/RW", "Blok/No", "Status", "No. HP"];
    const tableRows = [];

    filteredWargaData.forEach(warga => {
      const rowData = [
        warga.nama,
        warga.posisi,
        warga.nik,
        warga.kk,
        `${warga.rt}/${warga.rw}`,
        warga.blok,
        warga.status,
        warga.hp
      ];
      tableRows.push(rowData);
    });

    // Generate tabel menggunakan extension autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] }, // Warna biru
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Warna slate-50
    });

    // Simpan dokumen PDF
    doc.save(`Data_Warga_RT_${new Date().getTime()}.pdf`);
  };

  // Reset page when filter changes
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setCurrentPage(1); // Kembali ke halaman 1 saat filter/pencarian berubah
  };

  // Logika Pagination
  const totalPages = Math.ceil(filteredWargaData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative print:border-none print:shadow-none print:overflow-visible">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white print:hidden">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Daftar Warga
        </h3>
        <div className="flex items-center gap-2">
          {/* Kolom Pencarian */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama/NIK/KK/HP..."
              value={searchQuery}
              onChange={handleFilterChange(setSearchQuery)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all"
            />
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex items-center gap-1.5 mx-2">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <select 
              value={filterRW}
              onChange={handleFilterChange(setFilterRW)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {uniqueRWs.map(rw => <option key={`rw-${rw}`} value={rw}>RW {rw === 'Semua' ? 'Semua' : rw}</option>)}
            </select>
            <select 
              value={filterRT}
              onChange={handleFilterChange(setFilterRT)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {uniqueRTs.map(rt => <option key={`rt-${rt}`} value={rt}>RT {rt === 'Semua' ? 'Semua' : rt}</option>)}
            </select>
          </div>

          <button onClick={handleExportPDF} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <Download className="w-3.5 h-3.5 text-red-500" />
            PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <Download className="w-3.5 h-3.5 text-green-600" />
            Excel
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>
      </div>
      {/* Header Khusus Print */}
      <div className="hidden print:block p-4 mb-4 text-center border-b-2 border-slate-800">
        <h2 className="text-xl font-bold text-slate-900">DATA WARGA RT</h2>
        <p className="text-sm text-slate-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-sm print:text-xs">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider print:bg-white print:text-slate-800 print:border-b-2 print:border-slate-800">
            <tr>
              <th className="px-6 py-3 print:px-2">Nama Lengkap</th>
              <th className="px-6 py-3 print:px-2">Posisi</th>
              <th className="px-6 py-3 print:px-2">NIK</th>
              <th className="px-6 py-3 print:px-2">No. KK</th>
              <th className="px-6 py-3 print:px-2 text-center">RT/RW</th>
              <th className="px-6 py-3 print:px-2">Blok/No</th>
              <th className="px-6 py-3 text-center print:px-2">Status</th>
              <th className="px-6 py-3 print:px-2">No. HP</th>
              <th className="px-6 py-3 text-right print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
            {filteredWargaData.length > 0 ? filteredWargaData.map((warga, idx) => {
              // Sembunyikan baris jika bukan di halaman ini (kecuali jika sedang nge-print)
              const isVisible = idx >= startIndex && idx < endIndex;
              return (
              <tr key={idx} className={`${isVisible ? '' : 'hidden print:table-row'} hover:bg-slate-50 transition-colors print:break-inside-avoid`}>
                <td className="px-6 py-3 font-semibold text-slate-800 print:px-2">{warga.nama}</td>
                <td className="px-6 py-3 text-xs text-slate-500 font-medium print:px-2">{warga.posisi}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black">{warga.nik}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black">{warga.kk}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black text-center">{warga.rt}/{warga.rw}</td>
                <td className="px-6 py-3 text-xs print:px-2">{warga.blok}</td>
                <td className="px-6 py-3 text-center print:px-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${warga.status === 'Warga Tetap' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'} print:border-0 print:p-0 print:bg-transparent print:text-slate-800`}>
                    {warga.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black">{warga.hp}</td>
                <td className="px-6 py-3 text-right print:hidden">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors" title="Hapus">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500 text-xs text-center font-medium">
                  Oops, data warga tidak ditemukan untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50 print:hidden">
        <p>Menampilkan {filteredWargaData.length > 0 ? Math.min(startIndex + 1, filteredWargaData.length) : 0} - {Math.min(endIndex, filteredWargaData.length)} dari {filteredWargaData.length} warga</p>
        <div className="flex gap-2">
           <button 
             onClick={handlePrevPage}
             disabled={currentPage === 1}
             className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 text-slate-600 font-medium disabled:opacity-50 transition-colors" 
           >
             Sebelumnya
           </button>
           <button 
             onClick={handleNextPage}
             disabled={currentPage === totalPages}
             className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 text-slate-600 font-medium disabled:opacity-50 transition-colors"
           >
             Selanjutnya
           </button>
        </div>
      </div>

      {/* Modal Tambah Warga */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Tambah Data Warga</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-4 space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddForm(false); alert("Sinyal siap dikemas untuk POST /TAMBAH_WARGA ke App Script!"); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">NIK</label>
                  <input required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="16 digit NIK" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">No. KK</label>
                  <input required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="16 digit KK" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Sesuai KTP" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tempat Lahir</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Cth: Jakarta" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal Lahir</label>
                  <input required type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Kelamin</label>
                  <select required defaultValue="" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="" disabled>Pilih...</option>
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Kewarga<span className="hidden sm:inline">negaraan</span></label>
                  <select required defaultValue="WNI" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Kawin</label>
                  <select required defaultValue="" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="" disabled>Pilih...</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Posisi dalam Keluarga</label>
                  <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="" disabled selected>Pilih posisi...</option>
                    <option value="Suami">Suami (Kepala Keluarga)</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Warga</label>
                  <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="Warga Tetap">Warga Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Kos">Kos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">RT</label>
                  <select required defaultValue="01" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono cursor-pointer">
                    {Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0')).map(rt => (
                      <option key={`add-rt-${rt}`} value={rt}>{rt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">RW</label>
                  <select required defaultValue="05" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono cursor-pointer">
                    {Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0')).map(rw => (
                      <option key={`add-rw-${rw}`} value={rw}>{rw}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">No. Handphone (WA)</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="08..." />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="nama@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat (Blok / No)</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Blok A / 01" />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function IuranView() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [iuranData, setIuranData] = useState([
    { id: "INV-2604-001", tanggal: "19 Apr 2026, 08:30", transaksi: "Iuran Keamanan", nama: "Bpk. Ahmad Suhendar", periode: "Apr 2026", nominal: 50000, status: "Lunas", keterangan: "-" },
    { id: "INV-2604-002", tanggal: "18 Apr 2026, 14:15", transaksi: "Iuran Kebersihan", nama: "Ibu Siti Aminah", periode: "Apr 2026", nominal: 50000, status: "Pending", keterangan: "Janji bayar akhir bulan" }
  ]);

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
    
    const newPayment = {
      id: `INV-${dateObj.getFullYear().toString().slice(-2)}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${String(iuranData.length + 1).padStart(3, '0')}`,
      tanggal: formattedDate,
      transaksi: formData.get('transaksi') as string,
      nama: formData.get('nama') as string,
      periode: formData.get('periode') as string,
      nominal: parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0"),
      status: formData.get('status') as string,
      keterangan: formData.get('keterangan') as string || "-"
    };

    setIuranData([newPayment, ...iuranData]);
    setShowAddForm(false);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const handleExportExcelIuran = () => {
    const headers = ['ID Bayar', 'Tanggal Waktu', 'Transaksi', 'Nama Warga', 'Periode', 'Nominal', 'Status', 'Keterangan'];
    const rows = iuranData.map(trx => 
      [trx.id, `"${trx.tanggal}"`, trx.transaksi, trx.nama, trx.periode, trx.nominal, trx.status, `"${trx.keterangan}"`].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Iuran_Warga.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDFIuran = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("LAPORAN IURAN WARGA", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["ID Bayar", "Tanggal", "Transaksi", "Nama Warga", "Periode", "Nominal", "Status"];
    const tableRows: any[] = [];

    iuranData.forEach(trx => {
      tableRows.push([
        trx.id,
        trx.tanggal.split(',')[0],
        trx.transaksi,
        trx.nama,
        trx.periode,
        formatRupiah(trx.nominal),
        trx.status
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Laporan_Iuran_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Pencatatan Iuran Warga
        </h3>
        <div className="flex gap-2">
          <button onClick={handleExportExcelIuran} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <Download className="w-3.5 h-3.5 text-green-600" /> Excel
          </button>
          <button onClick={handleExportPDFIuran} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
          </button>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ml-2">
            <PlusCircle className="w-3.5 h-3.5" />
            Catat Pembayaran
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">ID Bayar</th>
              <th className="px-6 py-3">Tanggal Waktu</th>
              <th className="px-6 py-3">Transaksi</th>
              <th className="px-6 py-3">Nama Warga</th>
              <th className="px-6 py-3">Periode</th>
              <th className="px-6 py-3 text-right">Nominal</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {iuranData.map((trx, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{trx.id}</td>
                <td className="px-6 py-3 text-xs">{trx.tanggal}</td>
                <td className="px-6 py-3 text-xs font-semibold">{trx.transaksi}</td>
                <td className="px-6 py-3 font-semibold text-slate-800">{trx.nama}</td>
                <td className="px-6 py-3 text-xs font-medium">{trx.periode}</td>
                <td className="px-6 py-3 text-right font-mono text-xs font-medium text-slate-700">{formatRupiah(trx.nominal)}</td>
                <td className="px-6 py-3">
                   <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${trx.status === 'Lunas' ? 'border-green-200 bg-green-50 text-green-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
                     {trx.status}
                   </span>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 italic max-w-[150px] truncate" title={trx.keterangan}>{trx.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Overlay Catat Pembayaran */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Catat Pembayaran Iuran
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddPayment} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Transaksi</label>
                  <select name="transaksi" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Iuran Keamanan">Iuran Keamanan</option>
                    <option value="Iuran Kebersihan">Iuran Kebersihan (Sampah)</option>
                    <option value="Kas / Kas RW">Kas / Kas RW</option>
                    <option value="Sumbangan Sosial">Sumbangan Sosial / Kematian</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Warga / Penyetor</label>
                  <input name="nama" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Bpk. Bambang" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Periode Bulan</label>
                  <select name="periode" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Jan 2026">Jan 2026</option>
                    <option value="Feb 2026">Feb 2026</option>
                    <option value="Mar 2026">Mar 2026</option>
                    <option value="Apr 2026" selected>Apr 2026</option>
                    <option value="Mei 2026">Mei 2026</option>
                    <option value="Jun 2026">Jun 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                  <input name="nominal" required type="number" defaultValue="50000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Pembayaran</label>
                <select name="status" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold cursor-pointer">
                  <option value="Lunas">Lunas (Selesai)</option>
                  <option value="Pending">Pending (Cicilan/Menunggu)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan Tambahan / Catatan</label>
                <textarea name="keterangan" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Ada catatan khusus? (Opsional)"></textarea>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Simpan Iuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SuratView() {
  const [showSuratForm, setShowSuratForm] = useState(false);
  const [suratData, setSuratData] = useState([
    { id: "SRT-1004", tanggal: "19 Apr 2026", pemohon: "Ibu Siti Aminah", jenis: "Surat Domisili", status: "Diajukan" },
    { id: "SRT-1003", tanggal: "17 Apr 2026", pemohon: "Bpk. Ahmad Suhendar", jenis: "Pengantar Kelurahan", status: "Selesai" },
    { id: "SRT-1002", tanggal: "16 Apr 2026", pemohon: "Sdr. Bayu Pratama", jenis: "Surat Keterangan Usaha", status: "Diajukan" }
  ]);

  const handleSetujui = (id: string) => {
    setSuratData(prev => prev.map(s => s.id === id ? { ...s, status: "Selesai" } : s));
  };

  const handleTolak = (id: string) => {
    setSuratData(prev => prev.map(s => s.id === id ? { ...s, status: "Ditolak" } : s));
  };

  const handleCetak = (id: string) => {
    const surat = suratData.find(s => s.id === id);
    if (!surat) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up blocker diizinkan.');
      return;
    }

    const html = `
      <html>
        <head>
          <title>Cetak Surat - ${surat.id}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.6; color: #000; }
            .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .subtitle { font-size: 16px; margin: 5px 0 0; }
            .content { margin-top: 30px; text-align: justify; text-justify: inter-word; }
            .details { margin: 20px 0; border-collapse: collapse; width: 100%; font-size: 16px; }
            .details td { padding: 6px 4px; vertical-align: top; }
            .details td:first-child { width: 180px; }
            .footer { margin-top: 50px; text-align: right; }
            .signature { display: inline-block; text-align: center; margin-top: 20px; }
            .signature-space { height: 80px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">RUKUN TETANGGA (RT) 01 / RUKUN WARGA (RW) 05</h1>
            <p class="subtitle">Kelurahan Sukamaju, Kecamatan Sukajaya, Kabupaten/Kota Metropolitan</p>
          </div>
          
          <div class="text-center font-bold" style="text-decoration: underline; font-size: 18px;">
            ${surat.jenis.toUpperCase()}
          </div>
          <div class="text-center" style="margin-bottom: 30px;">
            Nomor: ${surat.id} / RT.01 / ${new Date().getFullYear()}
          </div>

          <div class="content">
            <p>Yang bertanda tangan di bawah ini selaku Ketua RT 01 / RW 05, Kelurahan Sukamaju, dengan ini menerangkan bahwa:</p>
            
            <table class="details">
              <tr>
                <td>Nama Pemohon</td>
                <td>: <strong>${surat.pemohon}</strong></td>
              </tr>
              <tr>
                <td>Tanggal Permohonan</td>
                <td>: ${surat.tanggal}</td>
              </tr>
              <tr>
                <td>Keperluan Layanan</td>
                <td>: ${surat.jenis}</td>
              </tr>
            </table>

            <p>Bahwa nama tersebut di atas adalah benar warga yang berdomisili di wilayah RT 01 / RW 05. Surat keterangan ini diterbitkan berdasarkan permohonan yang bersangkutan untuk dipergunakan sebagaimana mestinya.</p>
            <p>Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat digunakan oleh pihak yang berkepentingan.</p>
          </div>

          <div class="footer">
            <div class="signature">
              <p>Dikeluarkan di: Metropolitan</p>
              <p>Pada Tanggal: ${surat.tanggal}</p>
              <br/>
              <p><strong>Ketua RT 01</strong></p>
              <div class="signature-space"></div>
              <p><strong>( ..................................... )</strong></p>
            </div>
          </div>
          
          <script>
            window.onload = function() { 
              setTimeout(function() {
                window.print(); 
                window.close(); 
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddSurat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Auto Id (SRT-100X)
    const newId = `SRT-${1000 + suratData.length + 1}`;
    
    const newSurat = {
      id: newId,
      tanggal: formattedDate,
      pemohon: formData.get('pemohon') as string,
      jenis: formData.get('jenis') as string,
      status: "Diajukan"
    };

    setSuratData([newSurat, ...suratData]);
    setShowSuratForm(false);
  };

  const pendingCount = suratData.filter(s => s.status === 'Diajukan').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Layanan Surat Pengantar
        </h3>
        <div className="flex gap-2 items-center">
          {pendingCount > 0 ? (
            <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-3 py-1.5 rounded font-bold tracking-wider uppercase">
              {pendingCount} Menunggu Review
            </span>
          ) : (
            <span className="bg-green-50 text-green-600 border border-green-100 text-[10px] px-3 py-1.5 rounded font-bold tracking-wider uppercase">
              Semua Tuntas
            </span>
          )}
          <button onClick={() => setShowSuratForm(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
            Buat Surat
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">ID Pengajuan</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Pemohon</th>
              <th className="px-6 py-3">Jenis Surat</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {suratData.map((surat) => (
              <tr key={surat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{surat.id}</td>
                <td className="px-6 py-3 text-xs">{surat.tanggal}</td>
                <td className="px-6 py-3 font-semibold text-slate-800">{surat.pemohon}</td>
                <td className="px-6 py-3 text-xs">{surat.jenis}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${
                    surat.status === 'Selesai' ? 'border-green-200 bg-green-50 text-green-700' : 
                    surat.status === 'Ditolak' ? 'border-red-200 bg-red-50 text-red-700' :
                    'border-orange-200 bg-orange-50 text-orange-700'
                  }`}>
                    {surat.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right flex justify-end gap-2">
                  {surat.status === 'Diajukan' ? (
                    <>
                      <button onClick={() => handleSetujui(surat.id)} className="text-[10px] font-bold text-green-700 hover:bg-green-100 transition-colors cursor-pointer bg-green-50 px-3 py-1.5 rounded border border-green-200 flex items-center gap-1">
                        Setujui
                      </button>
                      <button onClick={() => handleTolak(surat.id)} className="text-[10px] font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer bg-red-50 px-3 py-1.5 rounded border border-red-200 flex items-center gap-1">
                        Tolak
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleCetak(surat.id)} disabled={surat.status === 'Ditolak'} className={`text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded border transition-colors ${surat.status === 'Selesai' ? 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 cursor-pointer' : 'text-slate-400 bg-transparent border-transparent cursor-not-allowed hidden'}`}>
                      Cetak Surat
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Overlay Pembuatan Surat */}
      {showSuratForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Buat Surat Pengantar
              </h3>
              <button onClick={() => setShowSuratForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddSurat} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Warga / Pemohon</label>
                <input name="pemohon" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Bpk. Joko Anas" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Layanan Surat</label>
                <select name="jenis" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                  <option value="Surat Domisili">Surat Domisili / Keterangan Tempat Tinggal</option>
                  <option value="Surat Keterangan Usaha">Surat Keterangan Usaha (SKU)</option>
                  <option value="Pengantar Kelurahan">Surat Pengantar Kelurahan / Desa</option>
                  <option value="Surat Keterangan Menikah">Surat Keterangan Belum/Akan Menikah</option>
                  <option value="Surat Keterangan Kematian">Surat Keterangan Kematian</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSuratForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Ajukan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KasView() {
  const [showMasukForm, setShowMasukForm] = useState(false);
  const [kasData, setKasData] = useState([
    { id: "TRX-002", tanggal: "19 Apr 2026", tipe: "Masuk", transaksi: "Iuran Warga", nama: "Kel. Bpk. Agus", keterangan: "Pembayaran Iuran NIK 3271..01", debit: 50000, kredit: 0 },
    { id: "TRX-001", tanggal: "15 Apr 2026", tipe: "Keluar", transaksi: "Biaya Operasional", nama: "Pengurus RT", keterangan: "Biaya Kebersihan Lingkungan RT", debit: 0, kredit: 750000 }
  ]);

  const handleAddPemasukan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newId = `TRX-${String(kasData.length + 1).padStart(3, '0')}`;
    const nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const tipe = formData.get('tipe') as string;
    
    const newTrx = {
      id: newId,
      tanggal: formattedDate,
      tipe: tipe,
      transaksi: formData.get('transaksi') as string,
      nama: formData.get('nama') as string,
      keterangan: formData.get('keterangan') as string,
      debit: tipe === 'Masuk' ? nominal : 0,
      kredit: tipe === 'Keluar' ? nominal : 0
    };

    setKasData([newTrx, ...kasData]);
    setShowMasukForm(false);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka);
  };

  // Saldo awal bayangan sebelum inputan TRX
  let runningBalance = 5200000; 
  const processedData = [...kasData].reverse().map(trx => {
     runningBalance = runningBalance + trx.debit - trx.kredit;
     return { ...trx, saldoAkhir: runningBalance };
  }).reverse();

  const totalPemasukan = 5200000 + kasData.reduce((sum, trx) => sum + trx.debit, 0);
  const totalPengeluaran = kasData.reduce((sum, trx) => sum + trx.kredit, 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  const handleExportExcelKas = () => {
    const headers = ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori Transaksi', 'Nama', 'Keterangan', 'Debit (Masuk)', 'Kredit (Keluar)', 'Saldo Akhir'];
    const rows = processedData.map(trx => 
      [trx.id, trx.tanggal, trx.tipe, `"${trx.transaksi || ''}"`, `"${trx.nama || ''}"`, `"${trx.keterangan || ''}"`, trx.debit, trx.kredit, trx.saldoAkhir].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Buku_Kas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDFKas = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("LAPORAN BUKU KAS", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["ID Transaksi", "Tanggal", "Tipe", "Kategori", "Nama", "Keterangan", "Debit", "Kredit", "Saldo"];
    const tableRows: any[] = [];

    processedData.forEach(trx => {
      tableRows.push([
        trx.id,
        trx.tanggal,
        trx.tipe,
        trx.transaksi || '-',
        trx.nama || '-',
        trx.keterangan || '-',
        formatRupiah(trx.debit),
        formatRupiah(trx.kredit),
        formatRupiah(trx.saldoAkhir)
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Laporan_Buku_Kas_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Pemasukan</p>
          <p className="text-2xl font-black text-green-600">Rp {formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-black text-red-500">Rp {formatRupiah(totalPengeluaran)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen className="w-16 h-16 text-white" /></div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 relative z-10">Saldo Akhir</p>
          <p className="text-2xl font-black text-white relative z-10">Rp {formatRupiah(saldoAkhir)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
            Riwayat Transaksi
          </h3>
          <div className="flex gap-2">
             <button onClick={handleExportExcelKas} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Download className="w-3.5 h-3.5 text-green-600" /> Excel
             </button>
             <button onClick={handleExportPDFKas} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
             </button>
             <button onClick={() => setShowMasukForm(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ml-2">
              <PlusCircle className="w-3.5 h-3.5" /> Tambah
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">ID Transaksi</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Keterangan</th>
                <th className="px-6 py-3 text-right">Debit (Masuk)</th>
                <th className="px-6 py-3 text-right">Kredit (Keluar)</th>
                <th className="px-6 py-3 text-right bg-slate-50">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {processedData.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{trx.id}</td>
                  <td className="px-6 py-3 text-xs">{trx.tanggal}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${trx.tipe === 'Masuk' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {trx.tipe}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs">
                    <div className="font-bold text-slate-800">{trx.transaksi}</div>
                    <div className="text-slate-500 mt-0.5">{trx.nama && `${trx.nama} - `}{trx.keterangan}</div>
                  </td>
                  <td className={`px-6 py-3 text-right font-mono text-xs ${trx.debit > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {trx.debit > 0 ? formatRupiah(trx.debit) : '0'}
                  </td>
                  <td className={`px-6 py-3 text-right font-mono text-xs ${trx.kredit > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {trx.kredit > 0 ? formatRupiah(trx.kredit) : '0'}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-xs font-bold bg-slate-50/50 text-slate-800">
                    {formatRupiah(trx.saldoAkhir)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Overlay Catat Pemasukan */}
      {showMasukForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-green-600" />
                Catatan Kas
              </h3>
              <button onClick={() => setShowMasukForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddPemasukan} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal</label>
                  <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tipe Transaksi</label>
                  <select name="tipe" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Masuk">Pemasukan (Masuk)</option>
                    <option value="Keluar">Pengeluaran (Keluar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Transaksi / Kategori</label>
                  <select name="transaksi" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Iuran Warga">Iuran Warga</option>
                    <option value="Kas Lingkungan">Kas Lingkungan</option>
                    <option value="Dana Bantuan">Dana Bantuan</option>
                    <option value="Sumbangan Sosial">Sumbangan Sosial</option>
                    <option value="Biaya Operasional">Biaya Operasional</option>
                    <option value="Biaya Perbaikan">Biaya Perbaikan</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Pemohon / Penyetor</label>
                  <input name="nama" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Kel. Bpk. Agus" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan Tambahan</label>
                <input name="keterangan" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Pembayaran iuran / Biaya perbaikan" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                <input name="nominal" required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="50000" />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowMasukForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PengaturanView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Pengaturan Sistem & Database
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Konfigurasi Umum */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Konfigurasi Umum</h4>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal Iuran Tetap (Rp)</label>
              <input type="number" defaultValue="50000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Lingkungan (RT/RW)</label>
              <input type="text" defaultValue="RT 04 / RW 09" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Ketua RT</label>
              <input type="text" defaultValue="Bpk. Bambang" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          {/* Konfigurasi Integrasi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Integrasi WhatsApp API</h4>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Automasi</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                <option value="aktif">Aktif (Tiap Tgl 5)</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Token API (Bearer)</label>
              <input type="password" defaultValue="TOKEN_RAHASIA_123" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
              <p className="text-[10px] text-slate-400 mt-1">Jangan bagikan token ini kepada siapapun.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Template Pesan Reminder</label>
              <textarea rows={3} defaultValue="Halo Bpk/Ibu {nama}, ini adalah pengingat dari Sistem RT..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">
            Simpan Pengaturan
          </button>
        </div>
      </div>
      
      {/* Database Schema Map Info */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col">
        <h3 className="text-sm font-bold mb-4 flex items-center text-blue-400">
          Struktur Sheet 'Pengaturan' di Google Tables
        </h3>
        <div className="font-mono text-[11px] space-y-2 text-slate-300 bg-slate-800 p-4 rounded border border-slate-700 overflow-x-auto">
          <p className="text-green-400 mb-2">// Buat Sheet baru dengan nama "Pengaturan". Isi Kolom A (Key) dan Kolom B (Value):</p>
          <table className="w-full text-left">
             <thead className="text-slate-500 border-b border-slate-700">
               <tr>
                 <th className="pb-2 w-1/3">Kunci / Key (Kolom A)</th>
                 <th className="pb-2 w-2/3">Nilai / Value (Kolom B)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-700/50">
               <tr>
                 <td className="py-2 text-blue-300">NOMINAL_IURAN</td>
                 <td className="py-2">50000</td>
               </tr>
               <tr>
                 <td className="py-2 text-blue-300">NAMA_RT</td>
                 <td className="py-2">RT 04 / RW 09</td>
               </tr>
               <tr>
                 <td className="py-2 text-blue-300">TOKEN_WA</td>
                 <td className="py-2">ab12cd34ef56...</td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
