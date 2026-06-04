export const INITIAL_WARGA_DATA = [
  {
    id: "ID-1001",
    nama: "Bpk. Bambang",
    rt: "01",
    rw: "26",
    role: "Admin RT",
    email: "bambang@rw26.com",
    status: "Aktif",
    nik: "3275000000000001",
  },
  {
    id: "ID-1002",
    nama: "Ibu Siti",
    rt: "01",
    rw: "26",
    role: "Warga",
    email: "siti@rw26.com",
    status: "Aktif",
    nik: "3275000000000002",
  },
  {
    id: "ID-1003",
    nama: "Bpk. Ahmad",
    rt: "02",
    rw: "26",
    role: "Admin RT",
    email: "ahmad@rw26.com",
    status: "Aktif",
    nik: "3275000000000003",
  },
];

export const INITIAL_KAS_DATA = [
  {
    id: "TRX-001",
    tanggal: "01 Apr 2026",
    tipe: "Masuk",
    transaksi: "Iuran Warga",
    nama: "Bpk. Bambang",
    keterangan: "Iuran Kebersihan Apr",
    debit: 50000,
    kredit: 0,
  },
  {
    id: "TRX-002",
    tanggal: "02 Apr 2026",
    tipe: "Keluar",
    transaksi: "Listrik Pos",
    nama: "PLN",
    keterangan: "Tagihan Apr",
    debit: 0,
    kredit: 200000,
  },
];

export const INITIAL_SURAT_DATA = [
  {
    id: "SRT-1004",
    tanggal: "19 Apr 2026",
    pemohon: "Ibu Siti Aminah",
    jenis: "Surat Domisili",
    jenisSurat: "Surat Domisili",
    status: "Menunggu Persetujuan RT",
    tenantId: "rw26_berjuang",
  },
  {
    id: "SRT-1003",
    tanggal: "17 Apr 2026",
    pemohon: "Bpk. Ahmad Suhendar",
    jenis: "Pengantar Kelurahan",
    jenisSurat: "Pengantar Kelurahan",
    status: "Selesai",
    tenantId: "rw26_berjuang",
  },
];

export const INITIAL_INVENTARIS_DATA = [
  {
    id: "INV-BRG-001",
    nama_barang: "Kursi Lipat Merek Chitose",
    kategori: "Aset Tenda & Kursi",
    jumlah: 50,
    kondisi: "Baik",
    lokasi: "Gudang RT 01",
    tanggal_pengadaan: "2024-01-10",
    keterangan: "Pengadaan Mandiri",
  },
];
