import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "../firebase-applet-config.json";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function checkMaseadi() {
  const targetEmail = "maseadi@gmail.com";
  console.log(`=== CHECKING FOR EMAIL: ${targetEmail} ===`);

  // 1. Check in 'users' collection
  console.log("\nSearching in 'users' collection...");
  const usersColl = db.collection("users");
  
  // Try querying by email field
  const usersByEmail = await usersColl.where("email", "==", targetEmail).get();
  console.log(`Found ${usersByEmail.size} documents in 'users' by email field.`);
  usersByEmail.forEach(doc => {
    console.log(`- Document ID: [${doc.id}]`, doc.data());
  });

  // Try querying by doc ID = email
  const docByEmailId = await usersColl.doc(targetEmail).get();
  if (docByEmailId.exists) {
    console.log(`- Found document where ID is the email: [${docByEmailId.id}]`, docByEmailId.data());
  } else {
    console.log(`- No user document with ID = "${targetEmail}"`);
  }

  // 2. Check in 'data_warga' collection
  console.log("\nSearching in 'data_warga' collection...");
  const wargaColl = db.collection("data_warga");
  const wargaByEmail = await wargaColl.where("email", "==", targetEmail).get();
  console.log(`Found ${wargaByEmail.size} documents in 'data_warga' by email field.`);
  wargaByEmail.forEach(doc => {
    console.log(`- Document ID: [${doc.id}]`, doc.data());
  });

  // Let's search case-insensitively or trimmer versions if any
  const allWarga = await wargaColl.get();
  let matches = 0;
  allWarga.forEach(doc => {
    const data = doc.data();
    if (data.email && data.email.toLowerCase().trim() === targetEmail) {
      matches++;
      console.log(`- Match in allWarga scan! Doc ID: [${doc.id}]`, data);
    }
  });
  console.log(`Scan finished. Found ${matches} case-insensitive matches in 'data_warga'.`);
}

checkMaseadi().catch(console.error);
