import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  RefreshCw,
  PlusCircle,
  Database,
  Users,
  CheckCircle2,
  ArrowRight,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import {
  collection,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { StyledButton } from "./StyledButton";
import { ControlSuiteMenu } from "./ControlSuiteMenu";
import { ConfirmModal } from "./ui/ConfirmModal";
import { getPlanFeatures } from "../lib/appUtils";
import { ADDON_CONFIG, PLAN_FEATURES, PLAN_ALIASES } from "../constants";

export default function TenantsView({
  tenantsData,
  isLoadingDB,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
  setSelectedTenantId,
  selectedTenantId,
  onBack,
}: {
  tenantsData: any[];
  isLoadingDB: boolean;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  showNotification: any;
  setSelectedTenantId: any;
  selectedTenantId: string | null;
  onBack?: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [tenantToDelete, setTenantToDelete] = useState<any>(null);
  const [isLegacyDeleteConfirmOpen, setIsLegacyDeleteConfirmOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRestoreDefaultTenants = async () => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      
      const defaultTenants = [
        {
          id: "rw26_berjuang",
          name: "RW 26 Berjuang",
          parentId: "",
          adminEmail: "rw26@berjuang.com",
          adminPhone: "081234567890",
          status: "PREMIUM",
          isActive: true,
          maxWarga: 1000,
          addons: ["chat", "ai_bot", "financial_analytics", "surat_digital", "voting_online"],
          rwTarget: "26"
        },
        {
          id: "rt01_rw26_berjuang",
          name: "RT 01 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt01@rw26_berjuang.com",
          adminPhone: "081234567891",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "1",
          rwTarget: "26"
        },
        {
          id: "rt02_rw26_berjuang",
          name: "RT 02 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt02@rw26_berjuang.com",
          adminPhone: "081234567892",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "2",
          rwTarget: "26"
        },
        {
          id: "rt03_rw26_berjuang",
          name: "RT 03 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt03@rw26_berjuang.com",
          adminPhone: "081234567893",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "3",
          rwTarget: "26"
        },
        {
          id: "rt04_rw26_berjuang",
          name: "RT 04 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt04@rw26_berjuang.com",
          adminPhone: "081234567894",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "4",
          rwTarget: "26"
        }
      ];

      for (const t of defaultTenants) {
        const payload = {
          ...t,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(doc(db, "tenants", t.id), payload, { merge: true });
        
        batch.set(doc(db, "settings", t.id), {
          NAMA_RT: t.name,
          RT: (t.rtTarget || "").toString().padStart(2, "0"),
          RW: t.rwTarget || "26"
        }, { merge: true });
      }

      await batch.commit();
      showNotification("Berhasil memulihkan default tenants (rw26_berjuang & sub-tenant RT01-04)!", "success");
    } catch (error: any) {
      console.error("Failed to restore default tenants:", error);
      showNotification("Gagal memulihkan default tenants.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handlePermanentDeleteLegacyTenants = async () => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      const targetIds = ["RW26", "RW_BERJUANG", "RW26_SMART", "rt01_rw26"];
      
      for (const tId of targetIds) {
        batch.delete(doc(db, "tenants", tId));
        batch.delete(doc(db, "settings", tId));
        batch.delete(doc(db, "tenant_settings", tId));
        batch.delete(doc(db, "voting_config", tId));
      }
      
      await batch.commit();
      showNotification("Selesai! Tenant RW26, RW_BERJUANG, RW26_SMART, rt01_rw26 telah berhasil dihapus permanen dari Backend.", "success");
    } catch (e: any) {
      showNotification(`Gagal menghapus tenant dari backend: ${e.message}`, "error");
    } finally {
      setIsLoadingDB(false);
      setIsLegacyDeleteConfirmOpen(false);
    }
  };

  const runMigration = async () => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      let updatedCount = 0;

      tenantsData.forEach((tenantData) => {
        const paketStatus = (tenantData.status || "").toUpperCase();
        const docId = tenantData.id || tenantData.docId;

        if (!docId) return;

        let maxWarga = 50;

        // Specific overrides requested by user
        if (docId === "test" || docId === "TRIAL_ARIFRAJ_MCI_4348" || docId === "rw26_berjuang") {
          maxWarga = 50;
        } else if (paketStatus.includes("STARTER")) {
          maxWarga = 50;
        } else if (paketStatus.includes("FLASH")) {
          maxWarga = 300;
        } else if (paketStatus.includes("PRO")) {
          maxWarga = 1000;
        } else if (paketStatus.includes("PREMIUM")) {
          maxWarga = 1000;
        } else if (paketStatus.includes("ENTERPRISE")) {
          maxWarga = 20000;
        } else {
          const normalizedStatus = paketStatus.replace("V4.0 ", "").replace("PLAN ", "").replace("PLAN", "").trim();
          const baseKey = (PLAN_ALIASES as any)[normalizedStatus] || normalizedStatus;
          maxWarga = (PLAN_FEATURES as any)[baseKey]?.maxWarga || 50;
        }

        batch.update(doc(db, "tenants", docId), { maxWarga });
        updatedCount++;
      });

      if (updatedCount > 0) {
        await batch.commit();
        showNotification(`Berhasil melakukan standardisasi pada ${updatedCount} tenant!`, "success");
      } else {
        showNotification("Tidak ada data tenant yang ditemukan.", "info");
      }
    } catch (e) {
      console.error("Migration Error:", e);
      showNotification("Gagal melakukan standardisasi data.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantIdInput = formData.get("id") as string;
    const parentId = (formData.get("parentId") as string) || null;
    const name = formData.get("name") as string;
    const email = formData.get("adminEmail") as string;
    const password = formData.get("adminPassword") as string;
    const phone = formData.get("adminPhone") as string;
    const paket = formData.get("status") as string;
    const rtCount = parseInt((formData.get("rtCount") as string) || "1");
    const rwNumber = (formData.get("rwNumber") as string) || "26";
    const isActive = formData.get("isActive") === "true";
    const joiningDate = formData.get("joiningDate") as string;
    const expiredAt = formData.get("expiredAt") as string;


    if (!editingTenant && (!password || password.length < 6)) {
      showNotification("Password admin minimal 6 karakter.", "error");
      return;
    }

    const addons = formData.getAll("addons[]") as string[];

    const planConfig = getPlanFeatures({ status: paket, addons });
    const maxWarga = planConfig.maxWarga || 50;

    const tenant = {
      id: tenantIdInput,
      parentId: parentId,
      name: name,
      address: formData.get("address") as string,
      adminEmail: email,
      adminPhone: phone,
      status: paket,
      isActive: isActive,
      maxWarga,
      addons,
      rtTarget: rtCount,
      rwTarget: rwNumber,
      syncMode: (formData.get("syncMode") as string) || "two_way",
      createdAt: joiningDate ? new Date(joiningDate).toISOString() : (editingTenant ? editingTenant.createdAt || new Date().toISOString() : new Date().toISOString()),
      expiredAt: expiredAt ? new Date(expiredAt).toISOString() : (editingTenant ? editingTenant.expiredAt || null : null)
    };

    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);

      batch.set(doc(db, "tenants", tenant.id), tenant, { merge: true });

      if (editingTenant) {
        batch.set(doc(db, "settings", tenantIdInput), {
          NAMA_RT: name,
          RT: rtCount.toString().padStart(2, "0"),
          RW: rwNumber
        }, { merge: true });
        
        const usersRef = collection(db, "users");
        const qAdmin = query(usersRef, where("tenantId", "==", tenantIdInput));
        const userSnap = await getDocs(qAdmin);

        userSnap.forEach((userDoc) => {
          const userData = userDoc.data();
          const userRole = (userData.role || "").toUpperCase();

          if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "OWNER" || userData.email === editingTenant.adminEmail) {
            const updateData: any = { email: email };
            if (password && password.length >= 6) {
              updateData.password = password;
            }
            batch.update(userDoc.ref, updateData);
          }
        });
      } else {
        const userId = `ADM-${Date.now()}`;
        batch.set(doc(db, "users", userId), {
          id_user: userId,
          nama: `Admin ${name}`,
          name: `Admin ${name}`,
          username: email.split("@")[0],
          email: email,
          password: password,
          role: "ADMIN",
          tenantId: tenantIdInput,
          rt: "01",
          status: "AKTIF",
          hp: phone,
          created_at: new Date().toISOString()
        });

        batch.set(doc(db, "settings", tenantIdInput), {
          NAMA_RT: name,
          RT: rtCount.toString().padStart(2, "0"),
          RW: rwNumber,
          NAMA_KETUA: "-",
          NOMINAL_IURAN: "50000",
          STATUS_WA: "Nonaktif",
          TEMPLATE_WA: "Halo {nama}, ini pengingat iuran Anda dari pengurus RW/RT. Mohon untuk segera melakukan pembayaran. Terima kasih.",
          TOKEN_WA: ""
        });
      }

      await batch.commit();

      showNotification(`Tenant ${name} berhasil ${editingTenant ? "diperbarui" : "didaftarkan"}!`, "success");
      setShowAddForm(false);
      setEditingTenant(null);
    } catch (error: any) {
      handleFirestoreError(error, "write", `/tenants/${tenant.id}`);
      showNotification("Gagal menyimpan data tenant.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, "tenants", tenantToDelete.id || tenantToDelete.docId));
      showNotification(`Tenant ${tenantToDelete.name || tenantToDelete.id} berhasil dihapus.`, "success");
    } catch (error: any) {
      handleFirestoreError(error, "delete", `/tenants/${tenantToDelete.id || tenantToDelete.docId}`);
      showNotification("Gagal menghapus tenant.", "error");
    } finally {
      setIsLoadingDB(false);
      setTenantToDelete(null);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="mb-12">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 bg-white p-10 md:p-16 rounded-[4rem] border border-slate-200/60 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10 w-full xl:w-auto">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-4 rounded-3xl bg-white dark:bg-slate-800 text-slate-400 hover:text-brand-blue border border-slate-200 dark:border-slate-700 shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 self-start"
                title="Kembali ke Dashboard"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            <div className="p-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-900 text-white rounded-[3.5rem] shadow-2xl shrink-0 ring-8 ring-blue-50/50">
              <Shield className="w-14 h-14" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <span className="w-10 h-1.5 bg-blue-600 rounded-full"></span>
                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-600/80">Infrastructure Management</span>
              </div>
              <h3 className="text-[45px] font-black tracking-tighter uppercase italic text-slate-900 leading-[0.85] mb-6 pr-6">
                Manajemen <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">Tenant</span>
              </h3>
              <p className="text-[15px] text-slate-500 font-medium max-w-3xl leading-relaxed">
                Pusat kendali ekosistem multi-tenant SmaRtRw AI. Kelola isolasi data wilayah, otoritas akses berjenjang, dan orkestrasi paket layanan antar wilayah secara real-time.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center xl:justify-end gap-4 relative z-20">
            <ControlSuiteMenu
              onRestoreDefaults={handleRestoreDefaultTenants}
              onDeleteLegacy={() => setIsLegacyDeleteConfirmOpen(true)}
              onStandardize={runMigration}
              onAddTenant={() => {
                setEditingTenant(null);
                setShowAddForm(true);
              }}
              canReset={!!selectedTenantId}
              onReset={() => {
                setSelectedTenantId(null);
                showNotification("Kembali ke mode Super Admin pusat.", "info");
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-200/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden mt-10">
        <div className="overflow-x-auto scroller-slate">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Detail Tenant
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Tanggal Bergabung
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Admin Utama
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
                  Paket
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
                  Status Akses
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenantsData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-slate-400 italic font-medium"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Database className="w-8 h-8 text-slate-200" />
                      </div>
                      <p>Belum ada tenant yang terdaftar dalam sistem.</p>
                    </div>
                  </td>
                </tr>
              )}
              {tenantsData.map((tenant, idx) => (
                <tr
                  key={tenant.id || `tenant-${idx}`}
                  className={`hover:bg-blue-50/20 transition-colors ${tenant.isActive === false ? "bg-slate-50/50 grayscale-[0.5]" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${tenant.isActive === false ? "bg-slate-200 text-slate-400" : "bg-slate-100 text-slate-400"}`}
                      >
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${tenant.isActive === false ? "text-slate-400" : "text-slate-800"}`}
                        >
                          {tenant.name}
                        </p>
                        <p className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1 rounded inline-block">
                          ID: {tenant.id}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {(tenant.maxWarga || tenant.citizenLimit) && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                              <Users className="w-3 h-3" /> Max{" "}
                              {getPlanFeatures(tenant).maxWarga.toLocaleString()}{" "}
                              Warga
                            </div>
                          )}
                          {tenant.rwTarget && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full w-fit border border-slate-200">
                              RW: {tenant.rwTarget}
                            </div>
                          )}
                          <div 
                            style={{ width: '80px' }}
                            className={`flex items-center justify-center gap-1 text-[10.5px] font-bold py-0.5 rounded-full border ${
                              tenant.syncMode === "rw_to_rt" 
                                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                                : tenant.syncMode === "rt_to_rw"
                                  ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                            }`}
                          >
                            {tenant.syncMode === "rw_to_rt" 
                              ? "⬇️ RW -> RT" 
                              : tenant.syncMode === "rt_to_rw"
                                ? "⬆️ RT -> RW"
                                : "🔄 2-Arah"}
                          </div>
                        </div>
                        {tenant.addons && tenant.addons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {tenant.addons.map((addonCode: string) => {
                              const addonDetails = Object.values(ADDON_CONFIG).find((a) => a.featureKey === addonCode);
                              return addonDetails ? (
                                <span
                                  key={addonCode}
                                  className="text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100"
                                >
                                  +{addonDetails.name.split(" ")[0]}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Tidak tercatat"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-xs font-bold ${tenant.isActive === false ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {tenant.adminEmail || "-"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {tenant.address || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border ${
                        tenant.status === "TRIAL" || tenant.status === "Trial"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : tenant.status === "BASIC"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : tenant.status === "PRO" || tenant.status === "Pro"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : tenant.status === "PREMIUM"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                : tenant.status === "ENTERPRISE" ||
                                    tenant.status === "Enterprise"
                                  ? "bg-orange-50 text-orange-700 border-orange-100"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        tenant.isActive !== false
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                          : "bg-rose-50 text-rose-600 border-rose-200 opacity-60"
                      }`}
                    >
                      {tenant.isActive !== false ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-[10px] uppercase font-black tracking-widest">
                      <button
                        onClick={() => {
                          setSelectedTenantId(tenant.id);
                          showNotification(
                            `Berhasil berpindah ke akses ${tenant.name}`,
                            "info",
                          );
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border font-bold active:scale-95 shadow-sm ${
                          selectedTenantId === tenant.id
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {selectedTenantId === tenant.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {selectedTenantId === tenant.id
                            ? "Akses Aktif"
                            : "Bypass Akses"}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingTenant(tenant);
                          setShowAddForm(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 font-bold active:scale-95 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setTenantToDelete(tenant)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 font-bold active:scale-95 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingTenant ? "Edit Tenant" : "Daftarkan Tenant Baru"}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              className="p-8 grid grid-cols-2 gap-5 overflow-y-auto max-h-[80vh]"
              onSubmit={handleSaveTenant}
            >
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">
                    Identitas Klien
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      ID Klien (Unique ID)
                    </label>
                    <input
                      name="id"
                      defaultValue={editingTenant?.id}
                      readOnly={!!editingTenant}
                      required
                      placeholder="Contoh: rt01_warga"
                      onChange={(e) => e.target.value = e.target.value.toLowerCase()}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold text-blue-600 lowercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Nama Organisasi
                    </label>
                    <input
                      name="name"
                      defaultValue={editingTenant?.name}
                      required
                      placeholder="Contoh: RT 01 / RW 26"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Tenant Induk / RW (Opsional)
                    </label>
                    <select
                      name="parentId"
                      defaultValue={editingTenant?.parentId || ""}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                    >
                      <option value="">Mandiri (Parent Tenant)</option>
                      {tenantsData.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Arah Sinkronisasi Data (Parent & Child)
                    </label>
                    <select
                      name="syncMode"
                      defaultValue={editingTenant?.syncMode || "two_way"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                    >
                      <option value="two_way">🔄 Dua Arah (Saling Sinkronisasi)</option>
                      <option value="rw_to_rt">⬇️ Satu Arah: RW ke RT saja (Tarik / Pull)</option>
                      <option value="rt_to_rw">⬆️ Satu Arah: RT ke RW saja (Kirim / Push)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Mengontrol arah pembaruan dokumen kependudukan/warga secara otomatis antara RT (Child) dan RW (Parent).
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-black uppercase text-slate-800 tracking-widest block">
                    Informasi Admin Utama
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Email Admin
                    </label>
                    <input
                      name="adminEmail"
                      defaultValue={editingTenant?.adminEmail}
                      required
                      type="email"
                      placeholder="Email Admin"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm mt-auto"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Password {editingTenant ? "(Kosongkan jika tidak ubah)" : ""}
                    </label>
                    <div className="relative mt-auto">
                      <input
                        name="adminPassword"
                        required={!editingTenant}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password Admin (Min 6 Karakter)"
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      No. HP Admin
                    </label>
                    <input
                      name="adminPhone"
                      defaultValue={editingTenant?.adminPhone}
                      required
                      placeholder="No. HP Admin"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Paket Sistem
                </label>
                <select
                  name="status"
                  defaultValue={editingTenant?.status || "STARTER"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="STARTER">Starter / Free (Max 50 Warga)</option>
                  <option value="FLASH">Flash / RT (Max 300 Warga)</option>
                  <option value="PRO">Pro / RW (Max 1000 Warga)</option>
                  <option value="PREMIUM">Premium (Max 1000 Warga)</option>
                  <option value="ENTERPRISE">Enterprise (Max 20.000 Warga)</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Nomor RW
                </label>
                <input
                  name="rwNumber"
                  defaultValue={editingTenant?.rwTarget || "26"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Target Jumlah RT
                </label>
                <input
                  name="rtCount"
                  type="number"
                  defaultValue={editingTenant?.rtTarget || 5}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Alamat / Keterangan Lokasi
                </label>
                <textarea
                  name="address"
                  defaultValue={editingTenant?.address}
                  rows={2}
                  placeholder="Alamat lengkap organisasi..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Tanggal Bergabung
                </label>
                <input
                  name="joiningDate"
                  type="date"
                  defaultValue={editingTenant?.createdAt ? new Date(editingTenant.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Masa Aktif (Expired At)
                </label>
                <input
                  name="expiredAt"
                  type="date"
                  defaultValue={editingTenant?.expiredAt ? new Date(editingTenant.expiredAt).toISOString().split('T')[0] : ""}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Status Akses
                </label>
                <select
                  name="isActive"
                  defaultValue={editingTenant?.isActive !== false ? "true" : "false"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif (Suspended)</option>
                </select>
              </div>

              <div className="col-span-2 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-black uppercase text-slate-800 tracking-widest block">
                    Add-ons (Fitur Ekstra)
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ADDON_CONFIG).map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="addons[]"
                        value={addon.featureKey}
                        defaultChecked={editingTenant?.addons?.includes?.(addon.featureKey)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-[10px] font-bold text-slate-700">{addon.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoadingDB}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {isLoadingDB ? "Memproses..." : editingTenant ? "Simpan Perubahan" : "Daftarkan & Setup Tenant"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Benefits Guide */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group mt-6">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
          <Shield className="w-48 h-48 rotate-12 group-hover:rotate-0" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">
                Panduan Paket & Benefits
              </h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Struktur Kapasitas & Fitur Nexapps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
             {Object.entries(PLAN_FEATURES).map(([key, features]: [string, any]) => {
                const isEnterprise = key === "ENTERPRISE";
                const isPremium = key === "PREMIUM";
                return (
                  <div key={key} className={`p-5 rounded-3xl border flex flex-col relative overflow-hidden transition-all ${isEnterprise ? "bg-slate-900 border-slate-800 text-white shadow-xl" : isPremium ? "bg-indigo-50 border-indigo-100 shadow-lg shadow-indigo-50" : "bg-white border-slate-100"}`}>
                    <div className="mb-4">
                      <p className={`text-[22px] font-black uppercase tracking-widest mb-1 ${isEnterprise ? "text-orange-400" : "text-indigo-600"}`}>
                        {key === 'TRIAL' ? 'STARTER' : key === 'RT' ? 'LITE' : key === 'BASIC' ? 'FLASH' : key}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {features.oldPrice && <span className="text-[15px] line-through opacity-50">{features.oldPrice}</span>}
                        <div className="flex items-baseline gap-1">
                          <h5 className="text-2xl font-black tracking-tighter leading-none">{features.price}</h5>
                          {!isEnterprise && features.price !== "Free" && <span className="text-[15px] opacity-40 font-bold uppercase tracking-tight">/bln</span>}
                        </div>
                        {features.price === 'Free' && <h5 className="text-xl font-black tracking-tighter leading-none text-blue-600 mt-1">Rp. 0/Bln</h5>}
                      </div>
                    </div>
                    <div className="mb-4 flex items-center gap-2 p-2 bg-black/5 rounded-xl border border-black/5">
                      <Users className="w-3 h-3 opacity-40" />
                      <span className="text-[15px] font-black tracking-tight">{features.maxWarga} Warga</span>
                    </div>
                    <div className="space-y-2 mb-6">
                      {features.coreFeatures.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isEnterprise ? "text-emerald-400" : "text-emerald-500"}`} />
                          <span className="text-[15px] font-bold leading-none">{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                        const waText = encodeURIComponent("Hi Ka, Saya mau Upgrade Paket E-RTRW boleh dibantu, Trima Kasih");
                        window.open(`https://wa.me/087726741143?text=${waText}`, "_blank");
                      }} className={`mt-auto w-full py-2.5 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all ${isEnterprise ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg" : isPremium ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}>
                      {key === 'TRIAL' ? 'Sewa' : 'Upgrade'}
                    </button>
                  </div>
                )
             })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLegacyDeleteConfirmOpen && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Permanen Tenants Lama"
            message="Apakah Anda yakin ingin menghapus tenants lama (RW26, RW_BERJUANG, RW26_SMART, rt01_rw26) secara permanen dari backend? Tindakan ini tidak dapat dibatalkan."
            onConfirm={handlePermanentDeleteLegacyTenants}
            onCancel={() => setIsLegacyDeleteConfirmOpen(false)}
            confirmText="Hapus Permanen"
            cancelText="Batal"
            isLoading={isLoadingDB}
          />
        )}
        {tenantToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Tenant"
            message={`Apakah Anda yakin ingin menghapus infrastruktur tenant "${tenantToDelete.name || tenantToDelete.id}"? Semua data organisasi akan terputus dan tidak dapat dikembalikan.`}
            onConfirm={handleDeleteTenant}
            onCancel={() => setTenantToDelete(null)}
            confirmText="Hapus Permanen"
            cancelText="Batal"
            isLoading={isLoadingDB}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
