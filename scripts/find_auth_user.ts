import admin from "firebase-admin";
import firebaseConfig from "../firebase-applet-config.json";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

async function findAuthUser() {
  const email = "maseadi@gmail.com";
  console.log(`Searching Firebase Auth for email: ${email}...`);
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log("Found Auth User!");
    console.log(`- UID: ${userRecord.uid}`);
    console.log(`- Email: ${userRecord.email}`);
    console.log(`- Display Name: ${userRecord.displayName}`);
    console.log(`- Provider:`, userRecord.providerData);
  } catch (err: any) {
    console.error("Error finding user in Firebase Auth:", err);
  }
}

findAuthUser().catch(console.error);
