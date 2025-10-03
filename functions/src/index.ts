import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// When a ledger entry is created, update aggregates for the receiver
export const onHopeLedgerCreate = functions.firestore
  .document('hope_ledger/{entryId}')
  .onCreate(async (snap, context) => {
    try {
      const data = snap.data();
      if (!data || !data.receiverId || typeof data.amount !== 'number') return null;
      const receiverId = data.receiverId;
      const amount = Number(data.amount || 0);
      const ts = data.timestamp ? data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp) : new Date();
      const dayKey = ts.toISOString().split('T')[0];

      const globalRef = db.collection('leaderboard_aggregates').doc('global');
      const perUserRef = db.collection('leaderboard_aggregates').doc(receiverId);
      const dailyRef = db.collection('leaderboard_aggregates').doc(`${receiverId}_daily`);

      // Use transaction to update global aggregate and per-user aggregate atomically
      await db.runTransaction(async (tx) => {
        const gSnap = await tx.get(globalRef);
        const gData = gSnap.exists ? gSnap.data() || {} : {};
        const gTotals = gData.totals || {};
        gTotals[receiverId] = (gTotals[receiverId] || 0) + amount;
        tx.set(globalRef, { totals: gTotals }, { merge: true });

        const pSnap = await tx.get(perUserRef);
        const pData = pSnap.exists ? pSnap.data() || {} : {};
        const pTotal = (pData.total || 0) + amount;
        tx.set(perUserRef, { total: pTotal, lastUpdated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

        // daily breakdown per user
        const dSnap = await tx.get(dailyRef);
        const dData = dSnap.exists ? dSnap.data() || {} : {};
        const daily = dData.daily || {};
        daily[dayKey] = (daily[dayKey] || 0) + amount;
        tx.set(dailyRef, { daily, lastUpdated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      });

      return null;
    } catch (err) {
      console.error('Error in onHopeLedgerCreate:', err);
      return null;
    }
  });

// A callable function to fetch leaderboard (top N) using pre-aggregated global totals
export const getPreaggregatedLeaderboard = functions.https.onCall(async (data, context) => {
  try {
    const limit = data?.limit || 100;
    const role = data?.role;

    const globalRef = db.collection('leaderboard_aggregates').doc('global');
    const gSnap = await globalRef.get();
    if (!gSnap.exists) return { success: true, data: [] };
    const gData = gSnap.data() || {};
    const totals: Record<string, number> = gData.totals || {};

    // Convert to array and sort
    let rows = Object.entries(totals).map(([id, points]) => ({ id, points }));
    rows = rows.sort((a, b) => b.points - a.points).slice(0, limit);

    if (role) {
      // fetch users to filter by role
      const usersSnap = await db.collection('users').where('role', '==', role).get();
      const ids = new Set(usersSnap.docs.map(d => d.id));
      rows = rows.filter(r => ids.has(r.id));
    }

    return { success: true, data: rows };
  } catch (err) {
    console.error('Error in getPreaggregatedLeaderboard:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown' };
  }
});

// Callable function that allows an authenticated Admin to create sample ledger entries
export const adminRunLedgerTest = functions.https.onCall(async (data, context) => {
  try {
    // Require auth
    if (!context.auth || !context.auth.uid) {
      return { success: false, error: 'unauthenticated' };
    }

    // Basic role check via custom claims
    const roleClaim = (context.auth.token && (context.auth.token as any).role) as string | undefined;
    let isAdmin = roleClaim === 'Admin';

    // If no claim, fallback to reading user doc
    if (!isAdmin) {
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      if (userDoc.exists) {
        const u = userDoc.data() as any;
        isAdmin = u?.role === 'Admin';
      }
    }

    if (!isAdmin) return { success: false, error: 'permission-denied' };

    const receiverIds: string[] = Array.isArray(data?.receiverIds) && data.receiverIds.length > 0 ? data.receiverIds : ['demo_user_a', 'demo_user_b'];
    const num = typeof data?.num === 'number' ? Math.max(1, Math.min(200, data.num)) : 6;
    const actorId = data?.actorId || 'admin_test_agent';

    const writes: Promise<admin.firestore.DocumentReference>[] = [];
    for (let i = 0; i < num; i++) {
      const receiverId = receiverIds[i % receiverIds.length];
      const amount = Math.floor(Math.random() * 5) + 1;
      const entry = {
        actorId,
        receiverId,
        category: 'CommunityGift',
        amount,
        reason: `admin_test_${Date.now()}_${i}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      writes.push(db.collection('hope_ledger').add(entry));
    }

    const refs = await Promise.all(writes);
    const ids = refs.map(r => r.id);

    // return created ids so caller can inspect
    return { success: true, created: ids };
  } catch (err) {
    console.error('Error in adminRunLedgerTest:', err);
    return { success: false, error: err instanceof Error ? err.message : 'unknown' };
  }
});