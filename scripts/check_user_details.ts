import firebaseConfig from "../firebase-applet-config.json";

async function queryUser() {
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

  // Query users
  console.log("\n=== RUNNING REST QUERY ON USERS ===");
  const queryUserRes = await fetch(firestoreUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "email" },
            op: "EQUAL",
            value: { stringValue: "arifrajcoach@gmail.com" }
          }
        },
        limit: 10
      }
    })
  });

  if (queryUserRes.ok) {
    const results = await queryUserRes.json();
    console.log(`Received ${results.length} documents from users query.`);
    results.forEach((item: any) => {
      const doc = item.document;
      if (doc) {
        console.log(`Document: ${doc.name}`);
        console.log(JSON.stringify(doc.fields, null, 2));
      }
    });
  } else {
    console.error("Failed to query users:", await queryUserRes.text());
  }
}

queryUser().catch(console.error);
