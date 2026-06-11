import { collection, getDocs, query, where, addDoc, getCountFromServer, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// 1. KEUANGAN
export async function getFinancialSummary(tenantId: string) {
  try {
    const q = query(
      collection(db, 'kas'), 
      where('tenantId', '==', tenantId),
      orderBy('tanggal', 'desc'),
      limit(200)
    );
    const querySnapshot = await getDocs(q);
    let totalMasuk = 0;
    let totalKeluar = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.tipe === 'Masuk' || data.type === 'masuk') totalMasuk += data.debit || data.amount || 0;
      if (data.tipe === 'Keluar' || data.type === 'keluar') totalKeluar += data.kredit || data.amount || 0;
    });
    return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar, note: "Computed from last 200 transactions" };
  } catch (e) {
    console.warn("Failed getFinancialSummary", e);
    return { totalMasuk: 0, totalKeluar: 0, saldo: 0, error: 'Permission Denied' };
  }
}

// 2. WARGA
export async function getWargaStats(tenantId: string) {
  try {
    const q = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
    const snapshot = await getCountFromServer(q);
    return { totalWarga: snapshot.data().count };
  } catch (e) {
    console.warn("Failed getWargaStats", e);
    return { totalWarga: 0, error: 'Permission Denied' };
  }
}

// 3. KESEHATAN (POSYANDU & SAKIT)
export async function getHealthSummary(tenantId: string) {
  const collections = ['balita', 'ibu_hamil', 'lansia', 'warga_sakit'];
  const results: Record<string, any> = {};
  
  for (const col of collections) {
    try {
      const q = query(collection(db, col), where('tenantId', '==', tenantId));
      if (col === 'warga_sakit' || col === 'lansia') {
        const snap = await getDocs(query(q, limit(100)));
        results[col] = snap.size;
        const detail: any[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          detail.push({ nama: d.namaWarga || d.nama || 'Warga', info: d.keterangan || d.penyakit || d.kondisi || '-' });
        });
        results[`${col}_detail`] = detail;
      } else {
        const countSnap = await getCountFromServer(q);
        results[col] = countSnap.data().count;
      }
    } catch (e) {
      console.warn(`Failed getHealthSummary for ${col}`, e);
      results[col] = 0;
    }
  }
  return results;
}

// 4. BANK SAMPAH
export async function getWasteBankSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'sampah_setoran'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(query(q, limit(100)));
    let totalBerat = 0;
    snapshot.forEach(doc => {
      totalBerat += (doc.data().berat || 0);
    });
    return { totalTrx: snapshot.size, totalBerat, note: "Computed from last 100 entries" };
  } catch (e) {
    return { totalTrx: 0, totalBerat: 0 };
  }
}

// 5. BUKU TAMU
export async function getGuestBookSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'buku_tamu'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(query(q, limit(100)));
    let inCount = 0;
    let stayCount = 0;
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.status === 'Masuk' || d.status === 'masuk') inCount++;
      if (d.menginap === true || d.keperluan?.toLowerCase().includes('inap')) stayCount++;
    });
    return { totalTamu: snapshot.size, tamuAktif: inCount, menginap: stayCount, note: "Recent 100 guests" };
  } catch (e) {
    return { totalTamu: 0, tamuAktif: 0, menginap: 0 };
  }
}

// 6. SURAT & PENGAJUAN
export async function getLettersSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'surat'), where('tenantId', '==', tenantId));
    const countSnapshot = await getCountFromServer(q);
    const snapshot = await getDocs(query(q, limit(50)));
    let approved = 0;
    let rejected = 0;
    let pending = 0;
    const pendingLetters: any[] = [];
    snapshot.forEach(doc => {
      const s = doc.data();
      const status = s.status?.toLowerCase();
      if (status === 'approved' || status === 'disetujui') approved++;
      else if (status === 'rejected' || status === 'ditolak') rejected++;
      else {
        pending++;
        pendingLetters.push({ id: doc.id, pemohon: s.pemohon, jenis: s.jenisSurat });
      }
    });
    return { total: countSnapshot.data().count, approved, rejected, pending, pendingLetters };
  } catch (e) {
    return { total: 0, approved: 0, rejected: 0, pending: 0, pendingLetters: [] };
  }
}

// NEW: WARGA REGISTRATIONS
export async function getRegistrationInfo(tenantId: string) {
  try {
    const q = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId), where('status', '==', 'PENDING'));
    const snapshot = await getDocs(q);
    const registrations: any[] = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      registrations.push({ id: doc.id, nama: d.nama, nik: d.nik });
    });
    return { totalPendingRegistration: snapshot.size, registrations };
  } catch (e) {
    return { totalPendingRegistration: 0, registrations: [] };
  }
}

// 7. E-LAPAK
export async function getELapakSummary(tenantId: string) {
  try {
    // App.tsx uses toko_products
    const q = query(collection(db, 'toko_products'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    return { totalProduk: snapshot.size };
  } catch (e) {
    return { totalProduk: 0 };
  }
}

// 8. PEMILU
export async function getElectionSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'voting_candidates'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    return { adaElections: snapshot.size > 0, totalKandidat: snapshot.size };
  } catch (e) {
    return { adaElections: false, totalKandidat: 0 };
  }
}

// 9. INVENTARIS
export async function getInventorySummary(tenantId: string) {
  try {
    const q = query(collection(db, 'inventaris'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    return { totalBarang: snapshot.size };
  } catch (e) {
    return { totalBarang: 0 };
  }
}// 10. ANALISIS AKTIVITAS WARGA & PERUBAHAN DATA
export async function getWargaActivitySummary(tenantId: string) {
  try {
    // Iuran check
    const qIuran = query(collection(db, 'iuran'), where('tenantId', '==', tenantId), limit(5000));
    const snapIuran = await getDocs(qIuran);
    const paidUserIds = new Set<string>();
    snapIuran.forEach(doc => {
      const d = doc.data();
      if (d.status === 'Lunas') paidUserIds.add(d.userId || d.nik || doc.id);
    });
    
    // Warga check
    const qWarga = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId), limit(5000));
    const snapWarga = await getDocs(qWarga);
    
    const wargaDetail: any[] = [];
    let wargaSakit = 0;
    let wargaMeninggal = 0;
    let totalKK = 0;
    let kkSudahBayar = 0;

    snapWarga.forEach(doc => {
      const d = doc.data();
      const isLunas = paidUserIds.has(doc.id) || paidUserIds.has(d.userId) || paidUserIds.has(d.nik);
      
      if (d.kondisi?.toLowerCase() === 'sakit') wargaSakit++;
      if (d.kondisi?.toLowerCase() === 'meninggal') wargaMeninggal++;
      
      if (d.hubunganKeluarga === 'KEPALA KELUARGA') {
        totalKK++;
        if (isLunas) kkSudahBayar++;
      }

      wargaDetail.push({ 
        nama: d.nama || 'Warga', 
        sudahBayar: isLunas,
        status: d.status || 'Tetap',
        isKK: d.hubunganKeluarga === 'KEPALA KELUARGA'
      });
    });
    
    return {
      totalWarga: snapWarga.size,
      totalKK,
      kkSudahBayar,
      kkBelumBayar: Math.max(0, totalKK - kkSudahBayar),
      wargaSudahBayar: paidUserIds.size, // Keep for backward compat or extra info
      wargaBelumBayar: Math.max(0, snapWarga.size - paidUserIds.size),
      wargaSakit,
      wargaMeninggal,
      wargaDetailSummary: wargaDetail.slice(0, 30),
      note: "Summary based on top 500 records. Payment stats focused on KK (Kepala Keluarga)."
    };
  } catch(e) {
    console.warn("Failed getWargaActivitySummary", e);
    return { totalWarga: 0, wargaSudahBayar: 0, wargaBelumBayar: 0, wargaSakit: 0, wargaMeninggal: 0 };
  }
}

// 11. ACTIONS (FOR AI TOOL CALLING)
export async function createSurat(data: { 
  tenantId: string, 
  pemohon: string, 
  nik: string, 
  noKK: string, 
  kk?: string,
  keperluan: string, 
  jenisSurat?: string, 
  jenis?: string,
  nomorHp?: string,
  userId?: string | null,
  authUid?: string | null,
  rt?: string,
  rw?: string
}) {
  try {
    if (!data.tenantId) {
      throw new Error("Missing tenantId. Operation rejected to protect tenant integrity.");
    }
    const finalRt = data.rt || '01';
    const finalRw = data.rw || '26';
    const docRef = await addDoc(collection(db, 'surat'), {
      ...data,
      rt: finalRt,
      rw: finalRw,
      jenis: data.jenisSurat || 'Pengantar',
      jenisSurat: data.jenisSurat || 'Pengantar',
      keperluan: data.keperluan,
      keterangan: data.keperluan,
      status: 'Menunggu Persetujuan RT',
      tanggal: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      nomorSurat: `${Math.floor(Math.random() * 999).toString().padStart(3, '0')}/RT.${finalRt}/RW.${finalRw}/${new Date().getFullYear()}`
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Failed createSurat", e);
    return { success: false, error: 'Gagal membuat surat: Tenant ID tidak valid.' };
  }
}

export async function registerELapak(data: { tenantId: string, userId: string, namaToko: string, kategori: string }) {
  try {
    if (!data.tenantId) {
      throw new Error("Missing tenantId. Operation rejected to protect tenant integrity.");
    }
    const docRef = await addDoc(collection(db, 'toko_products'), {
        ...data,
        status: 'PENDING',
        createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Failed registerELapak", e);
    return { success: false, error: 'Gagal mendaftar e-lapak: Tenant ID tidak valid.' };
  }
}

// 12. KELUHAN & BOOKING
export async function reportComplaint(data: { tenantId: string, userId: string, namaWarga: string, jenisKeluhan: string, deskripsi: string }) {
  try {
    if (!data.tenantId) {
      throw new Error("Missing tenantId. Operation rejected to protect tenant integrity.");
    }
    const docRef = await addDoc(collection(db, 'complaints'), {
      ...data,
      status: 'PENDING',
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Failed reportComplaint", e);
    return { success: false, error: 'Gagal mengirim keluhan: Tenant ID tidak valid.' };
  }
}

export async function bookFacility(data: { tenantId: string, userId: string, namaWarga: string, namaFasilitas: string, tanggal: string, keperluan: string }) {
  try {
    if (!data.tenantId) {
      throw new Error("Missing tenantId. Operation rejected to protect tenant integrity.");
    }
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...data,
      status: 'PENDING',
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Failed bookFacility", e);
    return { success: false, error: 'Gagal melakukan booking: Tenant ID tidak valid.' };
  }
}

export async function reportKelahiran(data: { tenantId: string, namaBayi: string, tempatLahir: string, tanggalLahir: string, jenisKelamin: string, namaAyah: string, namaIbu: string, alamat?: string, rt?: string, rw?: string }) {
  try {
    if (!data.tenantId) {
      throw new Error("Missing tenantId. Operation rejected to protect tenant integrity.");
    }
    const docRef = await addDoc(collection(db, 'kelahiran'), {
      ...data,
      tanggalLapor: new Date(),
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Failed reportKelahiran", e);
    return { success: false, error: 'Gagal melaporkan kelahiran: Tenant ID tidak valid.' };
  }
}

export async function reportKematian(data: { tenantId: string, namaWarga: string, nikWarga: string, tanggalMati: string, tempatMati: string, penyebab?: string }) {
  try {
    if (!data.tenantId) {
      throw new Error("Missing tenantId. Operation rejected to protect tenant integrity.");
    }
    const docRef = await addDoc(collection(db, 'kematian'), {
      ...data,
      tanggalLapor: new Date(),
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Failed reportKematian", e);
    return { success: false, error: 'Gagal melaporkan kematian: Tenant ID tidak valid.' };
  }
}

// 6. MONITORING & ALERT (Anomaly Detection)
export async function detectAnomalies(tenantId: string) {
  try {
    const qKas = query(
      collection(db, 'kas'), 
      where('tenantId', '==', tenantId),
      orderBy('tanggal', 'desc'),
      limit(100)
    );
    const snapKas = await getDocs(qKas);
    const anomalies: string[] = [];
    
    snapKas.forEach(doc => {
      const data = doc.data();
      // Rule: Deteksi transaksi masuk/keluar > 5jt sebagai anomali
      if (data.amount > 5000000) {
        anomalies.push(`Transaksi mencurigakan: ID ${doc.id} sebesar ${data.amount}`);
      }
    });

    return {
      isSafe: anomalies.length === 0,
      anomalies: anomalies,
      note: "Checked recent 100 transactions"
    };
  } catch(e) {
    console.warn("Failed detectAnomalies", e);
    return { isSafe: false, anomalies: [], error: 'Permission Denied' };
  }
}

// 7. DEBUG TOOLS
export async function debugInspectData(collectionName: string, limitCount: number = 5) {
  const q = query(collection(db, collectionName));
  const snapshot = await getDocs(q);
  const data: any[] = [];
  snapshot.docs.slice(0, limitCount).forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  console.log(`[DEBUG] Inspected ${collectionName}:`, data);
  return data;
}
