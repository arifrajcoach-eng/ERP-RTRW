import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);

async function check() {
  console.log("=== DIAGNOSING SOS ISSUES ===");
  
  // 1. Check all users or citizens in 'rt03_rw26_berjuang'
  console.log("\n--- Users / warga in rt03_rw26_berjuang ---");
  const usersSnap = await db.collection("users")
    .where("tenantId", "==", "rt03_rw26_berjuang")
    .get();
  console.log(`Found ${usersSnap.size} user documents for rt03_rw26_berjuang.`);
  usersSnap.forEach(d => {
    const data = d.data();
    console.log(`User ID: ${d.id}, Nama: ${data.nama || data.name}, Role: ${data.role}, RT: ${data.rt}, RW: ${data.rw}, tenantId: ${data.tenantId}`);
  });

  // 2. Check in data_warga for citizens
  console.log("\n--- warga in rt03_rw26_berjuang inside 'data_warga' ---");
  const wargaSnap = await db.collection("data_warga")
    .where("tenantId", "==", "rt03_rw26_berjuang")
    .get();
  console.log(`Found ${wargaSnap.size} warga documents.`);
  wargaSnap.forEach(d => {
    const data = d.data();
    console.log(`Warga NIK: ${d.id}, Nama: ${data.nama}, RT: ${data.rt}, RW: ${data.rw}, tenantId: ${data.tenantId}`);
  });

  // 3. Check for latest emergencies in "emergencies"
  console.log("\n--- Latest Emergencies in emergencies collection ---");
  const emergSnap = await db.collection("emergencies").orderBy("timestamp", "desc").limit(10).get();
  if (emergSnap.empty) {
    console.log("No emergencies found.");
  } else {
    emergSnap.forEach(d => {
      const data = d.data();
      console.log(`Emergency ID: ${d.id}, User: ${data.userName}, tenantId: ${data.tenantId}, status: ${data.status}, rt: ${data.rt}, rw: ${data.rw}, timestamp: ${data.timestamp}`);
    });
  }

  // 4. Test retrieving active tenants list
  console.log("\n--- Tenant Info for rt03_rw26_berjuang and parent ---");
  const tDoc = await db.collection("tenants").doc("rt03_rw26_berjuang").get();
  if (tDoc.exists) {
    console.log("rt03_rw26_berjuang tenant:", tDoc.data());
  } else {
    console.log("rt03_rw26_berjuang tenant does not exist in tenants collection!");
  }
}

check().catch(console.error);
