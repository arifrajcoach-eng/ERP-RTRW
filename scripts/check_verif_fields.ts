import firebaseConfig from "../firebase-applet-config.json";

async function run() {
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  const authRes = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true })
  });
  const authData = await authRes.json();
  const idToken = authData.idToken;

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;

  console.log("=== SEARCHING VERIFIKASI_WARGA FOR NIK 3216022610800006 ===");
  const queryRes = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "verifikasi_warga" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "nik" },
            op: "EQUAL",
            value: { stringValue: "3216022610800006" }
          }
        }
      }
    })
  });

  const docs = await queryRes.json();
  console.log(`Found ${docs.length} documents in verifikasi_warga.`);
  docs.forEach((item: any, idx: number) => {
    const doc = item.document;
    if (doc) {
      console.log(`\nDocument ID: ${doc.name.split("/").pop()}`);
      console.log("Fields:", JSON.stringify(doc.fields, null, 2));
    }
  });
}

run().catch(console.error);
