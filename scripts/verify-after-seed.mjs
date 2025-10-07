#!/usr/bin/env node
// Simple verification script after seeding/backfill
import admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function main() {
  console.log('Verifying Firestore state...');
  const achSnap = await db.collection('achievements').get();
  console.log('achievements count:', achSnap.size);

  const uaSnap = await db.collection('userAchievements').get();
  console.log('userAchievements count:', uaSnap.size);

  // users with pillars
  const usersWithPillars = await db.collection('users').where('pillars', '!=', null).get();
  console.log('users with pillars field:', usersWithPillars.size);

  // leaderboard global doc
  const globalRef = db.collection('leaderboard_aggregates').doc('global');
  const gSnap = await globalRef.get();
  if (!gSnap.exists) {
    console.log('leaderboard_aggregates/global: not found');
  } else {
    const totals = gSnap.data().totals || {};
    const entries = Object.entries(totals).map(([id, v]) => ({ id, ...(v || {}) }));
    console.log('leaderboard entries total:', entries.length);
    // sort by score if present
    entries.sort((a, b) => (b.score || 0) - (a.score || 0));
    console.log('top 10 leaderboard rows (id, score, rawPoints):');
    entries.slice(0, 10).forEach((e, i) => console.log(i + 1, e.id, 'score=', e.score || 0, 'rawPoints=', e.rawPoints || 0));
  }

  // sample users updated (first 10)
  const usersSnap = await db.collection('users').limit(10).get();
  console.log('Sample user docs (first 10):');
  usersSnap.docs.forEach(d => console.log(d.id, JSON.stringify({ hopePoints: d.data().hopePoints, pillars: d.data().pillars || null, commendations: d.data().commendations || null })));

  console.log('Verification complete');
}

main().catch(e => { console.error('verify script error', e); process.exit(1); });
