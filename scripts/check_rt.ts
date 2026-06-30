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
  const users = await db.collection("users").where("email", "==", "rt03@rw26.com").get();
  if (users.empty) console.log("Not found in users");
  else users.forEach(d => console.log("user", d.id, d.data()));

  const userDocs = await db.collection("users").get();
  for (const doc of userDocs.docs) {
    if (doc.data().email === "rt03@rw26.com") {
      console.log("found by loop user", doc.id, doc.data());
    }
  }
}
run().catch(console.error);
