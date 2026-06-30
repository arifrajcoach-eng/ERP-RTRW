import firebaseConfig from "../firebase-applet-config.json";

async function fixMaseadi() {
  console.log("=== FIXING maseadi@gmail.com DATA VIA METADATA SERVICE ===");

  // 1. Fetch OAuth2 access token from Google Cloud Metadata Server
  let accessToken = "";
  try {
    console.log("Fetching access token from metadata server...");
    const metadataUrl = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";
    const res = await fetch(metadataUrl, {
      headers: { "Metadata-Flavor": "Google" }
    });
    if (res.ok) {
      const data = await res.json();
      accessToken = data.access_token;
      console.log("Successfully retrieved service account access token.");
    } else {
      console.warn("Could not retrieve access token from metadata server (not running on GCP Cloud Run?):", await res.text());
    }
  } catch (err: any) {
    console.warn("Metadata server check failed:", err.message);
  }

  // Fallback: if we are running locally or metadata server is unavailable, we can use a custom auth token or exit
  if (!accessToken) {
    console.error("No access token retrieved. Cannot proceed with admin-level REST calls.");
    return;
  }

  // Define Firestore base URL for our target database
  const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents`;

  // 2. Query 'users' collection to find all documents with email "maseadi@gmail.com"
  console.log("\nSearching for users with email: maseadi@gmail.com...");
  const queryUsersUrl = `${firestoreBaseUrl}:runQuery`;
  const queryUsersRes = await fetch(queryUsersUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "users" }],
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

  if (!queryUsersRes.ok) {
    console.error("Failed to query users:", await queryUsersRes.text());
    return;
  }

  const users = await queryUsersRes.json();
  console.log(`Found ${users.length} potential user documents.`);

  for (const item of users) {
    const doc = item.document;
    if (!doc) continue;

    const docName = doc.name; // full path e.g. "projects/.../documents/users/UID"
    const docId = docName.split("/").pop();
    const fields = doc.fields || {};
    console.log(`\nProcessing user document [${docId}]...`);

    const updateFields: any = {};
    let needsUpdate = false;

    // Check if role is an array
    if (fields.role && fields.role.arrayValue) {
      const values = fields.role.arrayValue.values || [];
      const roles = values.map((v: any) => v.stringValue).filter(Boolean);
      const hasSekertaris = roles.some((r: string) => r.toLowerCase().includes("sek"));
      const newRole = hasSekertaris ? "sekertaris" : "warga";
      updateFields.role = { stringValue: newRole };
      needsUpdate = true;
      console.log(`- Converting role array ${JSON.stringify(roles)} to string: "${newRole}"`);
    }

    // Check if tenantId is an array
    if (fields.tenantId && fields.tenantId.arrayValue) {
      const values = fields.tenantId.arrayValue.values || [];
      const tenants = values.map((v: any) => v.stringValue).filter(Boolean);
      const newTenant = tenants[0] || "rt01_rw26_berjuang";
      updateFields.tenantId = { stringValue: newTenant };
      needsUpdate = true;
      console.log(`- Converting tenantId array ${JSON.stringify(tenants)} to string: "${newTenant}"`);
    }

    if (needsUpdate) {
      // Build fields to update
      const patchFields = { ...fields, ...updateFields };
      // Specify which fields we are patching
      const updateMaskParams = Object.keys(updateFields).map(k => `updateMask.fieldPaths=${k}`).join("&");
      const patchUrl = `https://firestore.googleapis.com/v1/${docName}?${updateMaskParams}`;

      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: patchFields })
      });

      if (patchRes.ok) {
        console.log(`- Document [${docId}] updated successfully!`);
      } else {
        console.error(`- Failed to update document [${docId}]:`, await patchRes.text());
      }
    } else {
      console.log(`- Document [${docId}] is already correct.`);
    }
  }

  // 3. Query 'data_warga' for NIK "3216022802830005"
  console.log("\nSearching for data_warga matching NIK: 3216022802830005...");
  const queryWargaRes = await fetch(queryUsersUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
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

  if (queryWargaRes.ok) {
    const wargas = await queryWargaRes.json();
    console.log(`Found ${wargas.length} data_warga documents.`);

    for (const item of wargas) {
      const doc = item.document;
      if (!doc) continue;

      const docName = doc.name;
      const docId = docName.split("/").pop();
      const fields = doc.fields || {};

      console.log(`Updating email for data_warga [${docId}] to "maseadi@gmail.com"...`);
      const patchFields = {
        ...fields,
        email: { stringValue: "maseadi@gmail.com" }
      };

      const patchUrl = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=email`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: patchFields })
      });

      if (patchRes.ok) {
        console.log(`- Successfully updated email for data_warga [${docId}]!`);
      } else {
        console.error(`- Failed to update email for data_warga [${docId}]:`, await patchRes.text());
      }
    }
  } else {
    console.error("Failed to query data_warga by NIK:", await queryWargaRes.text());
  }

  console.log("\n=== PROCESS COMPLETED ===");
}

fixMaseadi().catch(console.error);
