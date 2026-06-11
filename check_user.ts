
import firebaseConfig from "./firebase-applet-config.json";

async function queryAllWarga() {
  console.log("1. Authenticating anonymously via REST API...");
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  const authRes = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true })
  });

  if (!authRes.ok) {
    const err = await authRes.text();
    throw new Error(`REST Authentication failed: ${err}`);
  }

  const authData = await authRes.json();
  const idToken = authData.idToken;
  console.log("REST Authentication successful.");

  console.log("2. Querying data_warga and verifikasi_warga via pure REST API...");
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;

  // We query data_warga
  console.log("\n=== RUNNING REST QUERY ON DATA_WARGA ===");
  const queryWargaRes = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "data_warga" }],
        limit: 100
      }
    })
  });

  if (queryWargaRes.ok) {
    const results = await queryWargaRes.json();
    console.log(`Received ${results.length} documents from data_warga query (some may be empty/null separators).`);
    results.forEach((item: any) => {
      const doc = item.document;
      if (doc) {
        const fields = doc.fields || {};
        const name = fields.nama?.stringValue || fields.name?.stringValue || "";
        const nik = fields.nik?.stringValue || "";
        const kk = fields.kk?.stringValue || fields.kodeKeluarga?.stringValue || "";
        const tenantId = fields.tenantId?.stringValue || "";
        const status = fields.status?.stringValue || "";
        console.log(`- DocID: ${doc.name.split("/").pop()} | Name: "${name}" | NIK: "${nik}" | KK: "${kk}" | TenantId: "${tenantId}" | Status: "${status}"`);
      }
    });
  } else {
    console.error("Failed to query data_warga:", await queryWargaRes.text());
  }

  // We query verifikasi_warga
  console.log("\n=== RUNNING REST QUERY ON VERIFIKASI_WARGA ===");
  const queryVerifRes = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "verifikasi_warga" }],
        limit: 100
      }
    })
  });

  if (queryVerifRes.ok) {
    const results2 = await queryVerifRes.json();
    console.log(`Received ${results2.length} documents from verifikasi_warga query.`);
    results2.forEach((item: any) => {
      const doc = item.document;
      if (doc) {
        const fields = doc.fields || {};
        const name = fields.nama?.stringValue || fields.name?.stringValue || "";
        const nik = fields.nik?.stringValue || "";
        const kk = fields.kk?.stringValue || fields.kodeKeluarga?.stringValue || "";
        const tenantId = fields.tenantId?.stringValue || "";
        const status = fields.status?.stringValue || "";
        console.log(`- DocID: ${doc.name.split("/").pop()} | Name: "${name}" | NIK: "${nik}" | KK: "${kk}" | TenantId: "${tenantId}" | Status: "${status}"`);
      }
    });
  } else {
    console.error("Failed to query verifikasi_warga:", await queryVerifRes.text());
  }
}

queryAllWarga().catch(console.error);







