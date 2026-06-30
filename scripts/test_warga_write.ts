
import firebaseConfig from "../firebase-applet-config.json";

async function run() {
  console.log("Authenticating anonymously...");
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  const authRes = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true })
  });
  const authData = await authRes.json();
  const idToken = authData.idToken;
  console.log("Authenticated. UID:", authData.localId);

  const docPath = `projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/data_warga/rt03_rw26_berjuang_3216022610800006`;
  const url = `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=name`;

  console.log("Attempting PATCH request to data_warga doc...");
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: docPath,
      fields: {
        nama: { stringValue: "ACHMAD SYARIF TEST" }
      }
    })
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

run().catch(console.error);
