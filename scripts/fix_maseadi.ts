import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "../firebase-applet-config.json";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function fixMaseadi() {
  console.log("=== FIXING DATA FOR maseadi@gmail.com ===");

  // 1. Update 'users' collection documents
  const usersColl = db.collection("users");
  const usersSnap = await usersColl.where("email", "==", "maseadi@gmail.com").get();

  console.log(`\nFound ${usersSnap.size} user documents for maseadi@gmail.com.`);
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    console.log(`Processing user document [${doc.id}]:`, data);

    const updateData: any = {};
    let needsUpdate = false;

    // Fix role array
    if (Array.isArray(data.role)) {
      // If it contains 'sekertaris' or 'sekretaris', set as sekertaris, otherwise warga
      const hasSekertaris = data.role.some((r: string) => r.toLowerCase().includes("sek"));
      updateData.role = hasSekertaris ? "sekertaris" : "warga";
      needsUpdate = true;
      console.log(`- Converting role array ${JSON.stringify(data.role)} to string: "${updateData.role}"`);
    }

    // Fix tenantId array
    if (Array.isArray(data.tenantId)) {
      // Use the first tenant ID or a string
      updateData.tenantId = data.tenantId[0] || "rt01_rw26_berjuang";
      needsUpdate = true;
      console.log(`- Converting tenantId array ${JSON.stringify(data.tenantId)} to string: "${updateData.tenantId}"`);
    }

    if (needsUpdate) {
      await doc.ref.update(updateData);
      console.log(`- Document [${doc.id}] updated successfully!`);
    } else {
      console.log(`- Document [${doc.id}] does not need array fixes.`);
    }
  }

  // 2. Set email in 'data_warga' documents matching NIK "3216022802830005"
  const wargaColl = db.collection("data_warga");
  const wargaSnap = await wargaColl.where("nik", "==", "3216022802830005").get();

  console.log(`\nFound ${wargaSnap.size} data_warga documents for NIK 3216022802830005.`);
  for (const doc of wargaSnap.docs) {
    const data = doc.data();
    console.log(`Updating data_warga document [${doc.id}]...`);
    await doc.ref.update({
      email: "maseadi@gmail.com"
    });
    console.log(`- data_warga [${doc.id}] updated successfully with email "maseadi@gmail.com"!`);
  }

  console.log("\nAll fixes completed!");
}

fixMaseadi().catch(console.error);
