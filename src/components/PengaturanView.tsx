import React, { useState, useEffect } from "react";
import {
  Database,
  Shield,
  Settings,
  X,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
  Download,
  LayoutGrid,
} from "lucide-react";
import { motion } from "motion/react";
import {
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { getTranslatedLabel } from "../lib/langUtils";
import { getPlanFeatures } from "../lib/appUtils";
import AppQRCode from "./AppQRCode";

interface PengaturanViewProps {
  tenantId: string;
  currentTenant?: any;
  wargaData?: any[];
  settings: any;
  userRole: string;
  handleFileUpload: any;
  showNotification: any;
  handleFirestoreError: any;
  currentUser: any;
  setActiveTab: any;
}

const QuotaProgress = ({
  label,
  current,
  max,
  color = "blue",
  isText = false,
}: {
  label: string;
  current: any;
  max: any;
  color?: string;
  isText?: boolean;
}) => {
  const percentage = isText ? 100 : Math.min(100, (current / max) * 100);
  const colorMap: Record<string, string> = {
    blue: "bg-brand-blue",
    pink: "bg-brand-pink",
    yellow: "bg-brand-yellow",
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
  };

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          {label}
        </span>
        <span
          className={`text-[10px] font-black ${isText ? "text-indigo-600" : "text-slate-600"}`}
        >
          {isText ? (
            current
          ) : (
            <>
              {current} / <span className="text-slate-400">{max}</span>
            </>
          )}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${colorMap[color] || "bg-brand-blue"}`}
        />
      </div>
    </div>
  );
};

export default function PengaturanView({
  tenantId,
  currentTenant,
  wargaData,
  settings,
  userRole,
  handleFileUpload,
  showNotification,
  handleFirestoreError,
  currentUser,
  setActiveTab,
}: PengaturanViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(settings?.themeMode || "rt_rw");

  // Sync previewMode when settings change (e.g. after save)
  useEffect(() => {
    if (settings?.themeMode) setPreviewMode(settings.themeMode);
  }, [settings?.themeMode]);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roleUpper = userRole?.toUpperCase();
    if (
      roleUpper !== "ADMIN" &&
      roleUpper !== "SUPER_ADMIN" &&
      roleUpper !== "OWNER" &&
      roleUpper !== "SUPER ADMIN" &&
      roleUpper !== "RW" &&
      roleUpper !== "RT" &&
      !currentUser?.isSuperAdmin
    ) {
      showNotification("Hanya Admin yang dapat mengubah pengaturan.", "error");
      return;
    }

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const newSettings: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        newSettings[key] = value;
      }
    });

    try {
      // Save General Settings
      await setDoc(doc(db, "settings", tenantId), newSettings, { merge: true });

      // Build tenant update object
      const tenantUpdate: any = {};
      if (newSettings.tenant_system_logo) {
        tenantUpdate.logo_url = newSettings.tenant_system_logo;
      }
      if (newSettings.nama_rt) {
        tenantUpdate.name = newSettings.nama_rt;
        tenantUpdate.nama = newSettings.nama_rt;
      }
      if (newSettings.tagline !== undefined) {
        tenantUpdate.tagline = newSettings.tagline;
      }

      // Save Tenant Info if we have updates
      if (Object.keys(tenantUpdate).length > 0) {
        await setDoc(doc(db, "tenants", tenantId), tenantUpdate, {
          merge: true,
        });
      }

      showNotification("Pengaturan berhasil disimpan.", "success");
    } catch (error) {
      console.error("Save Settings Error:", error);
      if (typeof handleFirestoreError === "function") {
        handleFirestoreError(error, "update", `settings/${tenantId}`);
      } else {
        showNotification(
          "Gagal menyimpan pengaturan. Periksa koneksi atau izin anda.",
          "error",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const generateDummyData = async () => {
    setIsGenerating(true);
    setGenerateMsg("Mulai membuat data dummy...");

    try {
      const batch = writeBatch(db);

      // --- 1. DATA WARGA (20 Warga, 5 Kepala Keluarga) ---
      const keluargaData = [
        {
          kk: "3216061111111111",
          namaKK: "Budi Santoso",
          istri: "Siti Aminah",
          anak1: "Budi Junior",
          anak2: "Ayu Lestari",
          rt: "01",
          blok: "Blok A No 1",
        },
        {
          kk: "3216062222222222",
          namaKK: "Ahmad Dahlan",
          istri: "Chairunnisa",
          anak1: "Raka Pratama",
          anak2: "Riki Hermawan",
          rt: "02",
          blok: "Blok B No 12",
        },
        {
          kk: "3216063333333333",
          namaKK: "Joko Widodo",
          istri: "Iriana M",
          anak1: "Gibran R",
          anak2: "Kaesang P",
          rt: "03",
          blok: "Blok C No 5",
        },
        {
          kk: "3216064444444444",
          namaKK: "Prabowo S",
          istri: "Titiek S",
          anak1: "Didit H",
          anak2: "Bobby N",
          rt: "01",
          blok: "Blok A No 8",
        },
        {
          kk: "3216065555555555",
          namaKK: "Susilo B Y",
          istri: "Ani Y",
          anak1: "Agus H",
          anak2: "Ibas Y",
          rt: "04",
          blok: "Blok D No 15",
        },
      ];

      let generatedWargas: any[] = [];
      let wIdx = 1;
      const nowWARGA = Date.now();

      for (const kel of keluargaData) {
        const familyMembers = [
          {
            nama: kel.namaKK,
            posisi: "Suami (Kepala Keluarga)",
            jk: "Laki-Laki",
            ttl: `Jakarta, ${1970 + wIdx}-01-01`,
          },
          {
            nama: kel.istri,
            posisi: "Istri",
            jk: "Perempuan",
            ttl: `Jakarta, ${1973 + wIdx}-02-02`,
          },
          {
            nama: kel.anak1,
            posisi: "Anak",
            jk: "Laki-Laki",
            ttl: `Jakarta, ${1995 + wIdx}-03-03`,
          },
          {
            nama: kel.anak2,
            posisi: "Anak",
            jk: wIdx % 2 === 0 ? "Laki-Laki" : "Perempuan",
            ttl: `Jakarta, ${1998 + wIdx}-04-04`,
          },
        ];

        for (const member of familyMembers) {
          const wId = `WARGA-${nowWARGA}-${wIdx}-${Math.floor(Math.random() * 10000)}`;
          const newWarga = {
            id: wId,
            tenantId: tenantId,
            nik: `321606${nowWARGA.toString().slice(-6)}${wIdx.toString().padStart(4, "0")}`,
            kk: kel.kk,
            nama: member.nama,
            tempatLahir: member.ttl.split(", ")[0],
            tglLahir: member.ttl.split(", ")[1],
            jk: member.jk,
            posisi: member.posisi,
            agama: "Islam",
            kawin: member.posisi === "Anak" ? "Belum Kawin" : "Kawin",
            kewarganegaraan: "WNI",
            profesi:
              member.posisi === "Anak"
                ? "Pelajar/Mahasiswa"
                : "Karyawan Swasta",
            rt: kel.rt,
            rw: "26",
            kelurahan: "Kebalen",
            kecamatan: "Babelan",
            kota_kab: "Bekasi",
            blok: kel.blok,
            status: "Warga Tetap",
            hp: `0812${Date.now().toString().slice(-8)}`,
            fotoText: "-",
            fotoUrl: null,
          };
          generatedWargas.push(newWarga);
          batch.set(doc(db, "data_warga", wId), newWarga);
          wIdx++;
        }
      }

      setGenerateMsg("Warga berhasil di-generate. Membuat transaksi & kas...");

      // --- 2. DATA TRANSAKSI (IURAN & KAS) (50 Item) ---
      const nowTX = Date.now();
      for (let i = 1; i <= 50; i++) {
        const RandomWarga =
          generatedWargas[Math.floor(Math.random() * generatedWargas.length)];
        const isKeluar = i % 4 === 0; // 25% pengeluaran

        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 90)); // random within last 90 days
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const formattedDateTime =
          formattedDate +
          ", " +
          dateObj
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(/\./g, ":");

        const kasId = `TRX-DUMMY-${nowTX}-${i}`;
        const iuranId = `INV-DUMMY-${nowTX}-${i}`;

        let jenis = "";
        let keterangan = "";
        let nominal = 0;

        if (isKeluar) {
          const jenisPengeluaran = [
            "Pemeliharaan Lingkungan",
            "Kegiatan Warga",
            "Upah",
            "Bayar jasa",
            "Pemasangan",
          ];
          jenis = jenisPengeluaran[i % jenisPengeluaran.length];
          keterangan = `Pembayaran ${jenis}`;
          nominal = 150000 + Math.floor(Math.random() * 5) * 50000;

          batch.set(doc(db, "kas", kasId), {
            id: kasId,
            tenantId: tenantId,
            tanggal: formattedDate,
            tipe: "Keluar",
            transaksi: jenis,
            nama: i % 2 === 0 ? "Toko Material" : "Bpk. Tukang",
            alamat: "-",
            keterangan: keterangan,
            debit: 0,
            kredit: nominal,
            strukUrl: "",
          });
        } else {
          jenis = "Iuran Rutin Warga";
          keterangan = "Iuran Bulanan";
          nominal = 50000;

          // Set ke kas
          batch.set(doc(db, "kas", kasId), {
            tenantId: tenantId,
            id: kasId,
            tanggal: formattedDate,
            tipe: "Masuk",
            transaksi: jenis,
            nama: RandomWarga.nama,
            alamat: RandomWarga.blok,
            keterangan: keterangan,
            debit: nominal,
            kredit: 0,
            strukUrl: "",
          });

          // Set ke iuran
          batch.set(doc(db, "iuran", iuranId), {
            tenantId: tenantId,
            id: iuranId,
            rt: RandomWarga.rt,
            tanggal: formattedDateTime,
            transaksi: jenis,
            nama: RandomWarga.nama,
            alamat: RandomWarga.blok,
            tipe: "Masuk",
            periode: "Mar 2026",
            nominal: nominal,
            status: "Lunas",
            keterangan: keterangan,
            strukUrl: "",
          });
        }
      }

      setGenerateMsg(
        "Transaksi berhasil di-generate. Membuat Surat Pengantar...",
      );

      // --- 3. DATA SURAT (50 Item) ---
      const jenisSurat = [
        "Surat Pengantar KTP",
        "Surat Keterangan Domisili",
        "Surat Pengantar SKCK",
        "Surat Keterangan Usaha (SKU)",
      ];
      const nowSRT = Date.now();
      for (let i = 1; i <= 50; i++) {
        const RandomWarga =
          generatedWargas[Math.floor(Math.random() * generatedWargas.length)];
        const jSurat = jenisSurat[i % jenisSurat.length];

        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 30)); // random within last 30 days
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const suratId = `SRT-DUMMY-${nowSRT}-${i}`;

        batch.set(doc(db, "surat", suratId), {
          tenantId: tenantId,
          id: suratId,
          rt: RandomWarga.rt,
          tanggal: formattedDate,
          jenis: jSurat,
          pemohon: RandomWarga.nama,
          status: i % 5 === 0 ? "Draft" : i % 7 === 0 ? "Ditolak" : "Selesai",
          keterangan: "Keperluan administrasi",
        });
      }

      // Consistent choices of 3 residents from our generated list as examples for other features
      const rWarga1 = generatedWargas[0] || { id: "WARGA-DUMMY-1", nama: "Budi Santoso", nik: "3216060000000001", rt: "01", blok: "Blok A No 1", hp: "08123456781", kk: "3216061111111111", jk: "Laki-Laki", tglLahir: "1980-05-15" };
      const rWarga2 = generatedWargas[4] || { id: "WARGA-DUMMY-2", nama: "Ahmad Dahlan", nik: "3216060000000002", rt: "02", blok: "Blok B No 12", hp: "08123456782", kk: "3216062222222222", jk: "Laki-Laki", tglLahir: "1982-10-12" };
      const rWarga3 = generatedWargas[8] || { id: "WARGA-DUMMY-3", nama: "Joko Widodo", nik: "3216060000000003", rt: "03", blok: "Blok C No 5", hp: "08123456783", kk: "3216063333333333", jk: "Laki-Laki", tglLahir: "1975-04-20" };

      setGenerateMsg("Membuat data pengaduan, booking, dan verifikasi...");

      // --- 4. DATA PENGADUAN / KELUHAN (3 Item) ---
      const nowCP = Date.now();
      const complaints = [
        {
          id: `CP-DUMMY-${nowCP}-1`,
          tenantId: tenantId,
          userId: rWarga1.id,
          namaWarga: rWarga1.nama,
          jenisKeluhan: "Fasilitas Umum",
          deskripsi: "Lampu penerangan jalan utama dekat lapangan RT 01 padam, mohon responnya karena berbahaya saat malam hari.",
          status: "PROCESS",
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: `CP-DUMMY-${nowCP}-2`,
          tenantId: tenantId,
          userId: rWarga2.id,
          namaWarga: rWarga2.nama,
          jenisKeluhan: "Koleksi Sampah",
          deskripsi: "Petugas pengangkut sampah belum lewat sejak hari senin lalu, tumpukan sampah mulai menimbulkan aroma tidak sedap.",
          status: "SOLVED",
          createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: `CP-DUMMY-${nowCP}-3`,
          tenantId: tenantId,
          userId: rWarga3.id,
          namaWarga: rWarga3.nama,
          jenisKeluhan: "Keamanan",
          deskripsi: "Ada kendaraan mencurigakan sering parkir di gerbang pintu masuk Blok C dari jam 1 malam tanpa melapor ke satpam.",
          status: "PENDING",
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        }
      ];
      for (const item of complaints) {
        batch.set(doc(db, "complaints", item.id), item);
      }

      // --- 5. DATA BOOKING FASILITAS (3 Item) ---
      const nowBK = Date.now();
      const bookings = [
        {
          id: `BK-DUMMY-${nowBK}-1`,
          tenantId: tenantId,
          userId: rWarga1.id,
          namaWarga: rWarga1.nama,
          namaFasilitas: "Balai RW Serbaguna",
          tanggal: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          keperluan: "Penyelenggaraan tumpengan & syukuran keluarga",
          status: "APPROVED",
          createdAt: new Date().toISOString()
        },
        {
          id: `BK-DUMMY-${nowBK}-2`,
          tenantId: tenantId,
          userId: rWarga2.id,
          namaWarga: rWarga2.nama,
          namaFasilitas: "Satu Set Tenda & 50 Kursi Lipat",
          tanggal: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
          keperluan: "Resepsi pernikahan sederhana halaman rumah",
          status: "APPROVED",
          createdAt: new Date().toISOString()
        },
        {
          id: `BK-DUMMY-${nowBK}-3`,
          tenantId: tenantId,
          userId: rWarga3.id,
          namaWarga: rWarga3.nama,
          namaFasilitas: "Lapangan Olahraga Bulutangkis",
          tanggal: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
          keperluan: "Turnamen persahabatan anak-anak pemuda RT 03",
          status: "PENDING",
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of bookings) {
        batch.set(doc(db, "bookings", item.id), item);
      }

      // --- 6. DATA VERIFIKASI WARGA MANDIRI (3 Item) ---
      const nowVF = Date.now();
      const verifikasiReqs = [
        {
          id: `VRF-DUMMY-${nowVF}-1`,
          tenantId: tenantId,
          nik: rWarga1.nik,
          kk: rWarga1.kk || "3216060000001001",
          nama: rWarga1.nama,
          rt: rWarga1.rt,
          rw: "26",
          hp: rWarga1.hp || "081234567890",
          posisi: rWarga1.posisi || "Kepala Keluarga",
          profesi: "Wiraswasta Kuliner",
          jk: rWarga1.jk || "Laki-Laki",
          tglLahir: rWarga1.tglLahir || "1980-05-15",
          status: "Menunggu Persetujuan",
          submittedAt: new Date().toISOString(),
          type: "PERBAIKAN_DATA",
          ktpUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400",
          kkUrl: "",
        },
        {
          id: `VRF-DUMMY-${nowVF}-2`,
          tenantId: tenantId,
          nik: rWarga2.nik,
          kk: rWarga2.kk || "3216060000001002",
          nama: rWarga2.nama,
          rt: rWarga2.rt,
          rw: "26",
          hp: rWarga2.hp || "081234567891",
          posisi: rWarga2.posisi || "Kepala Keluarga",
          profesi: "Pegawai Negeri Sipil",
          jk: rWarga2.jk || "Laki-Laki",
          tglLahir: rWarga2.tglLahir || "1982-10-12",
          status: "Disetujui",
          submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          type: "PERBAIKAN_DATA",
          ktpUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400",
          kkUrl: "",
        },
        {
          id: `VRF-DUMMY-${nowVF}-3`,
          tenantId: tenantId,
          nik: rWarga3.nik,
          kk: rWarga3.kk || "3216060000001003",
          nama: rWarga3.nama,
          rt: rWarga3.rt,
          rw: "26",
          hp: rWarga3.hp || "081234567892",
          posisi: rWarga3.posisi || "Kepala Keluarga",
          profesi: "Dokter Swasta",
          jk: rWarga3.jk || "Laki-Laki",
          tglLahir: rWarga3.tglLahir || "1975-04-20",
          status: "Menunggu Persetujuan",
          submittedAt: new Date().toISOString(),
          type: "PERBAIKAN_DATA",
          ktpUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400",
          kkUrl: "",
        }
      ];
      for (const item of verifikasiReqs) {
        batch.set(doc(db, "verifikasi_warga", item.id), item);
      }

      setGenerateMsg("Membuat data Bank Sampah...");

      // --- 7. DATA BANK SAMPAH (3 Kategori, 3 Setoran, 3 Tarikan) ---
      const sampahKats = [
        { tenantId, id: `KAT-DUMMY-1`, nama: "Botol Plastik PET", satuan: "Kg", hargaBeli: 3000 },
        { tenantId, id: `KAT-DUMMY-2`, nama: "Kertas/Kardus Bekas", satuan: "Kg", hargaBeli: 2000 },
        { tenantId, id: `KAT-DUMMY-3`, nama: "Minyak Jelantah Rumah Tangga", satuan: "Litter", hargaBeli: 6000 },
      ];
      for (const item of sampahKats) {
        batch.set(doc(db, "sampah_kategori", item.id), item);
      }

      const nowSP = Date.now();
      const setoranSampah = [
        {
          tenantId,
          id: `STR-DUMMY-${nowSP}-1`,
          nasabahId: rWarga1.nik,
          namaNasabah: rWarga1.nama,
          kategoriId: "KAT-DUMMY-1",
          namaKategori: "Botol Plastik PET",
          berat: 5,
          harga: 3000,
          total: 15000,
          tanggal: new Date().toISOString().split('T')[0],
          status: "Selesai",
          keterangan: "Tabungan rutin mingguan keluarga",
        },
        {
          tenantId,
          id: `STR-DUMMY-${nowSP}-2`,
          nasabahId: rWarga2.nik,
          namaNasabah: rWarga2.nama,
          kategoriId: "KAT-DUMMY-2",
          namaKategori: "Kertas/Kardus Bekas",
          berat: 12,
          harga: 2000,
          total: 24000,
          tanggal: new Date().toISOString().split('T')[0],
          status: "Selesai",
          keterangan: "Hasil pembersihan gudang bulanan",
        },
        {
          tenantId,
          id: `STR-DUMMY-${nowSP}-3`,
          nasabahId: rWarga3.nik,
          namaNasabah: rWarga3.nama,
          kategoriId: "KAT-DUMMY-3",
          namaKategori: "Minyak Jelantah Rumah Tangga",
          berat: 3,
          harga: 6000,
          total: 18000,
          tanggal: new Date().toISOString().split('T')[0],
          status: "Selesai",
          keterangan: "Sisa pemakaian minyak goreng rumah tangga",
        }
      ];
      for (const item of setoranSampah) {
        batch.set(doc(db, "sampah_setoran", item.id), item);
      }

      const tarikanSampah = [
        {
          tenantId,
          id: `TRK-DUMMY-${nowSP}-1`,
          nasabahId: rWarga1.nik,
          namaNasabah: rWarga1.nama,
          nominal: 10000,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Penarikan tabungan untuk jajan anak",
        },
        {
          tenantId,
          id: `TRK-DUMMY-${nowSP}-2`,
          nasabahId: rWarga2.nik,
          namaNasabah: rWarga2.nama,
          nominal: 20000,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Tarik kas sampah",
        },
        {
          tenantId,
          id: `TRK-DUMMY-${nowSP}-3`,
          nasabahId: rWarga3.nik,
          namaNasabah: rWarga3.nama,
          nominal: 15000,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Tarik tabungan tunai",
        }
      ];
      for (const item of tarikanSampah) {
        batch.set(doc(db, "sampah_tarik_saldo", item.id), item);
      }

      setGenerateMsg("Membuat data Posyandu...");

      // --- 8. DATA POSYANDU & KESEHATAN (3 Balita, 3 Ibu Hamil, 3 Pemeriksaan, 3 Imunisasi) ---
      const balitas = [
        {
          id: `BLT-DUMMY-1`,
          tenantId,
          nama: "Budi Junior",
          tglLahir: "2023-01-15",
          jk: "Laki-Laki",
          orangTuaId: rWarga1.nik,
          namaOrangTua: rWarga1.nama,
          alamat: rWarga1.blok,
          rt: rWarga1.rt,
          rw: "26",
          statusStunting: "Normal"
        },
        {
          id: `BLT-DUMMY-2`,
          tenantId,
          nama: "Siti Fatimah",
          tglLahir: "2023-11-20",
          jk: "Perempuan",
          orangTuaId: rWarga2.nik,
          namaOrangTua: rWarga2.nama,
          alamat: rWarga2.blok,
          rt: rWarga2.rt,
          rw: "26",
          statusStunting: "Normal"
        },
        {
          id: `BLT-DUMMY-3`,
          tenantId,
          nama: "Joko Junior",
          tglLahir: "2022-08-10",
          jk: "Laki-Laki",
          orangTuaId: rWarga3.nik,
          namaOrangTua: rWarga3.nama,
          alamat: rWarga3.blok,
          rt: rWarga3.rt,
          rw: "26",
          statusStunting: "Tinggi Kurang (Risiko Stunting)"
        }
      ];
      for (const item of balitas) {
        batch.set(doc(db, "balita", item.id), item);
      }

      const ibuHamils = [
        {
          id: `MIL-DUMMY-1`,
          tenantId,
          nik: "3216069900000001",
          nama: "Ibu Rahmawati (Istri Budi)",
          tglHPL: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usiaKehamilan: 28,
          riwayatKesehatan: "Kondisi sehat, HB normal",
          rt: rWarga1.rt,
          rw: "26"
        },
        {
          id: `MIL-DUMMY-2`,
          tenantId,
          nik: "3216069900000002",
          nama: "Ibu Susi Susanti",
          tglHPL: new Date(Date.now() + 110 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usiaKehamilan: 16,
          riwayatKesehatan: "Mual di pagi hari, disarankan istirahat cukup",
          rt: rWarga2.rt,
          rw: "26"
        },
        {
          id: `MIL-DUMMY-3`,
          tenantId,
          nik: "3216069900000003",
          nama: "Ibu Megawati",
          tglHPL: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usiaKehamilan: 36,
          riwayatKesehatan: "Kaki bengkak ringan, tensi darah normal",
          rt: rWarga3.rt,
          rw: "26"
        }
      ];
      for (const item of ibuHamils) {
        batch.set(doc(db, "ibu_hamil", item.id), item);
      }

      const pemeriksaanBalitas = [
        {
          id: `PMK-DUMMY-1`,
          tenantId,
          balitaId: "BLT-DUMMY-1",
          statusGizi: "Normal",
          beratBadan: 14.2,
          tinggiBadan: 94.5,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: "Anak lincah dan nafsu makan sangat bagus",
          pemeriksa: "Bid. Sri Lestari"
        },
        {
          id: `PMK-DUMMY-2`,
          tenantId,
          balitaId: "BLT-DUMMY-2",
          statusGizi: "Normal",
          beratBadan: 8.5,
          tinggiBadan: 71.2,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: "ASI Eksklusif masih berlanjut, imunisasi tepat waktu",
          pemeriksa: "Bid. Sri Lestari"
        },
        {
          id: `PMK-DUMMY-3`,
          tenantId,
          balitaId: "BLT-DUMMY-3",
          statusGizi: "Tinggi Kurang (Risiko Stunting)",
          beratBadan: 11.8,
          tinggiBadan: 82.0,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: "Disarankan mengonsumsi protein dan susu pertumbuhan ekstra",
          pemeriksa: "Bpk. Dokter RT"
        }
      ];
      for (const item of pemeriksaanBalitas) {
        batch.set(doc(db, "pemeriksaan_balita", item.id), item);
      }

      const imunisasiBalitas = [
        {
          id: `IMU-DUMMY-1`,
          tenantId,
          balitaId: "BLT-DUMMY-1",
          jenisImunisasi: "DPT-HB-HIB 3",
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Telah selesai disuntikkan"
        },
        {
          id: `IMU-DUMMY-2`,
          tenantId,
          balitaId: "BLT-DUMMY-2",
          jenisImunisasi: "Polio 4",
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Tetes mulut, kondisi anak riang"
        },
        {
          id: `IMU-DUMMY-3`,
          tenantId,
          balitaId: "BLT-DUMMY-3",
          jenisImunisasi: "Campak Rubella (MR)",
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Imunisasi ulang dlm program Bulan Imunisasi Anak Sekolah/Balita"
        }
      ];
      for (const item of imunisasiBalitas) {
        batch.set(doc(db, "imunisasi", item.id), item);
      }

      setGenerateMsg("Membuat data E-Toko...");

      // --- 9. DATA E-TOKO WARGA (3 Produk, 3 Pesanan) ---
      const tokoProds = [
        {
          id: "PROD-DUMMY-1",
          tenantId,
          name: "Madu Hutan Murni Asli RT 01",
          price: 95000,
          stock: 25,
          category: "Kesehatan",
          description: "Madu hutan lebah liar berkhasiat tinggi, diproduksi higienis oleh kelompok UKM warga RT 01.",
          image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
          sellerId: "seller_rt01",
          sellerName: "UKM Mandiri RT 01"
        },
        {
          id: "PROD-DUMMY-2",
          tenantId,
          name: "Sambal Garing Tempe Mak Nyus",
          price: 15000,
          stock: 60,
          category: "Lauk Pauk",
          description: "Pedas gurih, garing, nikmat. Sangat cocok disajikan bersama nasi hangat maupun mie kuah.",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
          sellerId: "seller_rt02",
          sellerName: "Dapur Bu Siti"
        },
        {
          id: "PROD-DUMMY-3",
          tenantId,
          name: "Sabun Cuci Piring Cair Aromaterapi",
          price: 8000,
          stock: 100,
          category: "Kebutuhan Rumah Tangga",
          description: "Formula jeruk nipis konsentrat tinggi, kesat, harum dan sangat lembut di tangan.",
          image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400",
          sellerId: "seller_rt03",
          sellerName: "Koperasi Warga Lestari"
        }
      ];
      for (const item of tokoProds) {
        batch.set(doc(db, "toko_products", item.id), item);
      }

      const orders = [
        {
          id: `ORD-DUMMY-1`,
          tenantId,
          items: [{ id: "PROD-DUMMY-1", name: "Madu Hutan Murni Asli RT 01", price: 95000, qty: 1 }],
          subtotal: 95000,
          shippingFee: 5000,
          discount: 0,
          total: 100000,
          promoApplied: null,
          customerName: rWarga1.nama,
          customerId: rWarga1.nik,
          phone: rWarga1.hp || "-",
          address: rWarga1.blok,
          paymentMethod: "COD",
          status: "DELIVERED",
          timestamp: new Date().toISOString()
        },
        {
          id: `ORD-DUMMY-2`,
          tenantId,
          items: [{ id: "PROD-DUMMY-2", name: "Sambal Garing Tempe Mak Nyus", price: 15000, qty: 3 }],
          subtotal: 45000,
          shippingFee: 5000,
          discount: 0,
          total: 50000,
          promoApplied: null,
          customerName: rWarga2.nama,
          customerId: rWarga2.nik,
          phone: rWarga2.hp || "-",
          address: rWarga2.blok,
          paymentMethod: "COD",
          status: "COMPLETED",
          timestamp: new Date().toISOString()
        },
        {
          id: `ORD-DUMMY-3`,
          tenantId,
          items: [{ id: "PROD-DUMMY-3", name: "Sabun Cuci Piring Cair Aromaterapi", price: 8000, qty: 2 }],
          subtotal: 16000,
          shippingFee: 5000,
          discount: 0,
          total: 21000,
          promoApplied: null,
          customerName: rWarga3.nama,
          customerId: rWarga3.nik,
          phone: rWarga3.hp || "-",
          address: rWarga3.blok,
          paymentMethod: "TRANSFER",
          status: "PENDING",
          timestamp: new Date().toISOString()
        }
      ];
      for (const item of orders) {
        batch.set(doc(db, "toko_orders", item.id), item);
      }

      setGenerateMsg("Membuat data Inventaris...");

      // --- 10. DATA INVENTARIS RT/RW (3 Item, 3 Logs) ---
      const inventarisItems = [
        {
          id: "INV-DUMMY-1",
          tenantId,
          rtId: "rw_berjuang",
          nama_barang: "Kursi Lipat Putih Chitose",
          kategori: "Meja & Kursi",
          jumlah: 60,
          kondisi: "Baik",
          lokasi: "Gudang RW Serbaguna",
          tanggal_pengadaan: "2024-03-20",
          keterangan: "Hibah pembinaan warga berprestasi"
        },
        {
          id: "INV-DUMMY-2",
          tenantId,
          rtId: "rw_berjuang",
          nama_barang: "Tenda Lipat Gazebo 3x4m",
          kategori: "Tenda",
          jumlah: 3,
          kondisi: "Baik",
          lokasi: "Gudang RW Serbaguna",
          tanggal_pengadaan: "2024-05-10",
          keterangan: "Pengadaan mandiri APB-RT"
        },
        {
          id: "INV-DUMMY-3",
          tenantId,
          rtId: "rw_berjuang",
          nama_barang: "Sound System Portable Bluetooth + 2 Mic Wireless",
          kategori: "Elektronik",
          jumlah: 1,
          kondisi: "Sangat Baik",
          lokasi: "Kantor Secretariat RW",
          tanggal_pengadaan: "2025-01-15",
          keterangan: "Bantuan dari aparat Kelurahan"
        }
      ];
      for (const item of inventarisItems) {
        batch.set(doc(db, "inventaris", item.id), item);
      }

      const invLogs = [
        {
          id: `INV-LOG-DUMMY-1`,
          tenantId,
          itemId: "INV-DUMMY-1",
          namaBarang: "Kursi Lipat Putih Chitose",
          tipe: "PINJAM",
          jumlah: 20,
          namaPeminjam: rWarga1.nama,
          nikPeminjam: rWarga1.nik,
          tanggalPinjam: new Date().toISOString().split('T')[0],
          tanggalKembaliPlan: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "AKTIF",
          keterangan: "Dipinjam untuk acara syukuran rumah baru"
        },
        {
          id: `INV-LOG-DUMMY-2`,
          tenantId,
          itemId: "INV-DUMMY-2",
          namaBarang: "Tenda Lipat Gazebo 3x4m",
          tipe: "PINJAM",
          jumlah: 1,
          namaPeminjam: rWarga2.nama,
          nikPeminjam: rWarga2.nik,
          tanggalPinjam: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          tanggalKembaliPlan: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "SELESAI",
          keterangan: "Dipinjam pelengkap syukuran"
        },
        {
          id: `INV-LOG-DUMMY-3`,
          tenantId,
          itemId: "INV-DUMMY-3",
          namaBarang: "Sound System Portable Bluetooth",
          tipe: "PINJAM",
          jumlah: 1,
          namaPeminjam: rWarga3.nama,
          nikPeminjam: rWarga3.nik,
          tanggalPinjam: new Date().toISOString().split('T')[0],
          tanggalKembaliPlan: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "AKTIF",
          keterangan: "Rapat karang taruna tingkat RT"
        }
      ];
      for (const item of invLogs) {
        batch.set(doc(db, "inventaris_logs", item.id), item);
      }

      setGenerateMsg("Membuat data Pemilihan...");

      // --- 11. DATA KANDIDAT PEMILIHAN / VOTING (3 Kandidat) ---
      const candidates = [
        {
          id: "1",
          tenantId,
          number: "01",
          name: "Bpk. Ahmad Suhendar",
          vision: "Menjadikan lingkungan rukun, asri, berdaya saing mandiri, serta melek teknologi pelayanan digital terpadu.",
          mission: "1. Mengoptimalkan sistem keamanan ronda digital\n2. Melaksanakan gotong royong terpadu satu bulan sekali\n3. Pengelolaan sampah pintar dengan Bank Sampah.",
          votes: 0,
        },
        {
          id: "2",
          tenantId,
          number: "02",
          name: "Bpk. Joko Anas",
          vision: "E-Synergy RW26: Pelayanan cepat, responsif, transparan, berkeadilan serta mengutamakan kepentingan sosial.",
          mission: "1. Menumbuhkan kewirausahaan warga di E-Toko\n2. Meningkatkan pelayanan Posyandu dan Lansia digital\n3. Transparansi laporan pemasukan kas RT/RW secara real-time.",
          votes: 0,
        },
        {
          id: "3",
          tenantId,
          number: "03",
          name: "Bpk. Bambang Pamungkas",
          vision: "Membangun lingkungan asri, harmonis, menjunjung tinggi toleransi kerukunan umat beragama serta sarana olahraga.",
          mission: "1. Renovasi total lapangan serbaguna Blok D\n2. Membentuk perkumpulan senam pagi mingguan warga\n3. Optimalisasi permohonan surat elektronik.",
          votes: 0,
        }
      ];
      for (const item of candidates) {
        batch.set(doc(db, "voting_candidates", `${tenantId}_${item.id}`), item);
      }

      setGenerateMsg("Menulis semua data ke Database, mohon tunggu...");
      await batch.commit();

      setGenerateMsg(
        "Selesai! Data Dummy berhasil ditambahkan ke seluruh Fitur Database.",
      );
      setTimeout(() => {
        setGenerateMsg("");
      }, 5000);
    } catch (error) {
      console.error(error);
      setGenerateMsg("Gagal membuat data dummy.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Package Summary */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Paket: {currentTenant?.status || "Trial"}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Langganan Anda Saat Ini
              </p>
              {currentUser?.isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("super-admin")}
                  className="mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" /> Kelola (Tambah Slot) di
                  Manajemen Tenant
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-8 items-center min-w-[250px]">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Penggunaan {getTranslatedLabel("Warga", previewMode)}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 leading-none">
                  {wargaData?.length || 0}
                </span>
                <span className="text-sm font-bold text-slate-500">
                  / {getPlanFeatures(currentTenant).maxWarga} Limit
                </span>
              </div>
            </div>
            <div>
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex"
                style={{
                  background: `conic-gradient(#3b82f6 ${((wargaData?.length || 0) / getPlanFeatures(currentTenant).maxWarga) * 100}%, #e2e8f0 0)`,
                }}
              >
                <div className="w-9 h-9 m-auto bg-slate-50 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-700">
                    {Math.round(
                      ((wargaData?.length || 0) /
                        getPlanFeatures(currentTenant).maxWarga) *
                        100,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pengaturan Utama */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <form onSubmit={handleSaveSettings}>
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
              <Settings className="w-4 h-4 mr-2 text-blue-600" />
              Pengaturan Sistem
            </h3>
            {(userRole === "ADMIN" ||
              userRole === "SUPER_ADMIN" ||
              userRole === "OWNER" ||
              userRole === "SUPER ADMIN") && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                Mode Editor
              </span>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 mb-2 mt-4">
                <label className="text-[10px] font-black text-orange-600 uppercase mb-2 block tracking-wider">
                  Mode Tema Aplikasi
                </label>
                <select
                  name="themeMode"
                  value={previewMode}
                  onChange={(e) => setPreviewMode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 transition-all font-bold text-slate-800 shadow-sm"
                >
                  <option value="rt_rw">Mode Lingkungan (RT/RW - Default)</option>
                  <option value="cluster">Mode Perumahan & Cluster (Blok/Cluster)</option>
                  <option value="apartemen">Mode Apartemen & Gedung (Unit/Lantai/Gedung)</option>
                </select>
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Pengaturan White-Labeling ini akan otomatis merubah seluruh istilah di UI aplikasi (RT/RW, Kompleks Cluster, atau Apartemen) tanpa merusak database sistem.
                  </p>
                </div>
              </div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mt-6">
                Informasi INSTANSI / {getTranslatedLabel("RT/RW", previewMode)} & Kop Surat
              </h4>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-2">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-wider">
                  Nama Organisasi / {getTranslatedLabel("RT/RW", previewMode)} (Muncul di Sidebar & Kop)
                </label>
                <input
                  name="nama_rt"
                  defaultValue={settings.nama_rt}
                  placeholder={`Contoh: PENGURUS ${getTranslatedLabel("RT", previewMode)} 04`}
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800 shadow-sm"
                />
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Nama ini akan menjadi identitas utama di sidebar menu and
                    kop surat dokumen {getTranslatedLabel("Warga", previewMode).toLowerCase()}.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 mb-2">
                <label className="text-[10px] font-black text-purple-600 uppercase mb-2 block tracking-wider">
                  Tagline Organisasi (Muncul di bawah Nama Organisasi)
                </label>
                <input
                  name="tagline"
                  defaultValue={settings.tagline || ""}
                  placeholder="Contoh: Guyub Rukun Saklawase"
                  className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all font-bold text-slate-800 shadow-sm"
                />
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Tagline ini akan muncul tepat di bawah nama instansi/organisasi dan di atas teks Powered by Nexapps di sidebar.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    {getTranslatedLabel("RT", previewMode)}
                  </label>
                  <input
                    name="rt"
                    defaultValue={settings.rt}
                    placeholder="04"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    {getTranslatedLabel("RW", previewMode)}
                  </label>
                  <input
                    name="rw"
                    defaultValue={settings.rw}
                    placeholder="09"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Kelurahan
                </label>
                <input
                  name="kelurahan"
                  defaultValue={settings.kelurahan}
                  placeholder="Kebalen"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Alamat Sekretariat
                </label>
                <textarea
                  name="alamat"
                  defaultValue={settings.alamat}
                  rows={2}
                  placeholder="Jl. Merdeka No. 123..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Logo Aplikasi (Sidebar)
                </label>
                <div className="flex gap-3 items-center">
                  <input type="hidden" name="tenant_system_logo" id="tenant_system_logo_input" defaultValue={currentTenant?.logo_url || ""} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(
                            file,
                            "system_logo",
                          );
                          const input = document.getElementById(
                            "tenant_system_logo_input",
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = url;
                            showNotification(
                              "Logo Sistem berhasil diupload. Simpan untuk menerapkan.",
                              "info",
                            );
                          }
                        } catch (err) {
                          showNotification("Gagal upload logo sistem", "error");
                        }
                      }
                    }}
                    className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  <input
                    name="tenant_system_logo"
                    id="tenant_system_logo_input"
                    type="hidden"
                    defaultValue={currentTenant?.logo_url}
                  />
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {currentTenant?.logo_url ? (
                      <img
                        src={currentTenant.logo_url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[8px] font-black text-slate-300">Logo</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                Koneksi Pihak Ketiga & Integrasi
              </h4>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Token WhatsApp (Gateway)
                </label>
                <input
                  name="TOKEN_WA"
                  type="password"
                  defaultValue={settings.TOKEN_WA}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Nominal Iuran Rutin Bulanan
                </label>
                <input
                  name="NOMINAL_IURAN"
                  type="number"
                  defaultValue={settings.NOMINAL_IURAN}
                  placeholder="50000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Template Pesan WhatsApp
                </label>
                <textarea
                  name="TEMPLATE_WA"
                  defaultValue={settings.TEMPLATE_WA}
                  rows={3}
                  placeholder="Halo {nama}, iuran bulan ini belum lunas..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all"
                />
              </div>
              <div className="p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 mb-2">
                <label className="text-[10px] font-black text-yellow-700 uppercase mb-2 block tracking-wider">
                  Akses Fitur Inventaris untuk Warga
                </label>
                <select
                  name="allow_warga_inventaris"
                  defaultValue={settings.allow_warga_inventaris || "false"}
                  className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 transition-all font-bold text-slate-800 shadow-sm"
                >
                  <option value="false">Tidak Diizinkan (Standard Bawaan)</option>
                  <option value="true">Diizinkan (Akses Terbuka untuk Seluruh Warga)</option>
                </select>
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-yellow-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Secara bawaan (default), warga tidak diperbolehkan mengakses fitur Inventaris demi keamanan aset wilayah, kecuali diaktifkan secara eksplisit oleh admin tenan di sini.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    !(
                      ["ADMIN", "SUPER_ADMIN", "OWNER", "SUPER ADMIN", "RW", "RT"].includes(userRole?.toUpperCase()) ||
                      currentUser?.isSuperAdmin
                    )
                  }
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Semua Pengaturan"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-red-50 p-6 rounded-xl border border-red-200">
        <h4 className="text-sm font-bold text-red-800 mb-2">
          Peringatan: Reset Data {getTranslatedLabel("Warga", settings?.themeMode)}
        </h4>
        <p className="text-xs text-red-600 mb-4">
          Fitur ini akan menghapus <strong>SELURUH</strong> data {getTranslatedLabel("Warga", settings?.themeMode).toLowerCase()} di
          sistem. Data yang sudah dihapus tidak bisa dikembalikan. Gunakan
          dengan sangat hati-hati.
        </p>
        <button
          onClick={async () => {
            if (
              confirm(
                "Apakah Anda yakin ingin menghapus SELURUH data warga? Tindakan ini tidak dapat dibatalkan!",
              )
            ) {
              try {
                // Delete batch
                const { collection, getDocs, writeBatch, doc, query, where } =
                  await import("firebase/firestore");
                const q = query(
                  collection(db, "data_warga"),
                  where("tenantId", "==", currentUser?.tenantId),
                );
                const wargaSnapshot = await getDocs(q);
                const batch = writeBatch(db);
                wargaSnapshot.forEach((docSnapshot) =>
                  batch.delete(docSnapshot.ref),
                );
                await batch.commit();
                showNotification(
                  "Seluruh data warga berhasil dihapus.",
                  "success",
                );
              } catch (e) {
                console.error(e);
                showNotification("Gagal menghapus data.", "error");
              }
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
        >
          Hapus Semua Data {getTranslatedLabel("Warga", settings?.themeMode)}
        </button>
      </div>

      {/* Database Schema Map Info */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col">
        <h3 className="text-sm font-bold mb-4 flex items-center text-blue-400">
          Struktur Sheet 'Pengaturan' di Google Tables
        </h3>
        <div className="font-mono text-[11px] space-y-2 text-slate-300 bg-slate-800 p-4 rounded border border-slate-700 overflow-x-auto">
          <p className="text-green-400 mb-2">
            // Buat Sheet baru dengan nama "Pengaturan". Isi Kolom A (Key) dan
            Kolom B (Value):
          </p>
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

      {/* Bagikan Aplikasi via QR Code */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">Bagikan SmaRtRw AI</h3>
          <p className="text-sm text-slate-500 mb-4">
            Anda dapat mengunduh dan mencetak QR Code ini. Warga tinggal melakukan scan QR Code ini menggunakan kamera ponsel untuk langsung mengakses aplikasi warga.
          </p>
          <ul className="text-xs text-slate-500 space-y-2 font-medium list-disc ml-5">
            <li>Tempelkan di Mading RW/RT</li>
            <li>Taruh di Meja Pos Satpam</li>
            <li>Tempelkan di pintu masuk Fasilitas Umum</li>
            <li>Bagikan sebagai gambar di Grup WhatsApp Warga</li>
          </ul>
        </div>
        <div className="w-full md:w-auto">
          <AppQRCode tenantId={tenantId} />
        </div>
      </div>

      {/* Tombol Generate Dummy Data (Hanya untuk Testing) */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col items-center text-center">
        <h3 className="text-sm font-bold text-orange-800 mb-2">
          Alat Uji Coba: Generate Data Dummy
        </h3>
        <p className="text-xs text-orange-600 mb-4 max-w-lg">
          Gunakan tombol ini untuk menghasilkan 120 data secara otomatis (20
          Warga, 5 KK, 50 Surat, 50 Transaksi) untuk menguji fitur aplikasi.
          Data akan ditambahkan ke database Anda yang aktif.
        </p>

        {generateMsg && (
          <p className="text-xs font-bold text-blue-700 mb-3 bg-white px-3 py-1 rounded shadow-sm">
            {generateMsg}
          </p>
        )}

        <button
          onClick={generateDummyData}
          disabled={
            isGenerating ||
            (wargaData?.length || 0) + 20 > getPlanFeatures(currentTenant).maxWarga
          }
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md disabled:bg-orange-300 flex items-center gap-2 disabled:cursor-not-allowed"
          title={
            (wargaData?.length || 0) + 20 > getPlanFeatures(currentTenant).maxWarga
              ? `Sisa slot paket tidak cukup (Butuh 20 slot)`
              : undefined
          }
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isGenerating ? "Memproses..." : "Generate 120 Data Dummy"}
        </button>
      </div>
    </div>
  );
}
