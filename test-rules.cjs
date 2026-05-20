const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');

async function test() {
  const testEnv = await firebase.initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: {rules: fs.readFileSync('firestore.rules', 'utf8')},
  });

  const db = testEnv.authenticatedContext('NyfDqd4TjvSqyx3ejn4oMq4DHet2', {
    email: 'rt01@rw26.com'
  }).firestore();
  
  try {
    const docRef = db.collection('tenant_settings').doc('rt01_rw26');
    await docRef.get();
    console.log("tenant_settings success");
  } catch (e) {
    console.error("tenant_settings error: " + e.message);
  }
}
test();
