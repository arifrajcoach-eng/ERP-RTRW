import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// 1. KEUANGAN
export async function getFinancialSummary(tenantId: string) {
  const q = query(collection(db, 'kas'), where('tenantId', '==', tenantId));
  const querySnapshot = await getDocs(q);
  let totalMasuk = 0;
  let totalKeluar = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.type === 'masuk') totalMasuk += data.amount || 0;
    if (data.type === 'keluar') totalKeluar += data.amount || 0;
  });
  return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar };
}

// 2. WARGA
export async function getWargaStats(tenantId: string) {
  const q = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
  const snapshot = await getDocs(q);
  return { totalWarga: snapshot.size };
}

// 3. KESEHATAN (POSYANDU)
export async function getHealthSummary(tenantId: string) {
  const collections = ['posyandu_balita', 'ibu_hamil', 'pemeriksaan_balita'];
  const results: Record<string, number> = {};
  
  for (const col of collections) {
    const q = query(collection(db, col), where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);
    results[col] = snapshot.size;
  }
  return results;
}

// 4. PPOB
export async function getPPOBSummary(tenantId: string) {
  const q = query(collection(db, 'ppob_trx'), where('tenantId', '==', tenantId));
  const snapshot = await getDocs(q);
  let totalTrx = 0;
  let totalVolume = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    totalTrx++;
    totalVolume += (data.amount || 0); // Asumsi field amount
  });
  
  return { totalTrx, totalVolume };
}

// 5. ANALISIS AKTIVITAS WARGA
export async function getWargaActivitySummary(tenantId: string) {
  // Simplifikasi: Hitung warga yang melakukan transaksi (iuran)
  const qIuran = query(collection(db, 'iuran'), where('tenantId', '==', tenantId));
  const snapIuran = await getDocs(qIuran);
  const activeUserSet = new Set<string>();
  snapIuran.forEach(doc => activeUserSet.add(doc.data().userId));
  
  const qWarga = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
  const snapWarga = await getDocs(qWarga);
  
  return {
    totalWarga: snapWarga.size,
    wargaAktif: activeUserSet.size,
    wargaPasif: snapWarga.size - activeUserSet.size
  };
}

// 6. MONITORING & ALERT (Anomaly Detection)
export async function detectAnomalies(tenantId: string) {
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
