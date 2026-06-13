
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function checkCounts() {
  const tenants = [
    "rw26_berjuang",
    "rt01_rw26_berjuang",
    "rt02_rw26_berjuang",
    "rt03_rw26_berjuang",
    "rt04_rw26_berjuang"
  ];

  console.log("Checking citizen counts for tenants (Default DB)...");
  
  for (const tId of tenants) {
    try {
      const snapshot = await db.collection("data_warga")
        .where("tenantId", "==", tId)
        .get();
      
      console.log(`${tId}: ${snapshot.size}`);
    } catch (e) {
      console.log(`${tId}: Error - ${e.message}`);
    }
  }
}

checkCounts().catch(console.error);
