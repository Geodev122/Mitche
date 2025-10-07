#!/usr/bin/env node
/*
  Backfill and seed script for Mitché
  - Dry-run by default. Pass --apply to write updates.
  - Scans tapestryThreads and hope_ledger to compute per-user counters:
    tapestryThreadsCount, commendations map, echoes counts, hopePointsBreakdown adjustments
  - Seeds HBIM pillar & symbolic achievements (idempotent)
  - Recomputes and writes userAchievements for users who meet criteria
*/
import admin from 'firebase-admin';
import { argv } from 'process';

const APPLY = argv.includes('--apply');
const PROJECT = process.env.FIREBASE_PROJECT || process.env.GCLOUD_PROJECT || null;

if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (e) {
    console.error('Failed to initialize admin SDK:', e);
    process.exit(1);
  }
}

const db = admin.firestore();

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function scanTapestryThreads() {
  console.log('Scanning tapestryThreads...');
  const counts = new Map();
  let last = null;
  const pageSize = 500;
  while (true) {
    let q = db.collection('tapestryThreads').orderBy('createdAt').limit(pageSize);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) {
      const data = d.data();
      const author = data.authorId || data.createdBy || data.userId || null;
      if (!author) continue;
      counts.set(author, (counts.get(author) || 0) + 1);
    }
    last = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }
  console.log(`Found tapestry threads for ${counts.size} authors`);
  return counts;
}

async function scanHopeLedger() {
  console.log('Scanning hope_ledger...');
  const commsPerUser = new Map();
  const breakdownPerUser = new Map();
  const echoesPerUser = new Map();
  let last = null;
  const pageSize = 500;
  const ECHO_CATEGORIES = new Set(['Echoes', 'VoiceOfCompassion', 'Dialog', 'Conversation', 'Echo']);
  const THREAD_CATEGORIES = new Set(['Threads', 'thread', 'tapestry', 'Tapestry', 'TapestryThread']);

  while (true) {
    let q = db.collection('hope_ledger').orderBy('timestamp').limit(pageSize);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) {
      const data = d.data();
      const receiver = data.receiverId;
      if (!receiver) continue;
      // commendations map
      if (data.commendations && typeof data.commendations === 'object') {
        let curr = commsPerUser.get(receiver) || {};
        for (const [k, v] of Object.entries(data.commendations)) {
          curr[k] = (curr[k] || 0) + (Number(v) || 0);
        }
        commsPerUser.set(receiver, curr);
      }
      // breakdown category amounts
      const cat = data.category || 'unknown';
      const amount = Number(data.amount || 0);
      if (amount) {
        const b = breakdownPerUser.get(receiver) || {};
        b[cat] = (b[cat] || 0) + amount;
        breakdownPerUser.set(receiver, b);
      }
      // echoes heuristics
      if (ECHO_CATEGORIES.has(cat)) {
        echoesPerUser.set(receiver, (echoesPerUser.get(receiver) || 0) + (amount || 1));
      }
    }
    last = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }
  console.log(`Aggregated hope_ledger: commendations for ${commsPerUser.size} users, breakdown for ${breakdownPerUser.size} users`);
  return { commsPerUser, breakdownPerUser, echoesPerUser };
}

async function loadUsers() {
  console.log('Loading users list...');
  const users = new Map();
  let last = null;
  const pageSize = 500;
  while (true) {
    let q = db.collection('users').orderBy('createdAt').limit(pageSize);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) {
      users.set(d.id, d.data());
    }
    last = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }
  console.log(`Loaded ${users.size} users`);
  return users;
}

function mergeCommMaps(existing = {}, incoming = {}) {
  const out = { ...existing };
  for (const k of Object.keys(incoming)) out[k] = (out[k] || 0) + (incoming[k] || 0);
  return out;
}

async function seedAchievements() {
  console.log('Seeding achievements (idempotent)...');
  const achievements = [
    {
      id: 'hbim_pillar_anchor',
      name: 'Bearer of Inner Light',
      description: 'Existential Anchoring: foundational acts that stabilize and support others.',
      icon: '⚙️',
      criteria: { type: 'hopePoints', value: 20, timeframe: 'allTime' },
      hopePointsReward: 10,
      category: 'Dedication',
      rarity: 'Common',
      isActive: true,
      isHidden: false
    },
    {
      id: 'hbim_pillar_bridge',
      name: 'Weaver of Wisdom',
      description: 'Narrative Bridging: contribute meaningful stories or tapestry threads.',
      icon: '📚',
      criteria: { type: 'tapestry', value: 3, timeframe: 'allTime' },
      hopePointsReward: 15,
      category: 'Community',
      rarity: 'Common',
      isActive: true,
      isHidden: false
    },
    {
      id: 'hbim_pillar_symbol',
      name: 'Keeper of Sacred Symbols',
      description: 'Symbolic Activation: earn symbolic commendations and cultivate identity.',
      icon: '✴️',
      criteria: { type: 'commendations', value: 5, timeframe: 'allTime' },
      hopePointsReward: 20,
      category: 'Helper',
      rarity: 'Rare',
      isActive: true,
      isHidden: false
    },
    {
      id: 'hbim_pillar_dialog',
      name: 'Voice of Compassion',
      description: 'Dialogical Positioning: earn echoes and meaningful conversational contributions.',
      icon: '✍️',
      criteria: { type: 'echoes', value: 10, timeframe: 'allTime' },
      hopePointsReward: 15,
      category: 'Community',
      rarity: 'Common',
      isActive: true,
      isHidden: false
    },
    {
      id: 'hbim_pillar_transpersonal',
      name: 'Legacy of Light',
      description: 'Transpersonal Resonance: sustained impact across the community.',
      icon: '🌟',
      criteria: { type: 'hopePoints', value: 200, timeframe: 'allTime' },
      hopePointsReward: 50,
      category: 'Dedication',
      rarity: 'Epic',
      isActive: true,
      isHidden: false
    },
    {
      id: 'symbolic_silent_hero',
      name: 'Silent Hero',
      description: 'Receive 5 SilentHero commendations.',
      icon: '🦸',
      criteria: { type: 'commendations', value: 5, timeframe: 'allTime' },
      hopePointsReward: 25,
      category: 'Special',
      rarity: 'Rare',
      isActive: true,
      isHidden: false
    },
    {
      id: 'symbolic_community_builder',
      name: 'Community Builder',
      description: 'Receive 5 CommunityBuilder commendations.',
      icon: '🌳',
      criteria: { type: 'commendations', value: 5, timeframe: 'allTime' },
      hopePointsReward: 25,
      category: 'Special',
      rarity: 'Rare',
      isActive: true,
      isHidden: false
    }
  ];

  const batch = db.batch();
  for (const a of achievements) {
    const ref = db.collection('achievements').doc(a.id);
    batch.set(ref, { ...a, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }
  if (APPLY) {
    await batch.commit();
    console.log('Achievements seeded');
  } else {
    console.log(`Dry-run: would seed ${achievements.length} achievements (run with --apply to commit)`);
  }
  return achievements;
}

async function recomputeAndAward(usersMap, achievements) {
  console.log('Recomputing achievements for users (idempotent)...');
  const achById = new Map(achievements.map(a => [a.id, a]));
  const userIds = Array.from(usersMap.keys());
  const batches = [];
  let currentBatch = db.batch();
  let ops = 0;
  const userAchievementsCreated = [];

  for (const uid of userIds) {
    const userData = usersMap.get(uid) || {};
    const userHope = Number(userData.hopePoints || 0);
    const comms = userData.commendations || {};
    let commSum = 0; for (const k of Object.keys(comms)) commSum += Number(comms[k] || 0);
    const tapestry = Number(userData.tapestryThreadsCount || userData.tapestryCount || 0);
    const echoes = Number(userData.echoes || userData.totalEchoes || userData.hopePointsBreakdown?.VoiceOfCompassion || 0);

    for (const a of achievements) {
      const crit = a.criteria || {};
      const type = crit.type;
      const target = Number(crit.value || 0);
      let qualifies = false;
      if (type === 'hopePoints') qualifies = userHope >= target;
      else if (type === 'commendations') qualifies = commSum >= target;
      else if (type === 'tapestry') qualifies = tapestry >= target;
      else if (type === 'echoes') qualifies = echoes >= target;
      else if (type === 'combo') qualifies = (Number(userData.combo || 0) >= target);

      if (qualifies) {
        const uaId = `${uid}_${a.id}`;
        const uaRef = db.collection('userAchievements').doc(uaId);
        // check existence
        const uaSnap = await uaRef.get();
        if (!uaSnap.exists) {
          const payload = {
            id: uaId,
            userId: uid,
            achievementId: a.id,
            currentProgress: target,
            targetProgress: target,
            isCompleted: true,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            notificationSent: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          currentBatch.set(uaRef, payload);
          currentBatch.update(db.collection('users').doc(uid), { badges: admin.firestore.FieldValue.arrayUnion(a.id) });
          userAchievementsCreated.push({ uid, achievementId: a.id });
          ops += 2;
        }
      }
    }

    if (ops >= 400) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) batches.push(currentBatch);

  console.log(`Prepared ${batches.length} batches for awarding (${userAchievementsCreated.length} new awards)`);
  if (APPLY) {
    for (const b of batches) await b.commit();
    console.log('User achievements committed');
  } else {
    console.log('Dry-run: no user achievements were written (run with --apply to commit)');
  }
  return userAchievementsCreated;
}

async function main() {
  console.log(`Running backfill-and-seed${APPLY ? ' (apply mode)' : ' (dry-run)'} on project ${PROJECT || '(unknown)'}...`);
  const [tapestryCounts, ledgerAgg] = await Promise.all([scanTapestryThreads(), scanHopeLedger()]);
  const users = await loadUsers();

  // Prepare updates
  const updates = [];
  for (const [uid, data] of users.entries()) {
  const update = {};
    const tapestryCount = tapestryCounts.get(uid) || 0;
    if (tapestryCount && (Number(data.tapestryThreadsCount || 0) !== tapestryCount)) update.tapestryThreadsCount = tapestryCount;
    const comms = ledgerAgg.commsPerUser.get(uid) || {};
    if (Object.keys(comms).length) {
      const merged = mergeCommMaps(data.commendations || {}, comms);
      update.commendations = merged;
    }
    const breakdown = ledgerAgg.breakdownPerUser.get(uid) || {};
    if (Object.keys(breakdown).length) {
      const mergedBreak = { ...(data.hopePointsBreakdown || {}), ...breakdown };
      update.hopePointsBreakdown = mergedBreak;
    }
    const echoes = ledgerAgg.echoesPerUser.get(uid) || 0;
    if (echoes && Number(data.echoes || 0) !== echoes) update.echoes = echoes;

    // compute pillars snapshot
    const pillars = {
      anchor: Number(update.hopePointsBreakdown?.SilentHero || update.hopePointsBreakdown?.CommunityGift || data.hopePointsBreakdown?.SilentHero || data.hopePointsBreakdown?.CommunityGift || 0),
      bridge: Number(update.tapestryThreadsCount || data.tapestryThreadsCount || 0),
      symbol: Object.values(update.commendations || data.commendations || {}).reduce((s, v) => s + Number(v || 0), 0),
      dialog: Number(update.echoes || data.echoes || 0),
      transpersonal: Number(data.hopePoints || 0)
    };
    update.pillars = pillars;

    if (Object.keys(update).length) updates.push({ uid, update });
  }

  console.log(`Dry-run summary: ${updates.length} user docs would be updated`);
  if (!APPLY) {
    console.log('Top 10 example updates:');
    updates.slice(0, 10).forEach(u => console.log(u.uid, JSON.stringify(u.update)));
  }

  if (APPLY && updates.length) {
    console.log('Applying user updates in batches...');
    const chunks = chunkArray(updates, 400);
    for (const chunk of chunks) {
      const batch = db.batch();
      for (const u of chunk) {
        batch.set(db.collection('users').doc(u.uid), u.update, { merge: true });
      }
      await batch.commit();
    }
    console.log('User updates applied');
  }

  // Seed achievements (idempotent)
  const achievements = await seedAchievements();

  // Recompute & award
  const createdAwards = await recomputeAndAward(users, achievements);
  console.log(`Recompute finished. ${createdAwards.length} achievements would be created${APPLY ? ' and were created' : ''}.`);

  console.log('Done');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
