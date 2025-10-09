#!/usr/bin/env node
import admin from 'firebase-admin';
import fs from 'fs';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

async function main() {
  console.log('Inspecting leaderboard_aggregates/global...');
  const ref = db.collection('leaderboard_aggregates').doc('global');
  const snap = await ref.get();
  if (!snap.exists) {
    console.log('No global aggregate found');
    return;
  }
  const data = snap.data() || {};
  const totals = data.totals || {};
  const entries = Object.entries(totals).slice(0, 20);
  console.log(`Found ${Object.keys(totals).length} users in totals. Showing up to 20:`);
  for (const [uid, obj] of entries) {
    console.log(uid, JSON.stringify(obj));
  }
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(2); });
