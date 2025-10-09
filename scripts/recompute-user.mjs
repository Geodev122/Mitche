#!/usr/bin/env node
import admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function recomputeForUser(userId) {
  if (!userId) throw new Error('userId required');
  console.log('Recomputing achievements for', userId);
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    console.log('User not found', userId);
    return;
  }
  const userData = userSnap.data() || {};

  // Compute pillars similar to computePillarsFromUser in functions
  const anchor = Number(userData.hopePointsBreakdown?.SilentHero || userData.hopePointsBreakdown?.CommunityGift || 0);
  const bridge = Number(userData.tapestryThreadsCount || userData.tapestryCount || 0);
  const commendations = userData.commendations || {};
  let symbol = 0; for (const k of Object.keys(commendations)) symbol += Number(commendations[k] || 0);
  const dialog = Number(userData.echoes || userData.totalEchoes || userData.hopePointsBreakdown?.VoiceOfCompassion || 0);
  const transpersonal = Number(userData.hopePoints || 0);
  const pillars = { anchor, bridge, symbol, dialog, transpersonal };

  // Gather achievements
  const achSnapshot = await db.collection('achievements').get();
  if (achSnapshot.empty) {
    console.log('No achievements configured');
  }

  const batch = db.batch();
  let anyWrites = false;

  // write pillar snapshot
  batch.set(userRef, { pillars }, { merge: true });

  for (const achDoc of achSnapshot.docs) {
    const ach = achDoc.data() || {};
    const criteria = ach.criteria || {};
    const type = criteria.type;
    const target = Number(criteria.value || 0);
    const userHopePoints = Number(userData.hopePoints || 0);
    const markAchievement = () => {
      const uaId = `${userId}_${achDoc.id}`;
      const uaRef = db.collection('userAchievements').doc(uaId);
      batch.set(uaRef, {
        id: uaId,
        userId,
        achievementId: achDoc.id,
        currentProgress: target,
        targetProgress: target,
        isCompleted: true,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        notificationSent: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(userRef, { badges: admin.firestore.FieldValue.arrayUnion(achDoc.id) });
      anyWrites = true;
    };

    if (type === 'hopePoints' && userHopePoints >= target) markAchievement();
    else if (type === 'commendations') {
      const comms = userData.commendations || {};
      let sum = 0; for (const k of Object.keys(comms)) sum += Number(comms[k] || 0);
      if (sum >= target) markAchievement();
    } else if (type === 'tapestry') {
      const tapestryCount = Number(userData.tapestryThreadsCount || userData.tapestryCount || 0);
      if (tapestryCount >= target) markAchievement();
    } else if (type === 'echoes') {
      const echoes = Number(userData.echoes || userData.totalEchoes || userData.hopePointsBreakdown?.VoiceOfCompassion || 0);
      if (echoes >= target) markAchievement();
    } else if (type === 'combo') {
      const comboCount = Number(userData.combo || 0);
      if (comboCount >= target) markAchievement();
    }
  }

  if (anyWrites) {
    await batch.commit();
    console.log('Wrote achievements and updated user pillars for', userId);
  } else {
    // still write pillars
    await db.runTransaction(async (tx) => tx.update(userRef, { pillars }));
    console.log('No new achievements to award. Pillars written for', userId);
  }
}

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node recompute-user.mjs <userId>');
    process.exit(2);
  }
  try {
    await recomputeForUser(userId);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(3);
  }
}

main();
