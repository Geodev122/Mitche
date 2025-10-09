import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
// The service account key is read from a file, so we need the `fs` module.
// We also need to construct the path to the file, so we use `path`.
import * as fs from 'fs';
import * as path from 'path';

// Construct the full path to the service account key file.
// We assume the script is run from the project root.
const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account-key.json');

let db: admin.firestore.Firestore;

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  db = getFirestore();
  console.log('Firebase Admin SDK initialized successfully.');

} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error(`Failed to read service account key from: ${serviceAccountPath}`);
  console.error('Please ensure the service account key file exists and is correctly placed in the project root.');
  process.exit(1);
}

export { db, admin };
