#!/usr/bin/env node
/*
  Quick test script to call the callable awardRitual using Firebase client SDK.
  Usage: node scripts/callable-award-ritual.mjs <idToken>
  Provide a Firebase ID token for an authenticated user (or run against emulator with a test user setup).
*/
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = {
  // Intentionally left blank — when running against emulator, use default app settings or set env vars
};

async function main() {
  const idToken = process.argv[2];
  if (!idToken) {
    console.error('Usage: node scripts/callable-award-ritual.mjs <idToken>');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  // If you have a custom token, sign in with it
  try {
    await signInWithCustomToken(auth, idToken);
    const functions = getFunctions(app);
    const fn = httpsCallable(functions, 'awardRitual');
    const res = await fn({ prompt: 'Test ritual via script', requestId: `test-${Date.now()}` });
    console.log('Result:', res.data);
  } catch (err) {
    console.error('Error calling awardRitual:', err);
  }
}

main();
