import firebaseConfig from "./firebase-applet-config.json";

async function seedArif() {
  console.log("1. Authenticating anonymously...");
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
  const authRes = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true })
  });

  if (!authRes.ok) {
    throw new Error(`Auth failed: ${await authRes.text()}`);
  }

  const authData = await authRes.json();
  const idToken = authData.idToken;
  console.log("Authenticated. UID:", authData.localId);

  const documentId = "rw26_berjuang_1234567890987654";
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/data_warga/${documentId}`;

  const documentData = {
    fields: {
      nama: { stringValue: "Arif" },
      nik: { stringValue: "1234567890987654" },
      kk: { stringValue: "0987654321234567" },
      status: { stringValue: "Warga Tetap" },
      kewarganegaraan: { stringValue: "WNI" },
      tenantId: { stringValue: "rw26_berjuang" },
      terverifikasi: { booleanValue: true },
      hp: { stringValue: "081234567890" }, // Added default contact hp
      alamat: { stringValue: "RW 26 Berjuang" },
      rt: { stringValue: "01" },
      rw: { stringValue: "26" }
    }
  };

  console.log("2. Writing citizen Arif record to data_warga under rw26_berjuang...");
  const writeRes = await fetch(`${firestoreUrl}?currentDocument.exists=false`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(documentData)
  });

  if (writeRes.ok) {
    console.log("Successfully seeded Arif under rw26_berjuang!");
  } else {
    const errText = await writeRes.text();
    if (errText.includes("already exists") || writeRes.status === 409) {
      console.log("Arif record already exists, overwriting to ensure correct attributes...");
      const overwriteRes = await fetch(firestoreUrl, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(documentData)
      });
      if (overwriteRes.ok) {
        console.log("Successfully updated Arif under rw26_berjuang!");
      } else {
        console.error("Failed to update resident:", await overwriteRes.text());
      }
    } else {
      console.error("Failed to seed resident:", errText);
    }
  }

  // Also seed under rt01_rw26_berjuang to prevent login failure if they login on RT 01 page
  const documentIdRt = "rt01_rw26_berjuang_1234567890987654";
  const firestoreUrlRt = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/data_warga/${documentIdRt}`;
  
  const docDataRt = {
    ...documentData,
    fields: {
      ...documentData.fields,
      tenantId: { stringValue: "rt01_rw26_berjuang" }
    }
  };

  console.log("3. Writing citizen Arif record to data_warga under rt01_rw26_berjuang...");
  const writeResRt = await fetch(firestoreUrlRt, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(docDataRt)
  });

  if (writeResRt.ok) {
    console.log("Successfully seeded Arif under rt01_rw26_berjuang!");
  } else {
    console.error("Failed to seed Arif under RT 01:", await writeResRt.text());
  }
}

seedArif().catch(console.error);
