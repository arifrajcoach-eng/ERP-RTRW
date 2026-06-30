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
  const users = await db.collection("users").where("email", "==", "arifrajmci@gmail.com").get();
  if (users.empty) console.log("Not found in users");
  else users.forEach(d => console.log("user", d.id, d.data()));

  const warga = await db.collection("data_warga").where("email", "==", "arifrajmci@gmail.com").get();
  if (warga.empty) console.log("Not found in data_warga");
  else warga.forEach(d => console.log("warga", d.id, d.data()));
}
run().catch(console.error);
