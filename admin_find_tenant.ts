import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

// We initialize firestore with our target databaseId
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function checkTenants() {
  console.log("=== ADMin TENANT SCANNER ===");
  
  // 1. Check direct documents in 'tenants'
  const tenantsColl = db.collection("tenants");
  const tenantsSnap = await tenantsColl.get();
  
  console.log(`\nAll tenants in 'tenants' collection (Total: ${tenantsSnap.size}):`);
  tenantsSnap.forEach(doc => {
    console.log(`- Document ID: [${doc.id}], Name: "${doc.data().name || doc.data().nama}", Email: "${doc.data().adminEmail}"`);
  });

  // 2. Search other core collections for references to 'rw_berjuang' (without 26) vs 'rw26_berjuang'
  const targetIds = ['rw_berjuang', 'RW_BERJUANG', 'rw26_berjuang', 'rt01_rw26_berjuang', 'rt02_rw26_berjuang', 'rt03_rw26_berjuang', 'rt04_rw26_berjuang'];
  
  const collectionsToCheck = [
    'users', 'data_warga', 'verifikasi_warga', 'kas', 'surat', 'iuran', 
    'inventaris', 'balita', 'ibu_hamil', 'posyandu_kegiatan', 'pemeriksaan_balita', 
    'imunisasi', 'sampah_kategori', 'sampah_setoran', 'sampah_tarik_saldo', 'emergencies', 
    'notifications', 'usage_logs', 'chat_messages', 'ai_usage_logs', 'ai_cache', 
    'monthly_reports', 'lansia', 'warga_sakit', 'subscriptions', 'complaints', 'branding', 'templates'
  ];

  console.log("\nSearching collections for references to target tenant IDs...");
  for (const colName of collectionsToCheck) {
    try {
      const colRef = db.collection(colName);
      for (const tId of targetIds) {
        const snap = await colRef.where('tenantId', '==', tId).get();
        if (snap.size > 0) {
          console.log(`- Collection [${colName}]: Found ${snap.size} documents where tenantId == '${tId}'`);
        }
      }
    } catch (e: any) {
      console.log(`- Connection [${colName}] error:`, e.message);
    }
  }
}

checkTenants().catch(console.error);
