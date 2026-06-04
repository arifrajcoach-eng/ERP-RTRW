import React, { useState, useMemo } from "react";
import {
  Search,
  PlusCircle,
  Package,
  ClipboardList,
  History,
  Edit,
  X,
  Camera,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function InventarisView({
  inventarisData = [],
  setInventarisData,
  inventarisLogs = [],
  setInventarisLogs,
  inventarisKategori = [],
  inventarisLokasi = [],
  inventarisSupplier = [],
  userRole,
  currentUser,
  tenantId,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
  handleFileUpload,
  setConfirmConfig,
}: any) {
  const roleUpperGlobal = currentUser?.role?.toUpperCase() || "";
  const isViewer = ["WARGA", "VIEWER", "TAMU"].includes(roleUpperGlobal);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // States untuk form transaksi dinamis
  const [txType, setTxType] = useState("Barang Masuk");
  const [txJumlah, setTxJumlah] = useState(1);
  const [txHarga, setTxHarga] = useState(0);
  const [txStokFisik, setTxStokFisik] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  const canEdit = useMemo(() => {
    const roleUpper = (userRole || "").toUpperCase();
    return (
      roleUpper === "ADMIN" ||
      roleUpper === "RW" ||
      roleUpper === "RT" ||
      roleUpper === "BENDAHARA" ||
      roleUpper === "SEKRETARIS" ||
      roleUpper === "PENGURUS" ||
      roleUpper === "SATPAM" ||
      roleUpper === "STAF" ||
      roleUpper === "STAFF" ||
      roleUpper === "PENGELOLA" ||
      roleUpper === "KETUA" ||
      roleUpper === "PENGURUS RT" ||
      roleUpper === "PENGURUS RW" ||
      roleUpper === "SUPERADMIN" ||
      roleUpper === "ADMINISTRATOR" ||
      roleUpper.includes("KETUA") ||
      roleUpper.includes("BENDAHARA") ||
      roleUpper.includes("SEKRETARIS") ||
      currentUser?.isSuperAdmin
    );
  }, [userRole, currentUser?.isSuperAdmin]);

  const filteredData = inventarisData.filter(
    (item: any) =>
      item.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit) return;

    const formData = new FormData(e.currentTarget);
    const itemId = editingItem ? editingItem.id : `INV-BRG-${Date.now()}`;
    const fotoFile = (
      e.currentTarget.elements.namedItem("foto_aset") as HTMLInputElement
    )?.files?.[0];

    setIsLoadingDB(true);
    setUploading(true);

    try {
      let fotoUrl = editingItem?.foto_url || "";
      if (fotoFile && handleFileUpload) {
        fotoUrl = await handleFileUpload(fotoFile, "inventaris", (pct: number) =>
          setUploadPct(pct),
        );
      }

      const itemData = {
        id: itemId,
        nama_barang: formData.get("nama_barang") as string,
        kategori: formData.get("kategori") as string,
        satuan: formData.get("satuan") as string,
        merk: formData.get("merk") as string,
        spesifikasi: formData.get("spesifikasi") as string,
        stok: parseInt(formData.get("stok") as string) || 0,
        minimum_stok: parseInt(formData.get("minimum_stok") as string) || 0,
        status: formData.get("status") as string,
        lokasi: formData.get("lokasi") as string,
        supplier: formData.get("supplier") as string,
        tanggal_perolehan: formData.get("tanggal_perolehan") as string,
        harga_perolehan:
          parseInt(formData.get("harga_perolehan") as string) || 0,
        foto_url: fotoUrl,
        tenantId,
        rt: currentUser?.rt || "01",
      };
      // Auto-save Kategori & Lokasi ke Master Data jika belum ada
      if (itemData.kategori) {
        const kExists = inventarisKategori.find(
          (k: any) =>
            k.nama_kategori?.toLowerCase() === itemData.kategori?.toLowerCase(),
        );
        if (!kExists) {
          const kId = `KAT-${Date.now()}`;
          await setDoc(doc(db, "inventaris_kategori", kId), {
            id: kId,
            nama_kategori: itemData.kategori,
            tenantId,
          });
        }
      }
      if (itemData.lokasi) {
        const lExists = inventarisLokasi.find(
          (l: any) =>
            l.nama_lokasi?.toLowerCase() === itemData.lokasi?.toLowerCase(),
        );
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, "inventaris_lokasi", lId), {
            id: lId,
            nama_lokasi: itemData.lokasi,
            tenantId,
          });
        }
      }
      if (itemData.supplier) {
        const sExists = inventarisSupplier.find(
          (s: any) => s.nama?.toLowerCase() === itemData.supplier?.toLowerCase(),
        );
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, "inventaris_supplier", sId), {
            id: sId,
            nama: itemData.supplier,
            kontak: "",
            alamat: "",
            tenantId,
          });
        }
      }

      if (editingItem) {
        await updateDoc(doc(db, "inventaris", itemId), itemData);
        if (setInventarisData) {
          setInventarisData((prev: any) =>
            prev.map((item: any) => (item.id === itemId ? itemData : item)),
          );
        }
        showNotification("Data inventaris diperbarui!", "success");
      } else {
        await setDoc(doc(db, "inventaris", itemId), itemData);
        if (setInventarisData) {
          setInventarisData((prev: any) => [itemData, ...prev]);
        }
        showNotification("Barang baru ditambahkan ke inventaris!", "success");
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error: any) {
      handleFirestoreError(
        error,
        editingItem ? "update" : "create",
        "inventaris",
      );
    } finally {
      setIsLoadingDB(false);
      setUploading(false);
      setUploadPct(0);
    }
  };

  const handleSaveLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit || !selectedItem) return;

    const formData = new FormData(e.currentTarget);
    const logId = `LOG-${Date.now()}`;
    const tanggal = formData.get("tanggal") as string;

    // Base log
    const logData: any = {
      id: logId,
      itemId: selectedItem.id,
      itemName: selectedItem.nama_barang,
      aktivitas: txType,
      pencatat: currentUser.name,
      tanggal,
      tenantId,
      rt: currentUser?.rt || "01",
    };

    const itemUpdate: any = {};
    const currentStok = selectedItem.stok || 0;

    if (txType === "Barang Masuk") {
      const jumlah = parseInt(formData.get("jumlah") as string) || 0;
      const harga = parseInt(formData.get("harga") as string) || 0;
      logData.supplier = formData.get("supplier") as string;
      logData.jumlah = jumlah;
      logData.harga = harga;
      logData.total = jumlah * harga;
      itemUpdate.stok = currentStok + jumlah;
    } else if (txType === "Barang Keluar") {
      const jumlah = parseInt(formData.get("jumlah") as string) || 0;
      logData.jumlah = jumlah;
      logData.tujuan = formData.get("tujuan") as string;
      logData.keterangan = formData.get("keterangan") as string;
      itemUpdate.stok = Math.max(0, currentStok - jumlah);
    } else if (txType === "Mutasi Barang") {
      logData.dari_lokasi = selectedItem.lokasi;
      logData.ke_lokasi = formData.get("ke_lokasi") as string;
      logData.keterangan = formData.get("keterangan") as string;
      itemUpdate.lokasi = logData.ke_lokasi;
    } else if (txType === "Stock Opname") {
      const stok_fisik = parseInt(formData.get("stok_fisik") as string) || 0;
      logData.stok_sistem = currentStok;
      logData.stok_fisik = stok_fisik;
      logData.selisih = stok_fisik - currentStok;
      logData.catatan = formData.get("catatan") as string;
      itemUpdate.stok = stok_fisik;
    }

    setIsLoadingDB(true);
    try {
      if (itemUpdate.stok !== undefined || itemUpdate.lokasi !== undefined) {
        await updateDoc(doc(db, "inventaris", selectedItem.id), itemUpdate);
        if (setInventarisData) {
          setInventarisData((prev: any) =>
            prev.map((item: any) =>
              item.id === selectedItem.id ? { ...item, ...itemUpdate } : item,
            ),
          );
        }
      }
      if (logData.supplier && txType === "Barang Masuk") {
        const sExists = inventarisSupplier.find(
          (s: any) => s.nama?.toLowerCase() === logData.supplier?.toLowerCase(),
        );
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, "inventaris_supplier", sId), {
            id: sId,
            nama: logData.supplier,
            kontak: "",
            alamat: "",
            tenantId,
          });
        }
      }
      if (logData.ke_lokasi && txType === "Mutasi Barang") {
        const lExists = inventarisLokasi.find(
          (l: any) =>
            l.nama_lokasi?.toLowerCase() === logData.ke_lokasi?.toLowerCase(),
        );
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, "inventaris_lokasi", lId), {
            id: lId,
            nama_lokasi: logData.ke_lokasi,
            tenantId,
          });
        }
      }

      await setDoc(doc(db, "inventaris_logs", logId), logData);
      showNotification("Transaksi berhasil dicatat!", "success");
      setShowLogForm(false);
      setTxType("Barang Masuk");
      setTxJumlah(1);
      setTxHarga(0);
      setTxStokFisik(0);
    } catch (error: any) {
      handleFirestoreError(error, "create", "inventaris_logs");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteItem = async (id: string, nama: string) => {
    if (!id || id === "undefined") {
      console.error("Critical: Attempted to delete item with invalid ID");
      showNotification("Kesalahan: ID barang tidak ditemukan.", "error");
      return;
    }

    if (!canEdit) {
      showNotification(
        "Anda tidak memiliki izin untuk menghapus aset.",
        "error",
      );
      return;
    }

    if (setConfirmConfig) {
      setConfirmConfig({
        title: "Konfirmasi Hapus Aset",
        message: `Hapus barang "${nama}" dari inventaris? Tindakan ini tidak dapat dibatalkan.`,
        onConfirm: async () => {
          try {
            await deleteDoc(doc(db, "inventaris", id));
            if (setInventarisData) {
              setInventarisData((prev: any) => prev.filter((item: any) => item.id !== id));
            }
            showNotification(`Aset "${nama}" berhasil dihapus.`, "success");
          } catch (error: any) {
            console.error("Firestore Delete Asset Error:", error);
            handleFirestoreError(error, "delete", `inventaris/${id}`);
          } finally {
            setConfirmConfig(null);
          }
        },
      });
      return;
    }

    // Fallback if setConfirmConfig is missing
    if (
      !confirm(
        `Hapus barang "${nama}" dari inventaris? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, "inventaris", id));
      if (setInventarisData) {
        setInventarisData((prev: any) => prev.filter((item: any) => item.id !== id));
      }
      showNotification(`Aset "${nama}" berhasil dihapus.`, "success");
    } catch (error: any) {
      console.error("Firestore Delete Asset Error:", error);
      handleFirestoreError(error, "delete", `inventaris/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!logId || logId === "undefined") {
      console.error("Critical: Attempted to delete log with invalid ID");
      showNotification("Kesalahan: ID riwayat tidak ditemukan.", "error");
      return;
    }

    if (!canEdit) {
      showNotification(
        "Anda tidak memiliki izin untuk menghapus riwayat.",
        "error",
      );
      return;
    }

    if (setConfirmConfig) {
      setConfirmConfig({
        title: "Konfirmasi Hapus Riwayat",
        message:
          "Hapus riwayat aktivitas ini? Tindakan ini tidak dapat dibatalkan.",
        onConfirm: async () => {
          setConfirmConfig(null);
          setIsLoadingDB(true);
          try {
            await deleteDoc(doc(db, "inventaris_logs", logId));
            if (setInventarisLogs) {
              setInventarisLogs((prev: any) =>
                prev.filter((log: any) => log.id !== logId),
              );
            }
            showNotification("Catatan aktivitas berhasil dihapus.", "success");
          } catch (error: any) {
            console.error("Firestore Delete Log Error:", error);
            handleFirestoreError(error, "delete", `inventaris_logs/${logId}`);
          } finally {
            setIsLoadingDB(false);
          }
        },
      });
      return;
    }

    // Fallback
    if (
      !window.confirm(
        "Hapus riwayat aktivitas ini? Tindakan ini tidak dapat dibatalkan.",
      )
    )
      return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, "inventaris_logs", logId));
      if (setInventarisLogs) {
        setInventarisLogs((prev: any) =>
          prev.filter((log: any) => log.id !== logId),
        );
      }
      showNotification("Catatan aktivitas berhasil dihapus.", "success");
    } catch (error: any) {
      console.error("Firestore Delete Log Error:", error);
      handleFirestoreError(error, "delete", `inventaris_logs/${logId}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-2"></span>
            Aset & Inventaris
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">
            Kelola dan pantau aset yang dimiliki oleh organisasi, perbarui
            kondisi, serta catat lokasi penyimpanannya di satu tempat.
          </p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Cari barang atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium shadow-sm"
          />
          {canEdit && (
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddForm(true);
              }}
              className="flex-shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Aset Baru
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  Aset / Barang
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Stok
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Kategori & Lokasi
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Perolehan
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400 text-sm italic"
                  >
                    Tidak ada data inventaris
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any, idx: number) => (
                  <tr
                    key={`inv-row-${item.id || idx}-${idx}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.nama_barang}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800 tracking-tight">
                            {item.nama_barang}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Merk: {item.merk || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-xs font-black font-mono ${item.stok <= (item.minimum_stok || 0) ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          {item.stok} {item.satuan}
                        </span>
                        {item.minimum_stok > 0 && (
                          <span className="text-[9px] text-slate-400">
                            Min: {item.minimum_stok}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          item.status === "aktif"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : item.status === "rusak"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-700">
                        {item.kategori || "-"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.lokasi || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-700">
                        {item.tanggal_perolehan &&
                        !isNaN(new Date(item.tanggal_perolehan).getTime())
                          ? new Date(item.tanggal_perolehan).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-mono font-bold mt-0.5">
                        Rp {(item.harga_perolehan || 0).toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowLogForm(true);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 text-[10px] font-bold uppercase tracking-wider"
                          title="Catat Aktivitas"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          Catat
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowLogHistory(true);
                          }}
                          className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                          title="Riwayat"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowAddForm(true);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                            title="Edit Aset"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                         {canEdit && (
                          <button
                            onClick={() => handleDeleteItem(item.id, item.nama_barang)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                            title="Hapus Aset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH/EDIT BARANG */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  {editingItem ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-slate-800 uppercase tracking-tighter">
                  {editingItem ? "Edit Aset" : "Tambah Aset Baru"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:text-red-500 bg-white border border-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form id="add-asset-form" onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Foto Aset
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {editingItem?.foto_url ? (
                        <img
                          src={editingItem.foto_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        name="foto_aset"
                        accept="image/*"
                        capture="environment"
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">
                        Format JPG/PNG, Max 2MB. Foto baru akan menggantikan
                        yang lama.
                      </p>
                    </div>
                  </div>
                  {uploading && (
                    <div className="mt-3">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${uploadPct}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] font-black text-blue-600 text-right mt-1">
                        Mengunggah: {uploadPct}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Nama Aset / Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_barang"
                    required
                    defaultValue={editingItem?.nama_barang}
                    placeholder="Contoh: Tenda 3x4"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold shadow-inner"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Tgl Perolehan
                  </label>
                  <input
                    type="date"
                    name="tanggal_perolehan"
                    defaultValue={editingItem?.tanggal_perolehan}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-medium shadow-inner"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Harga Perolehan
                  </label>
                  <input
                    type="number"
                    name="harga_perolehan"
                    defaultValue={editingItem?.harga_perolehan || 0}
                    placeholder="Rp"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold shadow-inner"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kategori"
                    list="kategoriList"
                    required
                    defaultValue={editingItem?.kategori}
                    placeholder="Pilih / Ketik Kategori..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600 shadow-inner"
                  />
                  <datalist id="kategoriList">
                    {inventarisKategori.map((k: any) => (
                      <option key={k.id} value={k.nama_kategori} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    list="lokasiList"
                    required
                    defaultValue={editingItem?.lokasi}
                    placeholder="Pilih / Ketik Lokasi..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600 shadow-inner"
                  />
                  <datalist id="lokasiList">
                    {inventarisLokasi.map((l: any) => (
                      <option key={l.id} value={l.nama_lokasi} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok"
                    required
                    min="0"
                    defaultValue={editingItem?.stok ?? 0}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold shadow-inner"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Satuan (Unit)
                  </label>
                  <input
                    type="text"
                    name="satuan"
                    defaultValue={editingItem?.satuan || "Pcs"}
                    placeholder="Contoh: Pcs, Set"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600 shadow-inner"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Minimum Stok
                  </label>
                  <input
                    type="number"
                    name="minimum_stok"
                    min="0"
                    defaultValue={editingItem?.minimum_stok ?? 0}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold shadow-inner"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    defaultValue={editingItem?.status || "aktif"}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold"
                  >
                    <option value="aktif">Aktif / Baik</option>
                    <option value="rusak">Rusak</option>
                    <option value="hilang">Hilang</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Merk
                  </label>
                  <input
                    type="text"
                    name="merk"
                    defaultValue={editingItem?.merk}
                    placeholder="Contoh: Krisbow"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600 shadow-inner"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Supplier Baru / Pilih
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    list="supplierList"
                    defaultValue={editingItem?.supplier}
                    placeholder="Ketik nama supplier..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600 shadow-inner"
                  />
                  <datalist id="supplierList">
                    {inventarisSupplier.map((s: any) => (
                      <option key={s.id} value={s.nama} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                    Spesifikasi
                  </label>
                  <input
                    type="text"
                    name="spesifikasi"
                    defaultValue={editingItem?.spesifikasi}
                    placeholder="Detail teknis..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-slate-50 transition-all font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 text-white font-black text-[10px] tracking-widest uppercase rounded-xl hover:brightness-105 hover:shadow-indigo-500/30 transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-95 font-bold"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATAT AKTIVITAS */}
      {showLogForm && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-green-600" />
                Catat Transaksi: {selectedItem.nama_barang}
              </h3>
              <button
                onClick={() => setShowLogForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form id="log-asset-activity-form" onSubmit={handleSaveLog} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                  Jenis Transaksi <span className="text-red-500">*</span>
                </label>
                <select
                  name="aktivitas"
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold"
                >
                  <option value="Barang Masuk">Barang Masuk</option>
                  <option value="Barang Keluar">Barang Keluar</option>
                  <option value="Mutasi Barang">Mutasi Barang</option>
                  <option value="Stock Opname">Stock Opname</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-medium shadow-inner"
                />
              </div>

              {txType === "Barang Masuk" && (
                <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Supplier Baru/Pilih{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      list="supplierListTx"
                      required
                      placeholder="Supplier..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold shadow-inner"
                    />
                    <datalist id="supplierListTx">
                      {inventarisSupplier.map((s: any) => (
                        <option key={s.id} value={s.nama} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                        Jumlah Masuk <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="jumlah"
                        required
                        min="1"
                        value={txJumlah}
                        onChange={(e) =>
                          setTxJumlah(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold shadow-inner"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                        Harga Satuan
                      </label>
                      <input
                        type="number"
                        name="harga"
                        min="0"
                        value={txHarga}
                        onChange={(e) =>
                          setTxHarga(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black text-slate-400">
                      Total Estimasi Nilai
                    </label>
                    <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-700 shadow-inner">
                      Rp {(txJumlah * txHarga).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              )}

              {txType === "Barang Keluar" && (
                <div className="space-y-4 p-4 border border-orange-100 bg-orange-50/30 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-orange-600 bg-white px-3 py-2 border border-orange-100 rounded-lg shadow-sm">
                    <span>Stok Tersedia Saat Ini:</span>
                    <span className="font-mono text-sm">
                      {selectedItem.stok} {selectedItem.satuan}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Jumlah Keluar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="jumlah"
                      required
                      min="1"
                      max={selectedItem.stok}
                      defaultValue={1}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Tujuan (User/Divisi){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tujuan"
                      required
                      placeholder="Cth: Bpk Andi RT 01..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Keterangan / Tujuan Penggunaan
                    </label>
                    <textarea
                      name="keterangan"
                      rows={2}
                      placeholder="Cth: Untuk perbaikan pipa di lapangan..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none shadow-inner"
                    />
                  </div>
                </div>
              )}

              {txType === "Mutasi Barang" && (
                <div className="space-y-4 p-4 border border-purple-100 bg-purple-50/30 rounded-xl">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black text-slate-400">
                      Dari Lokasi Saat Ini
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedItem.lokasi || "-"}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-bold shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Pindah Ke Lokasi Baru{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ke_lokasi"
                      list="keLokasiList"
                      required
                      placeholder="Gudang B..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold shadow-inner"
                    />
                    <datalist id="keLokasiList">
                      {inventarisLokasi.map((l: any) => (
                        <option key={l.id} value={l.nama_lokasi} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Keterangan Mutasi
                    </label>
                    <textarea
                      name="keterangan"
                      rows={2}
                      placeholder="Alasan pemindahan..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none shadow-inner"
                    />
                  </div>
                </div>
              )}

              {txType === "Stock Opname" && (
                <div className="space-y-4 p-4 border border-teal-100 bg-teal-50/30 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black text-slate-400">
                        Stok Sistem (Saat Ini)
                      </label>
                      <input
                        type="number"
                        disabled
                        value={selectedItem.stok}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-mono font-bold shadow-inner"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                        Stok Fisik (Realita){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stok_fisik"
                        required
                        min="0"
                        value={txStokFisik}
                        onChange={(e) =>
                          setTxStokFisik(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-teal-200 rounded-xl text-sm bg-white focus:border-teal-500 ring-2 ring-transparent focus:ring-teal-100 outline-none font-mono font-black text-teal-700 shadow-inner"
                      />
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                        <span>Selisih Stok</span>
                        <span
                          className={`text-xs ${txStokFisik - selectedItem.stok < 0 ? "text-red-500" : "text-green-500"}`}
                        >
                          {txStokFisik - selectedItem.stok}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-black">
                      Catatan Pengecekan
                    </label>
                    <textarea
                      name="catatan"
                      rows={2}
                      placeholder="Cth: 2 kursi patah diletakkan di luar, 1 kursi hilang..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none shadow-inner"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3 font-bold">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-black text-[10px] tracking-widest uppercase rounded-xl hover:brightness-105 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RIWAYAT AKTIVITAS */}
      {showLogHistory && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Riwayat: {selectedItem.nama_barang}
              </h3>
              <button
                onClick={() => setShowLogHistory(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {inventarisLogs.filter((l: any) => l.itemId === selectedItem.id)
                .length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic">
                  Belum ada riwayat aktivitas untuk barang ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {inventarisLogs
                    .filter((l: any) => l.itemId === selectedItem.id)
                    .sort((a: any, b: any) =>
                      (b.tanggal || "").localeCompare(a.tanggal || ""),
                    )
                    .map((log: any) => (
                      <div
                        key={log.id}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              log.aktivitas === "Barang Masuk"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : log.aktivitas === "Barang Keluar"
                                  ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : log.aktivitas === "Mutasi Barang"
                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                    : log.aktivitas === "Stock Opname"
                                      ? "bg-teal-50 text-teal-600 border-teal-100"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {log.aktivitas}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-slate-400">
                              {log.tanggal}
                            </span>
                             <button
                               onClick={() => handleDeleteLog(log.id)}
                               className="text-red-400 hover:text-red-600 transition-colors"
                             >
                                <Trash2 className="w-3 h-3" />
                             </button>
                          </div>
                        </div>

                        {log.aktivitas === "Barang Masuk" && (
                          <p className="text-sm text-slate-700 mt-2 font-medium">
                            Masuk{" "}
                            <strong className="font-mono text-blue-600">{log.jumlah}</strong>{" "}
                            unit dari <strong className="text-slate-800">{log.supplier}</strong> (Nilai: Rp{" "}
                            {(log.total || 0).toLocaleString("id-ID")})
                          </p>
                        )}
                        {log.aktivitas === "Barang Keluar" && (
                          <p className="text-sm text-slate-700 mt-2 font-medium">
                            Keluar{" "}
                            <strong className="font-mono text-orange-600">{log.jumlah}</strong>{" "}
                            unit untuk <strong className="text-slate-800">{log.tujuan}</strong> <br />
                            {log.keterangan && (
                              <span className="text-xs text-slate-500 font-normal">
                                {log.keterangan}
                              </span>
                            )}
                          </p>
                        )}
                        {log.aktivitas === "Mutasi Barang" && (
                          <p className="text-sm text-slate-700 mt-2 font-medium">
                            Dipindah dari <strong className="text-slate-500">{log.dari_lokasi}</strong> ke{" "}
                            <strong className="text-purple-600">{log.ke_lokasi}</strong> <br />
                            {log.keterangan && (
                              <span className="text-xs text-slate-500 font-normal">
                                {log.keterangan}
                              </span>
                            )}
                          </p>
                        )}
                        {log.aktivitas === "Stock Opname" && (
                          <p className="text-sm text-slate-700 mt-2 font-medium">
                            Stok Sistem:{" "}
                            <strong className="font-mono text-slate-500">
                              {log.stok_sistem}
                            </strong>{" "}
                            &rarr; Stok Fisik:{" "}
                            <strong className="font-mono text-teal-600">
                              {log.stok_fisik}
                            </strong>{" "}
                            (Selisih:{" "}
                            <span
                              className={
                                log.selisih < 0
                                  ? "text-red-500 font-bold"
                                  : "text-green-500 font-bold"
                              }
                            >
                              {log.selisih}
                            </span>
                            ) <br />
                            {log.catatan && (
                              <span className="text-xs text-slate-500 font-normal">
                                {log.catatan}
                              </span>
                            )}
                          </p>
                        )}
                        {![
                          "Barang Masuk",
                          "Barang Keluar",
                          "Mutasi Barang",
                          "Stock Opname",
                        ].includes(log.aktivitas) && (
                          <p className="text-sm text-slate-700 font-medium my-1">
                            {log.keterangan || "-"}
                          </p>
                        )}

                        <p className="text-[10px] text-slate-400 italic mt-1 font-bold">
                          Dicatat oleh: {log.pencatat}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end font-bold uppercase text-[10px]">
              <button
                onClick={() => setShowLogHistory(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg uppercase tracking-widest shadow-sm active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Global icons should be used from lucide-react
