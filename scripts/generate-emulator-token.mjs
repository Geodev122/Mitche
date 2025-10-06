#!/usr/bin/env node
/*
  Generate a custom token for the Firebase emulator auth via Admin SDK.
  Usage: node scripts/generate-emulator-token.mjs <uid>
  The script expects FIREBASE_EMULATOR_HOST and emulator environment, and a local service account may be required.
*/
import admin from 'firebase-admin';

const uid = process.argv[2] || 'test_user_1';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT || 'demo-project' });
}

async function main() {
  try {
    const token = await admin.auth().createCustomToken(uid);
    console.log('Custom token (use in client signInWithCustomToken):');
    console.log(token);
  } catch (err) {
    console.error('Failed to create custom token:', err);
    process.exit(1);
  }
}

main();
