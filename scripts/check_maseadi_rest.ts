import firebaseConfig from "../firebase-applet-config.json";

async function queryMaseadi() {
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

  const targetDocId = "rw26_berjuang_3216022802830005";
  console.log(`\n2. Fetching document data_warga/${targetDocId}...`);
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/data_warga/${targetDocId}`;

  const getDocRes = await fetch(firestoreUrl, {
    headers: {
      "Authorization": `Bearer ${idToken}`
    }
  });

  if (getDocRes.ok) {
    const docData = await getDocRes.json();
    console.log(`Document exists! Fields:`, JSON.stringify(docData.fields, null, 2));
  } else {
    console.log(`Document data_warga/${targetDocId} does NOT exist (Status ${getDocRes.status}).`);
    const text = await getDocRes.text();
    console.log("Error details:", text);
  }

  // Also query data_warga by NIK = "3216022802830005"
  console.log(`\n3. Querying data_warga by NIK = "3216022802830005"...`);
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;
  const queryRes = await fetch(queryUrl, {
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
            value: { stringValue: "3216022802830005" }
          }
        }
      }
    })
  });

  if (queryRes.ok) {
    const results = await queryRes.json();
    console.log(`Query by NIK results:`, JSON.stringify(results, null, 2));
  } else {
    console.error("Query by NIK failed:", await queryRes.text());
  }
}

queryMaseadi().catch(console.error);
