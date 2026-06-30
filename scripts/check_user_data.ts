
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
  // Try to find the user by email
  const users = await db.collection("users").where("email", "==", "maseadi@gmail.com").get();
  if (!users.empty) {
      users.forEach(doc => {
          console.log("user found:", doc.id, doc.data());
      });
  } else {
      console.log("user not found in users");
      const warga = await db.collection("data_warga").where("email", "==", "maseadi@gmail.com").get();
      if (!warga.empty) {
          warga.forEach(doc => {
              console.log("warga found:", doc.id, doc.data());
          });
      } else {
          console.log("user not found in data_warga either");
      }
  }
}
run().catch(console.error);
