/**
 * Usage:
 *  node scripts/generate-demo-data.mjs --project=mitche-platform --serviceAccount=./serviceAccount.json --userId=<existingUserId>
 *
 * This script writes demo events, requests and resources into Firestore. It will not create users.
 */
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import admin from 'firebase-admin';

const argv = minimist(process.argv.slice(2));
const serviceAccountPath = argv.serviceAccount || process.env.FIREBASE_SERVICE_ACCOUNT;
const projectId = argv.project || process.env.FIREBASE_PROJECT || 'mitche-platform';
const userId = argv.userId || process.env.DEMO_USER_ID;

if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  console.error('Service account JSON not found. Provide --serviceAccount or set FIREBASE_SERVICE_ACCOUNT');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId });
const db = admin.firestore();

(async () => {
  try {
    console.log('Writing sample events...');
    const events = [
      { title: 'Beach Cleanup', description: 'Community cleanup event', organizerId: userId || 'sample_org_1', organizerSymbolicName: 'SampleOrg', type: 'Volunteer', timestamp: admin.firestore.FieldValue.serverTimestamp(), region: 'Sample City' },
      { title: 'Clothing Drive', description: 'Collect warm clothes', organizerId: userId || 'sample_org_1', organizerSymbolicName: 'SampleOrg', type: 'Volunteer', timestamp: admin.firestore.FieldValue.serverTimestamp(), region: 'Sample City' }
    ];
    for (const ev of events) {
      const doc = await db.collection('communityEvents').add(ev);
      console.log('Created event', doc.id);
    }

    console.log('Writing sample requests...');
    const requests = [
      { title: 'Need groceries', description: 'Short-term food assistance', userId: userId || 'sample_user_1', userSymbolicName: 'SampleUser', type: 'Food', mode: 'Loud', timestamp: admin.firestore.FieldValue.serverTimestamp(), region: 'Sample City', status: 'Open' },
      { title: 'Tutoring help', description: 'Looking for math tutoring', userId: userId || 'sample_user_2', userSymbolicName: 'SampleUser2', type: 'Education', mode: 'Silent', timestamp: admin.firestore.FieldValue.serverTimestamp(), region: 'Sample City', status: 'Open' }
    ];
    for (const r of requests) {
      const doc = await db.collection('requests').add(r);
      console.log('Created request', doc.id);
    }

    console.log('Writing sample resources...');
    const resources = [
      { title: 'Community Kitchen', description: 'Free meals weekly', organizerId: userId || 'sample_org_1', organizerSymbolicName: 'SampleOrg', category: 'Food', region: 'Sample City', schedule: 'Weekly', timestamp: admin.firestore.FieldValue.serverTimestamp() }
    ];
    for (const res of resources) {
      const doc = await db.collection('resources').add(res);
      console.log('Created resource', doc.id);
    }
    // Optionally update an existing user's profile with demo fields
    if (userId) {
      console.log('Updating user profile for', userId);
      const userRef = db.collection('users').doc(userId);
      const demoProfile = {
        symbolicName: 'SampleBearer',
        symbolicIcon: 'Lantern',
        bio: 'Sample profile populated for testing.',
        hopePoints: 5,
        hopePointsBreakdown: { CommunityGift: 2, Ritual: 3 },
        badges: ['sample_volunteer'],
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=sample:' + userId,
        location: 'Sample City',
        hasCompletedOnboarding: true
      };
      await userRef.set(demoProfile, { merge: true });
      console.log('User profile updated');
    }

    console.log('Demo data write complete');
    process.exit(0);
  } catch (err) {
    console.error('Demo data write failed', err);
    process.exit(2);
  }
})();
