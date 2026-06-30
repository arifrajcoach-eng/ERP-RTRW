
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

  console.log("=== SEARCHING DATA_WARGA FOR NIK 3216022610800006 ===");
  const queryWargaRes = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "data_warga" }],
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

  const wargaDocs = await queryWargaRes.json();
  console.log(`Found ${wargaDocs.length} documents.`);
  wargaDocs.forEach((item: any, idx: number) => {
    const doc = item.document;
    if (doc) {
      const docId = doc.name.split("/").pop();
      const fields = doc.fields || {};
      const name = fields.nama?.stringValue || fields.name?.stringValue || "";
      const tenantId = fields.tenantId?.stringValue || "";
      console.log(`Document [${idx}] ID: ${docId} | Name: "${name}" | TenantId: "${tenantId}"`);
    }
  });
}

run().catch(console.error);
