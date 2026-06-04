import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Recycle,
  LayoutDashboard,
  PlusCircle,
  HandCoins,
  Users,
  Settings,
  Wallet,
  TrendingUp,
  History,
  Search,
  Eye,
  Edit,
  Trash2,
  User,
  Info,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { StyledButton } from "./StyledButton";
import { ConfirmModal } from "./ui/ConfirmModal";

export default function BankSampahView({
  sampahKategoriData = [],
  sampahSetoranData = [],
  sampahTarikSaldoData = [],
  wargaData = [],
  currentUser,
  tenantId,
  handleFirestoreError,
  showNotification,
  getSetting,
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<
    | "dashboard"
    | "setoran"
    | "tarik"
    | "nasabah"
    | "kategori"
    | "nasabah_detail"
  >("dashboard");
  const [showKategoriForm, setShowKategoriForm] = useState(false);
  const [showSetoranForm, setShowSetoranForm] = useState(false);
  const [showTarikForm, setShowTarikForm] = useState(false);
  const [showNasabahForm, setShowNasabahForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedNasabahId, setSelectedNasabahId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        for (const row of data as any[]) {
          // Expecting columns matching common pattern: NIK, Nama, Total/Nominal, Tanggal
          const nik = row.NIK || row.nik;
          const total = parseFloat(
            row.Total || row.total || row.Setoran || row.setoran || 0,
          );

          if (nik && total > 0) {
            const id = `STR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            await setDoc(doc(db, "sampah_setoran", id), {
              tenantId,
              id,
              nasabahId: String(nik),
              namaKategori: row.Kategori || row.kategori || "Impor Masal",
              berat: parseFloat(row.Berat || row.berat || 0),
              total: total,
              tanggal:
                row.Tanggal ||
                row.tanggal ||
                new Date().toISOString().split("T")[0],
              petugas: currentUser?.email?.split("@")[0] || "Admin",
            });
            successCount++;
          }
        }

        if (successCount > 0) {
          showNotification(
            `Berhasil mengimpor ${successCount} data transaksi!`,
            "success",
          );
        } else {
          showNotification(
            "Tidak ada data valid yang ditemukan untuk diimpor.",
            "info",
          );
        }
        // Reset input
        e.target.value = "";
      } catch (error) {
        console.error(error);
        showNotification(
          "Gagal memproses file Excel. Pastikan format benar.",
          "error",
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const roleUpper = currentUser?.role?.toUpperCase() || "";
  const canEdit = !["VIEWER", "WARGA", "TAMU"].includes(roleUpper);
  const isWarga = roleUpper === "WARGA";

  const filteredSampahSetoran = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (sampahSetoranData || []).filter((s: any) => s.nasabahId === currentUser.nik);
    }
    return sampahSetoranData || [];
  }, [sampahSetoranData, isWarga, currentUser?.nik]);

  const filteredSampahTarikSaldo = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (sampahTarikSaldoData || []).filter((t: any) => t.nasabahId === currentUser.nik);
    }
    return sampahTarikSaldoData || [];
  }, [sampahTarikSaldoData, isWarga, currentUser?.nik]);

  // Nasabah Summary (Warga with their balances)
  const nasabahSummary = useMemo(() => {
    let summary = wargaData
      .map((w: any) => {
        const setoran = sampahSetoranData
          .filter((s: any) => s.nasabahId === w.nik)
          .reduce(
            (acc: number, curr: any) => acc + (parseFloat(curr.total) || 0),
            0,
          );
        const tarikan = sampahTarikSaldoData
          .filter((t: any) => t.nasabahId === w.nik)
          .reduce(
            (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
            0,
          );
        return {
          ...w,
          saldo: setoran - tarikan,
          totalSetoran: setoran,
        };
      })
      .filter(
        (n: any) => n.totalSetoran > 0 || n.saldo > 0 || n.isNasabah === true,
      );
      
    if (isWarga && currentUser?.nik) {
      summary = summary.filter((n: any) => n.nik === currentUser.nik);
    }
    return summary;
  }, [wargaData, sampahSetoranData, sampahTarikSaldoData, isWarga, currentUser?.nik]);

  // Auto-select self as nasabah for WARGA
  useEffect(() => {
    if (isWarga && currentUser?.nik && activeSubTab === "dashboard") {
      // Find matching nasabah by NIK
      const match = nasabahSummary.find((n: any) => n.nik === currentUser.nik || n.email === currentUser.email);
      if (match) {
        setSelectedNasabahId(match.nik);
      }
    }
  }, [isWarga, currentUser?.nik, currentUser?.email, nasabahSummary, activeSubTab]);

  // Statistics
  const stats = useMemo(() => {
    const activeSetoran = isWarga ? filteredSampahSetoran : sampahSetoranData;
    const activeTarikan = isWarga ? filteredSampahTarikSaldo : sampahTarikSaldoData;

    return {
      totalSampah: activeSetoran.reduce(
        (acc: number, curr: any) => acc + (parseFloat(curr.berat) || 0),
        0,
      ),
      totalTabungan:
        activeSetoran.reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.total) || 0),
          0,
        ) -
        activeTarikan.reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
          0,
        ),
      transaksiBulanIni: activeSetoran.filter((s: any) =>
        s.tanggal?.startsWith(new Date().toISOString().slice(0, 7)),
      ).length,
      nasabahAktif: new Set(activeSetoran.map((s: any) => s.nasabahId)).size,
    };
  }, [sampahSetoranData, sampahTarikSaldoData, filteredSampahSetoran, filteredSampahTarikSaldo, isWarga]);

  const selectedNasabah = selectedNasabahId
    ? nasabahSummary.find((n: any) => n.nik === selectedNasabahId)
    : null;

  const handleSaveKategori = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId,
      id: editingItem?.id || `KAT-${Date.now()}`,
      nama: formData.get("nama"),
      satuan: formData.get("satuan"),
      hargaBeli: parseFloat(formData.get("hargaBeli") as string),
    };

    try {
      await setDoc(doc(db, "sampah_kategori", data.id), data);
      showNotification(`Kategori ${data.nama} berhasil disimpan`);
      setShowKategoriForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "create", "sampah_kategori");
    }
  };

  const handleSaveSetoran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const katId = formData.get("kategoriId") as string;
    const kategori = sampahKategoriData.find((k: any) => k.id === katId);
    const nasabahId = formData.get("nasabahId") as string;
    const nasabah = wargaData.find((w: any) => w.nik === nasabahId);

    const berat = parseFloat(formData.get("berat") as string);
    const harga = kategori?.hargaBeli || 0;
    const total = berat * harga;

    const data = {
      tenantId,
      id: editingItem?.id || `STR-${Date.now()}`,
      nasabahId,
      namaNasabah: nasabah?.nama || "Unknown",
      kategoriId: katId,
      namaKategori: kategori?.nama || "Unknown",
      berat,
      harga,
      total,
      tanggal: formData.get("tanggal"),
      status: "Selesai",
      keterangan: formData.get("keterangan"),
    };

    try {
      await setDoc(doc(db, "sampah_setoran", data.id), data);
      showNotification(
        `Setoran senilai Rp${total.toLocaleString()} berhasil dicatat`,
      );
      setShowSetoranForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "create", "sampah_setoran");
    }
  };

  const handleSaveTarik = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nasabahId =
      editingItem?.nasabahId || (formData.get("nasabahId") as string);
    const nasabah = wargaData.find((w: any) => w.nik === nasabahId);
    const nominal = parseFloat(formData.get("nominal") as string);

    const data = {
      tenantId,
      id: editingItem?.id || `TRK-${Date.now()}`,
      nasabahId,
      namaNasabah: nasabah?.nama || "Unknown",
      nominal,
      tanggal: formData.get("tanggal"),
      keterangan: formData.get("keterangan"),
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, "sampah_tarik_saldo", editingItem.id), data);
        showNotification(`Penarikan berhasil diperbarui`);
      } else {
        await setDoc(doc(db, "sampah_tarik_saldo", data.id), data);
        showNotification(
          `Penarikan Rp${nominal.toLocaleString()} berhasil dicatat`,
        );
      }
      setShowTarikForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "create", "sampah_tarik_saldo");
    }
  };

  const handleSaveNasabah = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inik = formData.get("nik") as string;
    const inama = formData.get("nama") as string;
    const irt = formData.get("rt") as string;
    const irw = formData.get("rw") as string;

    if (!inik || !inama) return;

    try {
      if (editingItem) {
        await updateDoc(doc(db, "warga", editingItem.nik), {
          nama: inama,
          rt: irt,
          rw: irw,
          isNasabah: true,
        });
        showNotification("Data nasabah (warga) berhasil diperbarui");
      } else {
        const newWarga = {
          tenantId,
          nik: inik,
          nama: inama,
          rt: irt,
          rw: irw,
          blok: "",
          kelurahan: "",
          kecamatan: "",
          kota_kab: "",
          status: "Warga Tetap",
          hp: "",
          email: "",
          foto: "",
          ktpUrl: "",
          posisi: "",
          profesi: "",
          pendidikanTerakhir: "",
          jk: "Laki-Laki",
          tglLahir: "",
          tempatLahir: "",
          kawin: "Belum Kawin",
          kewarganegaraan: "WNI",
          isNasabah: true,
        };
        await setDoc(doc(db, "data_warga", inik), newWarga);
        showNotification("Nasabah (Warga) baru berhasil ditambahkan!");
      }
      setShowNasabahForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(
        err,
        editingItem ? "update" : "create",
        "data_warga",
      );
    }
  };

  const deleteItemsByNasabah = async (nik: string) => {
    setConfirmConfig({
      title: "Hapus Semua Transaksi",
      message: `Yakin ingin menghapus SEMUA riwayat transaksi (Setoran & Penarikan) untuk nasabah dengan NIK ${nik}? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        try {
          const setoranToDelete = sampahSetoranData.filter(
            (s: any) => s.nasabahId === nik,
          );
          const tarikToDelete = sampahTarikSaldoData.filter(
            (t: any) => t.nasabahId === nik,
          );

          for (const s of setoranToDelete) {
            await deleteDoc(doc(db, "sampah_setoran", s.id));
          }
          for (const t of tarikToDelete) {
            await deleteDoc(doc(db, "sampah_tarik_saldo", t.id));
          }

          showNotification(`Semua riwayat transaksi nasabah berhasil dihapus.`);
        } catch (err) {
          handleFirestoreError(err, "delete", "bank_sampah_mass");
        }
        setConfirmConfig(null);
      },
    });
  };

  const deleteItem = async (collectionName: string, id: string) => {
    setConfirmConfig({
      title: "Hapus Data",
      message:
        "Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, collectionName, id));
          showNotification("Data berhasil dihapus");
        } catch (err) {
          handleFirestoreError(err, "delete", collectionName);
        }
        setConfirmConfig(null);
      },
    });
  };

  const exportAllSetoranExcel = () => {
    const data = sampahSetoranData.map((s) => ({
      Nasabah: s.namaNasabah,
      Kategori: s.namaKategori,
      "Berat (kg)": s.berat,
      Harga: s.harga,
      Total: s.total,
      Tanggal: s.tanggal,
      Keterangan: s.keterangan || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Setoran Bank Sampah");
    XLSX.writeFile(
      wb,
      `Setoran_Sampah_All_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Eksport Excel Berhasil!");
  };

  const exportAllSetoranPDF = () => {
    const doc = new jsPDF();
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LAPORAN SETORAN BANK SAMPAH", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

    const tableData = sampahSetoranData.map((s: any) => [
      s.namaNasabah,
      s.namaKategori,
      s.berat + " kg",
      "Rp " + s.total.toLocaleString(),
      s.tanggal,
    ]);

    autoTable(doc, {
      startY: 49,
      head: [["Nasabah", "Kategori", "Berat", "Total", "Tanggal"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(
      `Laporan_Setoran_Sampah_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification("Eksport PDF Berhasil!");
  };

  const exportBukuTabunganPDF = (nasabah: any) => {
    const doc = new jsPDF();
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BUKU TABUNGAN BANK SAMPAH", 14, 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Nasabah: ${nasabah.nama}`, 14, 40);
    doc.text(`NIK: ${nasabah.nik}`, 14, 45);
    doc.text(`Blok/RT: ${nasabah.blok} / ${nasabah.rt}`, 14, 50);

    const transactions = [
      ...sampahSetoranData
        .filter((s: any) => s.nasabahId === nasabah.nik)
        .map((s) => ({ ...s, type: "Setoran", amount: s.total })),
      ...sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === nasabah.nik)
        .map((t) => ({ ...t, type: "Penarikan", amount: -t.nominal })),
    ].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
    );

    let currentSaldo = 0;
    const tableData = transactions.map((t: any) => {
      currentSaldo += t.amount;
      return [
        t.tanggal,
        t.type,
        t.type === "Setoran" ? t.namaKategori : "-",
        t.type === "Setoran" ? t.berat + " kg" : "-",
        t.amount > 0 ? "Rp " + t.amount.toLocaleString() : "-",
        t.amount < 0 ? "Rp " + Math.abs(t.amount).toLocaleString() : "-",
        "Rp " + currentSaldo.toLocaleString(),
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [["Tanggal", "Jenis", "Item", "Berat", "Masuk", "Keluar", "Saldo"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(
      `Buku_Tabungan_${nasabah.nama}_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification(`Buku Tabungan ${nasabah.nama} berhasil diunduh!`);
  };

  const exportBukuTabunganExcel = (nasabah: any) => {
    const transactions = [
      ...sampahSetoranData
        .filter((s: any) => s.nasabahId === nasabah.nik)
        .map((s) => ({ ...s, type: "Setoran", amount: s.total })),
      ...sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === nasabah.nik)
        .map((t) => ({ ...t, type: "Penarikan", amount: -t.nominal })),
    ].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
    );

    let currentSaldo = 0;
    const data = transactions.map((t: any) => {
      currentSaldo += t.amount;
      return {
        Tanggal: t.tanggal,
        Jenis: t.type,
        Item: t.type === "Setoran" ? t.namaKategori : "-",
        Berat: t.type === "Setoran" ? t.berat : 0,
        Masuk: t.amount > 0 ? t.amount : 0,
        Keluar: t.amount < 0 ? Math.abs(t.amount) : 0,
        Saldo: currentSaldo,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Tabungan");
    XLSX.writeFile(
      wb,
      `Tabungan_${nasabah.nama}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Eksport Excel Tabungan Berhasil!");
  };

  const exportNasabahSummaryExcel = () => {
    const data = nasabahSummary.map((n) => {
      const totalDitarik = sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === n.nik)
        .reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
          0,
        );
      return {
        "Nama Nasabah": n.nama,
        NIK: n.nik,
        "Total Tabungan": n.totalSetoran,
        "Telah Ditarik": totalDitarik,
        "Saldo Saat Ini": n.saldo,
        Alamat: `Blok ${n.blok} / RT ${n.rt}`,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ringkasan Nasabah");
    XLSX.writeFile(
      wb,
      `Ringkasan_Nasabah_Sampah_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Eksport Ringkasan Nasabah Excel Berhasil!");
  };

  const exportNasabahSummaryPDF = () => {
    const doc = new jsPDF();
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("RINGKASAN SALDO NASABAH BANK SAMPAH", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

    const tableData = nasabahSummary.map((n: any) => {
      const totalDitarik = sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === n.nik)
        .reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
          0,
        );
      return [
        n.nama,
        n.nik,
        "Rp " + n.totalSetoran.toLocaleString(),
        "Rp " + totalDitarik.toLocaleString(),
        "Rp " + n.saldo.toLocaleString(),
      ];
    });

    autoTable(doc, {
      startY: 49,
      head: [
        ["Nama Nasabah", "NIK", "Total Tabungan", "Tarik Saldo", "Saldo Sisa"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(
      `Ringkasan_Nasabah_Sampah_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification("Eksport Ringkasan Nasabah PDF Berhasil!");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Recycle className="w-8 h-8 text-emerald-600" />
            Bank Sampah
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Ubah sampah menjadi tabungan bermanfaat
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {([
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "setoran", label: "Setoran", icon: PlusCircle },
            { id: "tarik", label: "Tarik Saldo", icon: HandCoins },
            { id: "nasabah", label: "Nasabah", icon: Users },
            {
              id: "kategori",
              label: "Kategori",
              icon: Settings,
              adminOnly: true,
            },
          ] as { id: typeof activeSubTab; label: string; icon: any; adminOnly?: boolean }[])
            .filter((tab) => !tab.adminOnly || canEdit)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                  activeSubTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-black tracking-wide hover:brightness-105"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
        </div>
      </div>

      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:border-emerald-300/50">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Recycle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Total Sampah
              </p>
              <p className="text-2xl font-black text-slate-800">
                {stats.totalSampah.toFixed(1)}{" "}
                <span className="text-sm font-bold text-slate-400">kg</span>
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:border-blue-300/50">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Total Tabungan
              </p>
              <p className="text-2xl font-black text-slate-800">
                Rp {stats.totalTabungan.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:border-orange-300/50">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Setoran Bulan Ini
              </p>
              <p className="text-2xl font-black text-slate-800">
                {stats.transaksiBulanIni}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:border-purple-300/50">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Nasabah Aktif
              </p>
              <p className="text-2xl font-black text-slate-800">
                {stats.nasabahAktif}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden text-slate-800">
              <div className="px-2 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight text-sm">
                  <History className="w-4 h-4 text-emerald-600" />
                  Setoran Terakhir
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Nasabah</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4 text-right">Berat</th>
                      <th className="px-6 py-4 text-right">Total</th>
                      <th className="px-6 py-4">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(isWarga ? filteredSampahSetoran : sampahSetoranData)
                      .slice(0, 5)
                      .map((item: any, idx: number) => (
                        <tr
                          key={`sampah-item-${item.id || idx}-${idx}`}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-black">
                            {item.namaNasabah}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-tight">
                              {item.namaKategori}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-black">
                            {item.berat} kg
                          </td>
                          <td className="px-6 py-4 text-right font-black">
                            Rp {item.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-[11px] font-bold">
                            {item.tanggal}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price List Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-emerald-500/5">
                <h3 className="font-black text-emerald-800 flex items-center gap-2 uppercase tracking-tight text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Harga Hari Ini
                </h3>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[300px]">
                {sampahKategoriData.map((kat: any) => (
                  <div
                    key={kat.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-700">
                        {kat.nama}
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        {kat.hargaBeli.toLocaleString()} / {kat.satuan}
                      </p>
                    </div>
                    <p className="text-emerald-600 font-black">
                      Rp {kat.hargaBeli.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "setoran" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari setoran..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-emerald-500/20 shadow-inner"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {canEdit && (
              <StyledButton
                label="Catat Setoran"
                onClick={() => setShowSetoranForm(true)}
                colorType="success"
                icon={<PlusCircle className="w-4 h-4" />}
                className="font-bold"
              />
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-3">Nasabah</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3 text-right">Berat</th>
                  <th className="px-6 py-3 text-right">Harga</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                {filteredSampahSetoran
                  .filter((s: any) =>
                    s.namaNasabah
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((item: any, idx: number) => (
                    <tr
                      key={`sampah-setoran-row-${item.id || idx}-${idx}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.namaNasabah}
                      </td>
                      <td className="px-6 py-4">{item.namaKategori}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        {item.berat} kg
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        Rp {item.harga.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">
                        Rp {item.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const n = nasabahSummary.find(
                                (nas: any) => nas.nik === item.nasabahId,
                              );
                              if (n) {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab("nasabah_detail");
                              } else {
                                showNotification(
                                  "Data nasabah tidak ditemukan",
                                  "error",
                                );
                              }
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95"
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowSetoranForm(true);
                                }}
                                className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("sampah_setoran", item.id)
                                }
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "tarik" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari penarikan..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-blue-500/20 shadow-inner"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {canEdit && (
              <StyledButton
                label="Tarik Saldo"
                onClick={() => setShowTarikForm(true)}
                colorType="primary"
                icon={<HandCoins className="w-4 h-4" />}
                className="font-bold"
              />
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-3">Nasabah</th>
                  <th className="px-6 py-3 text-right">Nominal</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Keterangan</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium overflow-hidden">
                {filteredSampahTarikSaldo
                  .filter((t: any) =>
                    t.namaNasabah
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((item: any, idx: number) => (
                    <tr
                      key={`sampah-tarik-row-${item.id || idx}-${idx}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.namaNasabah}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">
                        Rp {item.nominal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic">
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const n = nasabahSummary.find(
                                (nas: any) => nas.nik === item.nasabahId,
                              );
                              if (n) {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab("nasabah_detail");
                              } else {
                                showNotification(
                                  "Data nasabah tidak ditemukan",
                                  "error",
                                );
                              }
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95"
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowTarikForm(true);
                                }}
                                className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("sampah_tarik_saldo", item.id)
                                }
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                                title="Hapus Penarikan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "nasabah_detail" && selectedNasabah && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-black border-4 border-white shadow-sm uppercase">
                  {selectedNasabah.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {selectedNasabah.nama}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Nasabah ID: {selectedNasabah.nik}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportBukuTabunganPDF(selectedNasabah)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-100 border border-red-100 transition-all font-bold"
                >
                  <FileText className="w-4 h-4" /> PDF
                </button>
                <button
                  onClick={() => setActiveSubTab("nasabah")}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div className="md:col-span-1 space-y-4">
                <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-100">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                    Saldo Saat Ini
                  </p>
                  <p className="text-2xl font-black">
                    Rp {selectedNasabah.saldo.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Statistik Nasabah
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Setoran</span>
                      <span className="font-bold text-emerald-600">
                        Rp {selectedNasabah.totalSetoran.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Tarik</span>
                      <span className="font-bold text-red-600">
                        Rp{" "}
                        {(
                          selectedNasabah.totalSetoran - selectedNasabah.saldo
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  Transaksi
                </h3>
                <div className="space-y-3">
                  {[
                    ...sampahSetoranData
                      .filter((s: any) => s.nasabahId === selectedNasabah.nik)
                      .map((s) => ({ ...s, type: "setoran" })),
                    ...sampahTarikSaldoData
                      .filter((t: any) => t.nasabahId === selectedNasabah.nik)
                      .map((t) => ({ ...t, type: "tarik" })),
                  ]
                    .sort(
                      (a, b) =>
                        new Date(b.tanggal).getTime() -
                        new Date(a.tanggal).getTime(),
                    )
                    .map((item: any, idx) => (
                      <div
                        key={`sampah-detail-hist-${item.id || idx}-${item.type}`}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg ${item.type === "setoran" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                          >
                            {item.type === "setoran" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <HandCoins className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {item.type === "setoran"
                                ? `Setoran: ${item.namaKategori}`
                                : "Penarikan Saldo"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.tanggal}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`text-sm font-black ${item.type === "setoran" ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {item.type === "setoran" ? "+" : "-"} Rp{" "}
                          {(item.total || item.nominal || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  {selectedNasabah.totalSetoran === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8 italic font-medium">
                      Belum ada transaksi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "nasabah" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800">{isWarga ? "Pendaftaran Nasabah" : "Daftar Nasabah & Saldo"}</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isWarga && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nasabah..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-emerald-500/20 shadow-inner"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                {!isWarga && (
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                  />
                )}
                {!isWarga && (
                  <StyledButton
                    label="Nasabah"
                    onClick={() => {
                      setEditingItem(null);
                      setShowNasabahForm(true);
                    }}
                    colorType="success"
                    icon={<PlusCircle className="w-4 h-4" />}
                    className="font-bold"
                  />
                )}
                {isWarga && nasabahSummary.length === 0 && (
                  <StyledButton
                    label="Daftar Jadi Nasabah"
                    onClick={() => {
                      setEditingItem(null);
                      setShowNasabahForm(true);
                    }}
                    colorType="success"
                    icon={<PlusCircle className="w-4 h-4" />}
                    className="font-bold"
                  />
                )}
                {!isWarga && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100 transition-all active:scale-95"
                      title="Impor Database (Excel/CSV)"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={exportNasabahSummaryPDF}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-all shadow-sm active:scale-95"
                      title="Export PDF Semua Nasabah"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={exportNasabahSummaryExcel}
                      className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all shadow-sm active:scale-95"
                      title="Export Excel Semua Nasabah"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-3">Nama Nasabah</th>
                  <th className="px-6 py-3">NIK</th>
                  <th className="px-6 py-3 text-right">Total Tabungan</th>
                  <th className="px-6 py-3 text-right">Telah Ditarik</th>
                  <th className="px-6 py-3 text-right">Saldo Saat Ini</th>
                  <th className="px-6 py-3 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                {nasabahSummary
                  .filter(
                    (n: any) =>
                      n.nama
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      n.nik?.includes(searchQuery),
                  )
                  .map((n: any, idx: number) => {
                    const totalDitarik = sampahTarikSaldoData
                      .filter((t: any) => t.nasabahId === n.nik)
                      .reduce(
                        (acc: number, curr: any) =>
                          acc + (parseFloat(curr.nominal) || 0),
                        0,
                      );
                    return (
                      <tr
                        key={`nasabah-row-${n.nik || idx}-${idx}`}
                        className="hover:bg-slate-50 group transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {n.nama}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {n.nik}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          Rp {n.totalSetoran.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-orange-600">
                          Rp {totalDitarik.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-3 py-1.5 rounded-lg font-black ${n.saldo > 0 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                          >
                            Rp {n.saldo.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 transition-all">
                            <button
                              onClick={() => {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab("nasabah_detail");
                              }}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95"
                              title="Lihat Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canEdit && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingItem(n);
                                    setShowNasabahForm(true);
                                  }}
                                  className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                                  title="Edit Nasabah"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteItemsByNasabah(n.nik)}
                                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                                  title="Hapus Semua Riwayat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "kategori" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center text-slate-800">
            <h3 className="font-bold text-slate-800">
              Kategori Sampah & Harga
            </h3>
            {canEdit && (
              <StyledButton
                label="Tambah Kategori"
                onClick={() => setShowKategoriForm(true)}
                colorType="success"
                icon={<PlusCircle className="w-4 h-4" />}
                className="font-bold"
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {sampahKategoriData.map((kat: any) => (
              <div
                key={kat.id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50 group transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                    <Recycle className="w-5 h-5 text-emerald-600" />
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(kat);
                          setShowKategoriForm(true);
                        }}
                        className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95 text-slate-800 font-bold"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem("sampah_kategori", kat.id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95 text-slate-800 font-bold"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">
                  {kat.nama}
                </h4>
                <p className="text-emerald-600 font-black text-xl">
                  Rp {kat.hargaBeli.toLocaleString()}
                  <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">
                    per {kat.satuan}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showKategoriForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {editingItem ? "Edit Kategori" : "Tambah Kategori Sampah"}
              </h3>
              <button
                onClick={() => {
                  setShowKategoriForm(false);
                  setEditingItem(null);
                }}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveKategori}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  defaultValue={editingItem?.nama}
                  placeholder="Cth: Botol Plastik, Kardus, dll"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Satuan
                  </label>
                  <select
                    name="satuan"
                    defaultValue={editingItem?.satuan || "kg"}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Harga Beli (Rp)
                  </label>
                  <input
                    type="number"
                    name="hargaBeli"
                    required
                    defaultValue={editingItem?.hargaBeli}
                    placeholder="Cth: 2500"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <StyledButton
                  label="Batal"
                  onClick={() => {
                    setShowKategoriForm(false);
                    setEditingItem(null);
                  }}
                  colorType="secondary"
                  className="flex-1 font-bold"
                />
                <StyledButton
                  label="Simpan Kategori"
                  onClick={() => {}}
                  type="submit"
                  colorType="success"
                  className="flex-1 font-bold"
                />
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showSetoranForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-600" /> Catat Setoran
                Baru
              </span>
              <button
                onClick={() => setShowSetoranForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveSetoran}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Pilih Nasabah (Warga)
                  </label>
                  <select
                    name="nasabahId"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  >
                    <option value="">-- Pilih Nasabah --</option>
                    {wargaData.map((w: any, idx: number) => (
                      <option
                        key={`nasabah-opt-${w.id || w.nik || idx}-${idx}`}
                        value={w.nik}
                      >
                        {w.nama} ({w.blok})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Kategori Sampah
                  </label>
                  <select
                    name="kategoriId"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {sampahKategoriData.map((k: any, idx: number) => (
                      <option
                        key={`cat-sampah-${k.id || idx}-${idx}`}
                        value={k.id}
                      >
                        {k.nama} (Rp {k.hargaBeli}/{k.satuan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Berat / Jumlah
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="berat"
                    required
                    placeholder="Cth: 2.5"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Keterangan Tambahan
                  </label>
                  <textarea
                    name="keterangan"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                    placeholder="Opsional..."
                  ></textarea>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <StyledButton
                  label="Batal"
                  onClick={() => setShowSetoranForm(false)}
                  colorType="secondary"
                  className="flex-1 font-bold"
                />
                <StyledButton
                  label="Simpan Setoran"
                  onClick={() => {}}
                  type="submit"
                  colorType="success"
                  className="flex-1 font-bold"
                />
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showTarikForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-blue-600" />{" "}
                {editingItem ? "Edit Tarik Saldo" : "Tarik Saldo Nasabah"}
              </span>
              <button
                onClick={() => {
                  setShowTarikForm(false);
                  setEditingItem(null);
                }}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveTarik}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Pilih Nasabah (Aktif)
                </label>
                <select
                  name="nasabahId"
                  required
                  defaultValue={editingItem?.nasabahId}
                  disabled={!!editingItem}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50 shadow-inner"
                >
                  <option value="">-- Pilih Nasabah --</option>
                  {nasabahSummary
                    .filter(
                      (n: any) =>
                        n.saldo > 0 ||
                        (editingItem && editingItem.nasabahId === n.nik),
                    )
                    .map((n: any, idx: number) => (
                      <option
                        key={`tarik-nasabah-${n.nik || idx}-${idx}`}
                        value={n.nik}
                      >
                        {n.nama} (Saldo: Rp {n.saldo.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Nominal yang Ditarik (Rp)
                </label>
                <input
                  type="number"
                  name="nominal"
                  required
                  defaultValue={editingItem?.nominal}
                  placeholder="Cth: 50000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  required
                  defaultValue={
                    editingItem?.tanggal ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  rows={2}
                  defaultValue={editingItem?.keterangan}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                  placeholder="Contoh: Keperluan harian..."
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTarikForm(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 shadow-sm active:scale-95 transition-all font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transform active:scale-95 transition-all font-bold"
                >
                  {editingItem ? "Simpan Perubahan" : "Konfirmasi Tarik"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showNasabahForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />{" "}
                {editingItem
                  ? "Edit Data Nasabah (Warga)"
                  : "Tambah Nasabah (Warga)"}
              </span>
              <button
                onClick={() => setShowNasabahForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveNasabah}>
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 mb-4 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Data nasabah ini terhubung dengan data Warga.{" "}
                  {editingItem ? "Mengedit" : "Menambahkan"} nama di sini akan
                  ikut {editingItem ? "mengubah" : "menambahkan"} data warga
                  tersebut.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  NIK {editingItem ? "(Hanya Baca)" : ""}
                </label>
                <input
                  type="text"
                  name="nik"
                  required
                  defaultValue={editingItem?.nik}
                  readOnly={!!editingItem}
                  placeholder="Masukkan 16 digit NIK..."
                  minLength={16}
                  maxLength={16}
                  className={`w-full px-4 py-2.5 ${editingItem ? "bg-slate-100 cursor-not-allowed text-slate-500" : "bg-slate-50 focus:bg-white shadow-inner"} border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  defaultValue={editingItem?.nama}
                  list="wargaListNasabah"
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const warga = wargaData.find(
                      (w: any) => w.nama === selectedName,
                    );
                    if (warga) {
                      const form = e.target.closest("form");
                      if (form) {
                        if (!editingItem)
                          (
                            form.elements.namedItem("nik") as HTMLInputElement
                          ).value = warga.nik;
                        (
                          form.elements.namedItem("rt") as HTMLInputElement
                        ).value = warga.rt || "01";
                        (
                          form.elements.namedItem("rw") as HTMLInputElement
                        ).value = warga.rw || "26";
                      }
                    }
                  }}
                  placeholder="Masukkan Nama Lengkap"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                />
                <datalist id="wargaListNasabah">
                  {wargaData.map((w: any, idx: number) => (
                    <option
                      key={`nasabah-list-${w.id || w.nik || idx}-${idx}`}
                      value={w.nama}
                    />
                  ))}
                </datalist>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    RT
                  </label>
                  <input
                    type="text"
                    name="rt"
                    required
                    defaultValue={editingItem?.rt || "01"}
                    placeholder="01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    RW
                  </label>
                  <input
                    type="text"
                    name="rw"
                    required
                    defaultValue={editingItem?.rw || "26"}
                    placeholder="26"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNasabahForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 shadow-sm active:scale-95 transition-all font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transform active:scale-95 transition-all font-bold"
                >
                  {editingItem ? "Simpan Perubahan" : "Tambah Nasabah"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {confirmConfig && (
          <ConfirmModal
            isOpen={true}
            title={confirmConfig.title}
            message={confirmConfig.message}
            onConfirm={confirmConfig.onConfirm}
            onCancel={() => setConfirmConfig(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
