/**
 * Dynamic White-Labeling Utility for SmartRW AI.
 * Translate terms based on the current tenant's active themeMode:
 * - 'rt_rw': Lingkungan Rukun Tetangga (RT) / Rukun Warga (RW)
 * - 'cluster': Cluster / Perumahan Mandiri (Blok / Cluster)
 * - 'apartemen': Apartemen / Kondominium (Unit / Lantai / Gedung)
 */

export function getTranslatedLabel(key: string, themeMode?: string): string {
  const mode = themeMode || "rt_rw";

  const dict: Record<string, Record<string, string>> = {
    rt_rw: {
      "RT": "RT",
      "RW": "RW",
      "RT/RW": "RT/RW",
      "RT atau RW": "RT atau RW",
      "Rukun Tetangga": "Rukun Tetangga",
      "Rukun Warga": "Rukun Warga",
      "Warga": "Warga",
      "Data Warga": "Data Warga",
      "Daftar Warga": "Daftar Warga",
      "Penghuni": "Warga",
      "Kas": "Kas",
      "Kas Warga": "Kas Warga",
      "Keuangan": "Keuangan",
      "Iuran": "Iuran",
      "Iuran Kas": "Iuran Kas",
      "Iuran Bulanan": "Iuran Bulanan",
      "Surat": "Surat Pengantar",
      "Surat Pengantar": "Surat Pengantar",
      "Arsip Surat": "Arsip Surat",
      "Permohonan Surat": "Permohonan Surat",
      "Layanan Administrasi": "Layanan Administrasi",
      "Verifikasi Warga": "Verifikasi Warga",
      "ADMIN RT": "ADMIN RT",
      "ADMIN RW": "ADMIN RW",
      "KETUA RT": "KETUA RT",
      "KETUA RW": "KETUA RW",
    },
    cluster: {
      "RT": "Blok",
      "RW": "Cluster",
      "RT/RW": "Blok/Cluster",
      "RT atau RW": "Blok atau Cluster",
      "Rukun Tetangga": "Blok Hunian",
      "Rukun Warga": "Cluster Perumahan",
      "Warga": "Warga",
      "Data Warga": "Data Warga Cluster",
      "Daftar Warga": "Daftar Warga/Penghuni",
      "Penghuni": "Warga",
      "Kas": "Kas Cluster",
      "Kas Warga": "Kas Cluster",
      "Keuangan": "Kas & Keuangan",
      "Iuran": "Iuran Cluster",
      "Iuran Kas": "Iuran Maintenance/Cluster",
      "Iuran Bulanan": "Iuran Blok/Cluster",
      "Surat": "Izin & Dokumen",
      "Surat Pengantar": "Surat Jalan / Dokumen",
      "Arsip Surat": "Arsip Izin/Dokumen",
      "Permohonan Surat": "Pengajuan Izin/Akses",
      "Layanan Administrasi": "Persetujuan Akses & Izin",
      "Verifikasi Warga": "Verifikasi Warga Baru",
      "ADMIN RT": "ADMIN BLOK",
      "ADMIN RW": "ADMIN CLUSTER",
      "KETUA RT": "KETUA BLOK",
      "KETUA RW": "KETUA CLUSTER",
    },
    apartemen: {
      "RT": "Unit",
      "RW": "Lantai/Gedung",
      "RT/RW": "Unit/Gedung",
      "RT atau RW": "Unit atau Tower/Gedung",
      "Rukun Tetangga": "Nomor Unit",
      "Rukun Warga": "Tower/Lantai Gedung",
      "Warga": "Penghuni",
      "Data Warga": "Data Penghuni",
      "Daftar Warga": "Daftar Penghuni Unit",
      "Penghuni": "Penghuni",
      "Kas": "IPL",
      "Kas Warga": "IPL Gedung",
      "Keuangan": "IPL & Finance",
      "Iuran": "Iuran IPL",
      "Iuran Kas": "IPL / Maintenance Fee",
      "Iuran Bulanan": "Service Charge / Memelihara",
      "Surat": "Izin/Akses Gedung",
      "Surat Pengantar": "Form Izin Masuk/Akses",
      "Arsip Surat": "Arsip Izin/Akses",
      "Permohonan Surat": "Pengisian Form Izin",
      "Layanan Administrasi": "Lobby & Resepsionis",
      "Verifikasi Warga": "Verifikasi Penghuni Unit",
      "ADMIN RT": "ADMIN UNIT",
      "ADMIN RW": "ADMIN TOWER",
      "KETUA RT": "KEPALA FLOORS",
      "KETUA RW": "PENGELOLA TOWER",
    }
  };

  return dict[mode]?.[key] || key;
}
