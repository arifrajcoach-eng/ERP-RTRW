import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

async function diagnose() {
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

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;

  // Query emergencies
  console.log("\n=== RUNNING REST QUERY ON EMERGENCIES ===");
  const queryEmerg = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "emergencies" }],
        orderBy: [{ field: { fieldPath: "timestamp" }, direction: "DESCENDING" }],
        limit: 10
      }
    })
  });

  if (queryEmerg.ok) {
    const results = await queryEmerg.json();
    console.log(`Received ${results.length} documents from emergencies.`);
    results.forEach((item: any) => {
      const doc = item.document;
      if (doc) {
        const fields = doc.fields || {};
        console.log(`- DocID: ${doc.name.split("/").pop()} 
          | Name: "${fields.userName?.stringValue || ""}" 
          | tenantId: "${fields.tenantId?.stringValue || ""}" 
          | status: "${fields.status?.stringValue || ""}" 
          | timestamp: "${fields.timestamp?.stringValue || ""}" 
          | rt/rw: "${fields.rt?.stringValue || ""}/${fields.rw?.stringValue || ""}"`);
      }
    });
  } else {
    console.error("Failed to query emergencies:", await queryEmerg.text());
  }

  // Query users
  console.log("\n=== RUNNING REST QUERY ON USERS ===");
  const queryUsers = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "users" }],
        limit: 100
      }
    })
  });

  if (queryUsers.ok) {
    const results = await queryUsers.json();
    console.log(`Received ${results.length} documents from users.`);
    results.forEach((item: any) => {
      const doc = item.document;
      if (doc) {
        const fields = doc.fields || {};
        console.log(`- DocID: ${doc.name.split("/").pop()} 
          | Name: "${fields.name?.stringValue || fields.nama?.stringValue || ""}" 
          | Role: "${fields.role?.stringValue || ""}" 
          | tenantId: "${fields.tenantId?.stringValue || ""}" 
          | rt: "${fields.rt?.stringValue || ""}" 
          | rw: "${fields.rw?.stringValue || ""}"`);
      }
    });
  } else {
    console.error("Failed to query users:", await queryUsers.text());
  }

  // Query tenants to find rt03_rw26_berjuang
  console.log("\n=== CONSOLE INSPECT OF rt03_rw26_berjuang ===");
  const queryTenants = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "tenants" }],
        limit: 100
      }
    })
  });
  if (queryTenants.ok) {
    const results = await queryTenants.json();
    results.forEach((item: any) => {
      const doc = item.document;
      if (doc) {
        const id = doc.name.split("/").pop();
        if (id.includes("berjuang") || id.includes("rt03_rw26")) {
          const fields = doc.fields || {};
          console.log(`- TenantID: ${id} | Name: "${fields.name?.stringValue || ""}" | parentId: "${fields.parentId?.stringValue || ""}"`);
        }
      }
    });
  }
}

diagnose().catch(console.error);
