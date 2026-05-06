import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// 1. KEUANGAN
export async function getFinancialSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'kas'), where('tenantId', '==', tenantId));
    const querySnapshot = await getDocs(q);
    let totalMasuk = 0;
    let totalKeluar = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.tipe === 'Masuk' || data.type === 'masuk') totalMasuk += data.debit || data.amount || 0;
      if (data.tipe === 'Keluar' || data.type === 'keluar') totalKeluar += data.kredit || data.amount || 0;
    });
    return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar };
  } catch (e) {
    console.warn("Failed getFinancialSummary", e);
    return { totalMasuk: 0, totalKeluar: 0, saldo: 0, error: 'Permission Denied' };
  }
}

// 2. WARGA
export async function getWargaStats(tenantId: string) {
  try {
    const q = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    return { totalWarga: snapshot.size };
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
      const snapshot = await getDocs(q);
      results[col] = snapshot.size;
      
      if (col === 'warga_sakit' || col === 'lansia') {
        const detail: any[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          detail.push({ nama: d.namaWarga || d.nama || 'Warga', info: d.keterangan || d.penyakit || d.kondisi || '-' });
        });
        results[`${col}_detail`] = detail;
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
    const snapshot = await getDocs(q);
    let totalBerat = 0;
    snapshot.forEach(doc => {
      totalBerat += (doc.data().berat || 0);
    });
    return { totalTrx: snapshot.size, totalBerat };
  } catch (e) {
    return { totalTrx: 0, totalBerat: 0 };
  }
}

// 5. BUKU TAMU
export async function getGuestBookSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'buku_tamu'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    let inCount = 0;
    let stayCount = 0;
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.status === 'Masuk' || d.status === 'masuk') inCount++;
      if (d.menginap === true || d.keperluan?.toLowerCase().includes('inap')) stayCount++;
    });
    return { totalTamu: snapshot.size, tamuAktif: inCount, menginap: stayCount };
  } catch (e) {
    return { totalTamu: 0, tamuAktif: 0, menginap: 0 };
  }
}

// 6. SURAT & PENGAJUAN
export async function getLettersSummary(tenantId: string) {
  try {
    const q = query(collection(db, 'surat'), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    let approved = 0;
    let rejected = 0;
    let pending = 0;
    snapshot.forEach(doc => {
      const s = doc.data().status?.toLowerCase();
      if (s === 'approved' || s === 'disetujui') approved++;
      else if (s === 'rejected' || s === 'ditolak') rejected++;
      else pending++;
    });
    return { total: snapshot.size, approved, rejected, pending };
  } catch (e) {
    return { total: 0, approved: 0, rejected: 0, pending: 0 };
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
}

// 10. ANALISIS AKTIVITAS WARGA & PERUBAHAN DATA
export async function getWargaActivitySummary(tenantId: string) {
  try {
    // Iuran check
    const qIuran = query(collection(db, 'iuran'), where('tenantId', '==', tenantId));
    const snapIuran = await getDocs(qIuran);
    const paidUserIds = new Set<string>();
    snapIuran.forEach(doc => {
      const d = doc.data();
      if (d.status === 'Lunas') paidUserIds.add(d.userId || d.nik || doc.id);
    });
    
    // Warga check
    const qWarga = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
    const snapWarga = await getDocs(qWarga);
    
    const wargaDetail: any[] = [];
    let wargaSakit = 0;
    let wargaMeninggal = 0;

    snapWarga.forEach(doc => {
      const d = doc.data();
      if (d.kondisi?.toLowerCase() === 'sakit') wargaSakit++;
      if (d.kondisi?.toLowerCase() === 'meninggal') wargaMeninggal++;
      wargaDetail.push({ 
        nama: d.nama || 'Warga', 
        sudahBayar: paidUserIds.has(doc.id) || paidUserIds.has(d.userId) || paidUserIds.has(d.nik),
        status: d.status || 'Tetap'
      });
    });
    
    return {
      totalWarga: snapWarga.size,
      wargaSudahBayar: paidUserIds.size,
      wargaBelumBayar: Math.max(0, snapWarga.size - paidUserIds.size),
      wargaSakit,
      wargaMeninggal,
      wargaDetailSummary: wargaDetail.slice(0, 30) // More context
    };
  } catch(e) {
    console.warn("Failed getWargaActivitySummary", e);
    return { totalWarga: 0, wargaSudahBayar: 0, wargaBelumBayar: 0, wargaSakit: 0, wargaMeninggal: 0 };
  }
}

// 6. MONITORING & ALERT (Anomaly Detection)
export async function detectAnomalies(tenantId: string) {
  try {
    const qKas = query(collection(db, 'kas'), where('tenantId', '==', tenantId));
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
      anomalies: anomalies
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
