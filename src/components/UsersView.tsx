import React, { useState } from "react";
import {
  PlusCircle,
  UserPlus,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { StyledButton } from "./StyledButton";
import { ConfirmModal } from "./ui/ConfirmModal";
import { RTRegistrationForm } from "./RTRegistrationForm";
import { getTranslatedLabel } from "../lib/langUtils";
import { canCreate, canUpdate, canDelete } from "../lib/appUtils";

interface UsersViewProps {
  usersData: any[];
  setIsLoadingDB: any;
  handleFirestoreError: any;
  tenantId: string;
  showNotification: (m: string, t?: any) => void;
  settings: any;
  currentUser: any;
}

export default function UsersView({
  usersData,
  setIsLoadingDB,
  handleFirestoreError,
  tenantId,
  showNotification,
  settings,
  currentUser,
}: UsersViewProps) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRTForm, setShowRTForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id_user = editingUser
      ? editingUser.uid || editingUser.id_user
      : `USR-${Date.now()}`;

    const userData = {
      id_user,
      nama: formData.get("nama") as string,
      name: formData.get("nama") as string, // Legacy compatibility
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as any,
      rt: formData.get("rt") as string,
      nik: formData.get("nik") as string,
      status: formData.get("status") as "AKTIF" | "NONAKTIF",
      isSuperAdmin: formData.get("isSuperAdmin") === "true",
      allow_warga_inventaris: formData.get("allow_warga_inventaris") === "true",
      tenantId,
      created_at: editingUser?.created_at || new Date().toISOString(),
    };

    if (!userData.username || !userData.role || !userData.email) {
      showNotification("Username, Role, dan Email wajib diisi!", "error");
      return;
    }

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "users", id_user), userData);

      // Sync with public_usernames
      await setDoc(doc(db, "public_usernames", userData.username), {
        email: userData.email,
      });

      setShowForm(false);
      setEditingUser(null);
      showNotification(
        `Data pengguna ${editingUser ? "diperbarui" : "ditambahkan"}!`,
        "success",
      );
    } catch (error: any) {
      handleFirestoreError(
        error,
        editingUser ? "update" : "create",
        `/users/${id_user}`,
      );
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(
        doc(db, "users", userToDelete.uid || userToDelete.id_user),
      );
      showNotification("User berhasil dihapus.", "success");
    } catch (error: any) {
      handleFirestoreError(
        error,
        "delete",
        `/users/${userToDelete.uid || userToDelete.id_user}`,
      );
      showNotification("Gagal menghapus user.", "error");
    } finally {
      setIsLoadingDB(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
            Manajemen Pengguna & Pemetaan Unit
          </h3>
          <div className="flex gap-2">
            {canCreate(currentUser?.role) && (
              <StyledButton
                label="Tambah User"
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(true);
                }}
                colorType="primary"
                icon={<PlusCircle className="w-4 h-4" />}
              />
            )}
            {canCreate(currentUser?.role) && (
              <StyledButton
                label="Daftar RT"
                onClick={() => setShowRTForm(true)}
                colorType="success"
                icon={<UserPlus className="w-4 h-4" />}
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse border-transparent">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Nama Pengguna
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Username
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Peran
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  RT/RW
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  NIK
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usersData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400 italic text-xs"
                  >
                    Belum ada data pengguna
                  </td>
                </tr>
              )}
              {usersData.map((user) => (
                <tr
                  key={
                    user.uid ||
                    user.id_user ||
                    user.nik ||
                    `user-${user.username}`
                  }
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-700">
                      {user.nama || user.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[10px] text-slate-500 font-medium font-mono">
                      {user.username || user.email?.split("@")[0]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        user.role === "SUPER_ADMIN"
                          ? "bg-slate-900 text-white border-slate-900"
                          : user.role === "ADMIN" || user.role === "RW"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : user.role === "RT" || user.role === "SEKRETARIS"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-green-50 text-green-600 border-green-100"
                      }`}
                    >
                      {user.role || "GUEST"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <p className="text-[11px] text-slate-600 font-bold font-mono">
                      {user.rt || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-slate-600 font-bold font-mono">
                      {user.nik || user.nikMapping || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        user.status === "AKTIF" || !user.status
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.status || "AKTIF"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {canUpdate(currentUser?.role) && (
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowForm(true);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete(currentUser?.role) && (
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {userToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Pengguna"
            message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete.nama || userToDelete.name}"?`}
            onConfirm={handleDeleteUser}
            onCancel={() => setUserToDelete(null)}
            confirmText="Hapus"
            cancelText="Batal"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRTForm && (
          <RTRegistrationForm
            onClose={() => setShowRTForm(false)}
            onSave={() => {}}
            showNotification={showNotification}
            handleFirestoreError={handleFirestoreError}
          />
        )}
      </AnimatePresence>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  {editingUser ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-slate-800">
                  {editingUser ? "Edit User" : "Tambah User baru"}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:text-red-500 rounded-lg bg-white border border-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    required
                    defaultValue={editingUser?.nama || editingUser?.name || ""}
                    placeholder="Contoh: Bpk. Budi Santoso"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Email (Untuk Login)
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingUser?.email || ""}
                    placeholder="admin@wilayah.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    defaultValue={editingUser?.username || ""}
                    placeholder="user123"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required={!editingUser}
                      defaultValue={editingUser?.password || ""}
                      placeholder="******"
                      className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Peran (Role)
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || "RT"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  >
                    {currentUser?.isSuperAdmin && (
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    )}
                    <option value="ADMIN">ADMIN (Full CRUD)</option>
                    <option value="OPERATOR">OPERATOR (Create, Update)</option>
                    <option value="VIEWER">VIEWER (Read Only)</option>
                    <option value="RW">RW</option>
                    <option value="RT">RT</option>
                    <option value="BENDAHARA">BENDAHARA</option>
                    <option value="SEKRETARIS">SEKRETARIS</option>
                    <option value="SATPAM">SATPAM</option>
                    <option value="KADER">KADER</option>
                    <option value="WARGA">WARGA</option>
                    <option value="TAMU">TAMU / GUEST</option>
                  </select>
                </div>

                {currentUser?.isSuperAdmin ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      Akses Khusus
                    </label>
                    <select
                      name="isSuperAdmin"
                      defaultValue={
                        editingUser?.isSuperAdmin ? "true" : "false"
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                    >
                      <option value="false">Standard User</option>
                      <option value="true">Super Admin Power</option>
                    </select>
                  </div>
                ) : (
                  <input type="hidden" name="isSuperAdmin" value="false" />
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    {getTranslatedLabel("Nomor RT/RW", settings?.themeMode)}
                  </label>
                  <input
                    type="text"
                    name="rt"
                    defaultValue={
                      editingUser?.rt ||
                      (settings?.RT && settings?.RW
                        ? `${settings.RT} / ${settings.RW}`
                        : settings?.RT || "")
                    }
                    placeholder="Contoh: 01 / 26"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    NIK (Optional)
                  </label>
                  <input
                    type="text"
                    name="nik"
                    defaultValue={
                      editingUser?.nik || editingUser?.nikMapping || ""
                    }
                    placeholder="16 Digit NIK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Izin Khusus Fitur Inventaris
                  </label>
                  <select
                    name="allow_warga_inventaris"
                    defaultValue={editingUser?.allow_warga_inventaris ? "true" : "false"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="false">Tidak Diizinkan Mengakses Inventaris (Bawaan)</option>
                    <option value="true">Diizinkan Mengakses Inventaris</option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 italic">
                    Khusus untuk pengguna dengan Peran (Role) WARGA.
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingUser?.status || "AKTIF"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-slate-500 font-black uppercase text-[10px] tracking-widest border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
