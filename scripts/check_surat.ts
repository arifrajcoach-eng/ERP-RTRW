import admin from "firebase-admin";
import firebaseConfig from "../firebase-applet-config.json";

const app = admin.initializeApp({
  projectId: firebaseConfig.projectId
});

const db = new admin.firestore.Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId
});

async function run() {
  const suratRef = db.collection("surat");
  const surats = await suratRef.limit(1).get();
  
  if (surats.empty) {
    console.log("No surats found");
  } else {
    surats.forEach(doc => {
      console.log(`Surat ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }
}

run().catch(console.error);
