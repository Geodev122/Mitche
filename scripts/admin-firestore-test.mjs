/*
  Admin Firestore smoke test
  - Requires: npm install firebase-admin
  - Provide a service account JSON and set env var GOOGLE_APPLICATION_CREDENTIALS to its path, or place it at ./serviceAccountKey.json
  - Run: node ./scripts/admin-firestore-test.mjs

  This script will:
  1. Initialize Firebase Admin SDK with a service account.
  2. Create a test Request doc, a Conversation and a Message.
  3. Read back those docs and print summaries.
  4. Clean up (delete created docs) before exit.

  IMPORTANT: Do NOT paste your service account JSON into chat. Instead set the environment variable or drop the file locally.
*/

import fs from 'fs';
import path from 'path';

async function loadServiceAccount() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const fallback = path.resolve(process.cwd(), 'serviceAccountKey.json');
  console.log('DEBUG: GOOGLE_APPLICATION_CREDENTIALS=', envPath);
  console.log('DEBUG: checking fallback path=', fallback);
  const envExists = envPath ? fs.existsSync(envPath) : false;
  const fallbackExists = fs.existsSync(fallback);
  console.log('DEBUG: envExists=', envExists, 'fallbackExists=', fallbackExists);
  const filePath = envPath && envExists ? envPath : (fallbackExists ? fallback : null);
  if (!filePath) {
    throw new Error('Service account JSON not found. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in project root.');
  }
  console.log('DEBUG: using service account file at', filePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function run() {
  try {
    const admin = await import('firebase-admin');
    const serviceAccount = await loadServiceAccount();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    console.log('Admin SDK initialized. Project:', serviceAccount.project_id || 'unknown');

    // Create test request
    const reqData = {
      title: 'Automated test request ' + Date.now(),
      description: 'This request was created by admin-firestore-test.mjs',
      type: 'Emotional',
      mode: 'Loud',
      timestamp: new Date(),
      status: 'Open',
      userId: 'admin-test-user',
      userSymbolicName: 'AdminTester',
      userSymbolicIcon: 'Star'
    };

    const reqRef = await db.collection('requests').add(reqData);
    console.log('Created test request:', reqRef.id);

    // Create a conversation
    const convData = {
      title: 'Admin test conversation',
      participants: ['admin-test-user', 'other-test-user'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      isArchived: false
    };

    const convRef = await db.collection('conversations').add(convData);
    console.log('Created test conversation:', convRef.id);

    // Create a message in that conversation
    const msgData = {
      conversationId: convRef.id,
      senderId: 'admin-test-user',
      text: 'Hello from admin test at ' + new Date().toISOString(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const msgRef = await db.collection('messages').add(msgData);
    console.log('Created test message:', msgRef.id);

    // Read back counts
    const usersSnap = await db.collection('users').limit(5).get();
    const requestsSnap = await db.collection('requests').where('id', '==', reqRef.id).get();
    const convSnap = await db.collection('conversations').doc(convRef.id).get();
    const messagesSnap = await db.collection('messages').where('conversationId', '==', convRef.id).get();

    console.log(`Sample users read: ${usersSnap.size}`);
    console.log(`Test request read by id present: ${!requestsSnap.empty}`);
    console.log(`Conversation present: ${convSnap.exists}`);
    console.log(`Messages in conversation: ${messagesSnap.size}`);

    // Cleanup created docs
    await msgRef.delete();
    await convRef.delete();
    await reqRef.delete();

    console.log('Cleaned up created test documents. Admin smoke test completed successfully.');

    // Graceful shutdown
    process.exit(0);
  } catch (err) {
    console.error('Admin Firestore test failed:', err);
    process.exit(2);
  }
}

run();
