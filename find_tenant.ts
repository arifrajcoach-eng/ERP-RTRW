import { db } from './src/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

async function main() {
  console.log("Searching other collections for any traces of 'rw_berjuang' or 'RW_BERJUANG' (excluding rw26_berjuang)...");
  
  const collectionsToCheck = [
    'users', 'data_warga', 'verifikasi_warga', 'kas', 'surat', 'iuran', 
    'inventaris', 'balita', 'ibu_hamil', 'posyandu_kegiatan', 'pemeriksaan_balita', 
    'imunisasi', 'sampah_kategori', 'sampah_setoran', 'sampah_tarik_saldo', 'emergencies', 
    'notifications', 'usage_logs', 'chat_messages', 'ai_usage_logs', 'ai_cache', 
    'monthly_reports', 'lansia', 'warga_sakit', 'subscriptions', 'complaints', 'branding', 'templates'
  ];

  for (const colName of collectionsToCheck) {
    try {
      const colRef = collection(db, colName);
      // We search for exact match of tenantId in lowercase and uppercase
      for (const tId of ['rw_berjuang', 'RW_BERJUANG']) {
        const q = query(colRef, where('tenantId', '==', tId), limit(5));
        const snap = await getDocs(q);
        if (snap.size > 0) {
          console.log(`Found ${snap.size} occurrences of tenantId='${tId}' in collection '${colName}'`);
        }
      }
    } catch (e: any) {
      // Some collections might not exist or have different indexes, let's ignore warnings
    }
  }

  // Also check if any users exist with tenantId matches
  console.log("\nSearching for users belonging to either rw_berjuang or RW_BERJUANG...");
  try {
    const q = query(collection(db, 'users'), where('tenantId', 'in', ['rw_berjuang', 'RW_BERJUANG']));
    const snap = await getDocs(q);
    console.log(`Found ${snap.size} users matching.`);
    snap.forEach(d => {
      console.log(`- User: ${d.id}, data:`, d.data());
    });
  } catch (e: any) {
    console.error("Error searching users:", e.message);
  }
}

main().then(() => {
  console.log("\nSearch finished.");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
