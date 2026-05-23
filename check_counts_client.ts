
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkCounts() {
  const tenants = [
    "rw26_berjuang",
    "rt01_rw26_berjuang",
    "rt02_rw26_berjuang",
    "rt03_rw26_berjuang",
    "rt04_rw26_berjuang",
    "rt05_rw26_berjuang"
  ];

  console.log("Checking counts via client SDK...");
  
  for (const tenantId of tenants) {
    try {
      const q = query(collection(db, 'data_warga'), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      console.log(`Tenant: ${tenantId} -> Count: ${snapshot.size}`);
    } catch (error: any) {
      console.error(`Error for ${tenantId}:`, error.message);
    }
  }
}

checkCounts();
