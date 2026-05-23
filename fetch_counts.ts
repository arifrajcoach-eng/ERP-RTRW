
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function checkCounts() {
  const tenants = [
    "rw26_berjuang",
    "rt01_rw26_berjuang",
    "rt02_rw26_berjuang",
    "rt03_rw26_berjuang",
    "rt04_rw26_berjuang"
  ];

  console.log("Checking citizen counts for tenants...");
  
  for (const tId of tenants) {
    const snapshot = await db.collection("data_warga")
      .where("tenantId", "==", tId)
      .get();
    
    console.log(`${tId}: ${snapshot.size}`);
  }
  
  // Also check total cluster (anything including berjuang)
  const totalBerjuang = await db.collection("data_warga")
    .where("tenantId", ">=", "rt01_rw26_berjuang")
    .where("tenantId", "<=", "rt99_rw26_berjuang")
    .get();
    
  console.log(`Sub-cluster total (RT01-RT99): ${totalBerjuang.size}`);
  
  const parentBerjuang = await db.collection("data_warga")
    .where("tenantId", "==", "rw26_berjuang")
    .get();
    
  console.log(`Parent (rw26_berjuang): ${parentBerjuang.size}`);
}

checkCounts().catch(console.error);
