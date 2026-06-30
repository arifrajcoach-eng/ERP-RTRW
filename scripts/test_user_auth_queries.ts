import admin from "firebase-admin";
import firebaseConfig from "../firebase-applet-config.json";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

async function testAuthQueries() {
  // We'll test with the UIDs we found
  const uids = [
    "WaBbZlLlREXrgjiwH5yDVI32tpP2",
    "j8cQ4lpSezbFxLvMchJuoOqCCV93",
    "gMwBzfQcPhkmKgXPzY5Z",
    "kfPMsr0UqPfuRIjxH0pu"
  ];

  for (const uid of uids) {
    console.log(`\n========================================`);
    console.log(`TESTING WITH UID: ${uid} (email: maseadi@gmail.com)`);
    console.log(`========================================`);

    try {
      // 1. Create a custom token
      const customToken = await admin.auth().createCustomToken(uid, {
        email: "maseadi@gmail.com",
        email_verified: true
      });
      console.log("Custom token created successfully.");

      // 2. Exchange for ID Token
      const exchangeUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseConfig.apiKey}`;
      const exchangeRes = await fetch(exchangeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true
        })
      });

      if (!exchangeRes.ok) {
        console.error(`Failed to exchange custom token for UID ${uid}:`, await exchangeRes.text());
        continue;
      }

      const exchangeData = await exchangeRes.json();
      const idToken = exchangeData.idToken;
      console.log("Exchanged for ID Token successfully.");

      // 3. Test reading users/{uid}
      console.log(`Testing read users/${uid}...`);
      const userDocUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${uid}`;
      const userDocRes = await fetch(userDocUrl, {
        headers: { "Authorization": `Bearer ${idToken}` }
      });

      if (userDocRes.ok) {
        console.log(`READ users/${uid} SUCCESS:`, await userDocRes.json());
      } else {
        console.error(`READ users/${uid} FAILED:`, userDocRes.status, await userDocRes.text());
      }

      // 4. Test querying data_warga
      console.log(`Testing query data_warga by email...`);
      const queryWargaUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;
      const queryWargaRes = await fetch(queryWargaUrl, {
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
                field: { fieldPath: "email" },
                op: "EQUAL",
                value: { stringValue: "maseadi@gmail.com" }
              }
            }
          }
        })
      });

      if (queryWargaRes.ok) {
        const results = await queryWargaRes.json();
        console.log(`QUERY data_warga SUCCESS: Found ${results.length} docs.`);
        // console.log(JSON.stringify(results, null, 2));
      } else {
        console.error(`QUERY data_warga FAILED:`, queryWargaRes.status, await queryWargaRes.text());
      }

    } catch (err: any) {
      console.error(`Error during testing for UID ${uid}:`, err);
    }
  }
}

testAuthQueries().catch(console.error);
