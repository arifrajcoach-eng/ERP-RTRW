import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { resolve } from 'path';

// Parse service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!serviceAccount.project_id) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function runCleanup() {
  const tenants = ["rw26_berjuang", "rt01_rw26_berjuang", "rt02_rw26_berjuang", "rt03_rw26_berjuang", "rt04_rw26_berjuang", "rt05_rw26_berjuang"];
  console.log("Fetching all data_warga for tenants:", tenants);
  
  const snapshot = await db.collection("data_warga").where("tenantId", "in", tenants).get();
  const docs = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
  
  console.log(`Found ${docs.length} total docs.`);
  const map = new Map();
  for (const doc of docs) {
      let nik = (doc.nik || '').toString().trim();
      const nama = (doc.nama || '').toString().trim().toLowerCase();
      
      if (!nik || nik === 'Belum Ada' || nik === '-' || nik === '0') {
         if (!nama || nama === '-') continue;
         nik = `NAMA:${nama}`;
      }
      
      if (!map.has(nik)) map.set(nik, []);
      map.get(nik).push(doc);
  }
  
  const toDelete = [];
  for (const [nik, items] of map.entries()) {
      if (items.length > 1) {
          items.sort((a,b) => {
              const aMatches = a.tenantId === "rw26_berjuang" ? 1 : 0;
              const bMatches = b.tenantId === "rw26_berjuang" ? 1 : 0;
              if (aMatches !== bMatches) return bMatches - aMatches;
              return Object.keys(b).length - Object.keys(a).length;
          });                
          toDelete.push(...items.slice(1));
      }
  }
  
  console.log(`Found ${toDelete.length} duplicates to delete.`);
  
  const CHUNK = 400;
  for (let i = 0; i < toDelete.length; i += CHUNK) {
    const chunk = toDelete.slice(i, i + CHUNK);
    const batch = db.batch();
    chunk.forEach(d => {
      batch.delete(db.collection("data_warga").doc(d.id));
    });
    await batch.commit();
    console.log(`Deleted chunk ${i/CHUNK + 1}`);
  }
  
  console.log("Done.");
}

runCleanup().catch(console.error);
