/*
  ledger-test.mjs
  ----------------
  Simple test harness to create sample hope_ledger entries and verify
  the leaderboard pre-aggregation document (`leaderboard_aggregates/global`).

  Usage (PowerShell):

    # Using a service account JSON file
    $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account.json";
    node .\scripts\ledger-test.mjs

    # Provide custom receiver IDs (comma-separated) and number of entries
    $env:RECEIVER_IDS = "user_a,user_b"; $env:NUM = "10"; node .\scripts\ledger-test.mjs

  Notes:
    - This script uses the Firebase Admin SDK. Ensure `firebase-admin` is installed
      in your environment (e.g., `npm install firebase-admin`) or run it from the
      `functions` folder where dependencies are already installed.
    - If you want to test against the emulator, set FIRESTORE_EMULATOR_HOST
      or run through the Firebase Emulator Suite and initialize admin accordingly.
    - The script will wait briefly after writes to allow any deployed Cloud Function
      triggers to run before reading the aggregates.
*/

import admin from 'firebase-admin';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    // Initialize admin SDK
    if (!admin.apps.length) {
      // If GOOGLE_APPLICATION_CREDENTIALS is set, admin will pick it up automatically
      admin.initializeApp();
    }

    const db = admin.firestore();

    console.log('Firebase Admin initialized. Project:', admin.instanceId ? 'unknown' : 'using application default credentials');

    const num = parseInt(process.env.NUM || '6', 10);
    const receiverEnv = process.env.RECEIVER_IDS || '';

    let receiverIds = receiverEnv.split(',').map(s => s.trim()).filter(Boolean);

    if (receiverIds.length === 0) {
      // Try to pick up to 5 user IDs from the `users` collection
      console.log('No RECEIVER_IDS provided — fetching up to 5 user IDs from `users` collection...');
      const usersSnap = await db.collection('users').limit(5).get();
      receiverIds = usersSnap.docs.map(d => d.id);
    }

    if (receiverIds.length === 0) {
      console.error('No receiver IDs available. Provide RECEIVER_IDS env var or ensure `users` collection has documents. Exiting.');
      process.exit(1);
    }

    console.log('Using receiver IDs:', receiverIds.join(', '));

    // Create sample ledger entries
    const actorId = process.env.ACTOR_ID || 'test-agent';

    console.log(`Creating ${num} sample hope_ledger entries...`);

    const writes = [];
    for (let i = 0; i < num; i++) {
      const receiverId = receiverIds[i % receiverIds.length];
      const amount = Math.floor(Math.random() * 5) + 1; // 1..5
      const category = 'CommunityGift';
      const reason = `automated_test_${Date.now()}_${i}`;

      const entry = {
        actorId,
        receiverId,
        category,
        amount,
        reason,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      writes.push(db.collection('hope_ledger').add(entry));
    }

    await Promise.all(writes);

    console.log('Writes complete — waiting briefly for Cloud Function triggers to execute (if deployed)...');
    await sleep(6000);

    // Read the global aggregate doc
    const globalRef = db.collection('leaderboard_aggregates').doc('global');
    const globalSnap = await globalRef.get();

    if (!globalSnap.exists) {
      console.warn('No `leaderboard_aggregates/global` doc found yet. The Cloud Function may not have executed or your security rules prevent updates.');
    } else {
      const data = globalSnap.data() || {};
      console.log('\nleaderboard_aggregates/global contents:');
      console.dir(data, { depth: 3 });

      // Optionally read per-user docs for the receivers we touched
      console.log('\nPer-user aggregate docs:');
      for (const id of receiverIds) {
        const perRef = db.collection('leaderboard_aggregates').doc(id);
        const perSnap = await perRef.get();
        if (!perSnap.exists) {
          console.log(`${id}: (no doc)`);
        } else {
          console.log(`${id}:`, perSnap.data());
        }
      }
    }

    console.log('\nDone. If you deployed the Cloud Function, check the Firebase Console Logs for function execution details.');
    process.exit(0);
  } catch (err) {
    console.error('Error running ledger-test:', err);
    process.exit(2);
  }
}

main();
