import fs from 'fs/promises';

// Node ESM script to perform simple Firestore reads using the Firebase Web SDK.
// This attempts a minimal smoke test: read up to 5 users and 5 requests.
// It reads firebase.config.ts to obtain the client config.

async function loadFirebaseConfig() {
  const text = await fs.readFile(new URL('../firebase.config.ts', import.meta.url), 'utf8');
  const m = text.match(/export const firebaseConfig\s*=\s*({[\s\S]*?});/m);
  if (!m) throw new Error('Could not find firebaseConfig in firebase.config.ts');
  const objLiteral = m[1];
  // Evaluate the object literal into a JS object
  // eslint-disable-next-line no-new-func
  const cfg = (new Function('return ' + objLiteral))();
  return cfg;
}

async function run() {
  try {
    const firebaseConfig = await loadFirebaseConfig();
    console.log('Loaded Firebase config for project:', firebaseConfig.projectId);

    // Import Firebase client SDK dynamically
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, query, limit } = await import('firebase/firestore');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Attempting to read up to 5 users and 5 requests from Firestore...');

    const usersQuery = query(collection(db, 'users'), limit(5));
    const usersSnap = await getDocs(usersQuery);
    console.log(`Users found: ${usersSnap.size}`);

    const requestsQuery = query(collection(db, 'requests'), limit(5));
    const requestsSnap = await getDocs(requestsQuery);
    console.log(`Requests found: ${requestsSnap.size}`);

    console.log('Node Firebase test completed successfully.');
  } catch (err) {
    console.error('Node Firebase test failed:', err);
    if (err && err.stack) console.error(err.stack);
  }
}

run();
