"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSymbolicIcon = exports.onHopeLedgerCreateEvaluateAchievements = exports.awardRitual = exports.adminRunLedgerTest = exports.getPreaggregatedLeaderboard = exports.onHopeLedgerCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// When a ledger entry is created, update aggregates for the receiver
exports.onHopeLedgerCreate = functions.firestore
    .document('hope_ledger/{entryId}')
    .onCreate(async (snap, context) => {
    try {
        const data = snap.data();
        if (!data || !data.receiverId || typeof data.amount !== 'number')
            return null;
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
    }
    catch (err) {
        console.error('Error in onHopeLedgerCreate:', err);
        return null;
    }
});
// A callable function to fetch leaderboard (top N) using pre-aggregated global totals
exports.getPreaggregatedLeaderboard = functions.https.onCall(async (data, context) => {
    try {
        const limit = data?.limit || 100;
        const role = data?.role;
        const globalRef = db.collection('leaderboard_aggregates').doc('global');
        const gSnap = await globalRef.get();
        if (!gSnap.exists)
            return { success: true, data: [] };
        const gData = gSnap.data() || {};
        const totals = gData.totals || {};
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
    }
    catch (err) {
        console.error('Error in getPreaggregatedLeaderboard:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown' };
    }
});
// Callable function that allows an authenticated Admin to create sample ledger entries
exports.adminRunLedgerTest = functions.https.onCall(async (data, context) => {
    try {
        // Require auth
        if (!context.auth || !context.auth.uid) {
            return { success: false, error: 'unauthenticated' };
        }
        // Basic role check via custom claims
        const roleClaim = (context.auth.token && context.auth.token.role);
        let isAdmin = roleClaim === 'Admin';
        // If no claim, fallback to reading user doc
        if (!isAdmin) {
            const userDoc = await db.collection('users').doc(context.auth.uid).get();
            if (userDoc.exists) {
                const u = userDoc.data();
                isAdmin = u?.role === 'Admin';
            }
        }
        if (!isAdmin)
            return { success: false, error: 'permission-denied' };
        const receiverIds = Array.isArray(data?.receiverIds) && data.receiverIds.length > 0 ? data.receiverIds : ['demo_user_a', 'demo_user_b'];
        const num = typeof data?.num === 'number' ? Math.max(1, Math.min(200, data.num)) : 6;
        const actorId = data?.actorId || 'admin_test_agent';
        const writes = [];
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
    }
    catch (err) {
        console.error('Error in adminRunLedgerTest:', err);
        return { success: false, error: err instanceof Error ? err.message : 'unknown' };
    }
});
// Callable function to authoritatively award a Daily Ritual point to the authenticated user
exports.awardRitual = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth || !context.auth.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        const uid = context.auth.uid;
        const prompt = typeof data?.prompt === 'string' && data.prompt.length > 0 ? data.prompt : undefined;
        const requestId = typeof data?.requestId === 'string' && data.requestId.length > 0 ? data.requestId : undefined;
        const amount = 1;
        // Compute UTC midnight (start of current UTC day)
        const now = new Date();
        const utcMidnightMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0);
        const userRef = db.collection('users').doc(uid);
        const ledgerColl = db.collection('hope_ledger');
        const ledgerRef = requestId ? ledgerColl.doc(requestId) : ledgerColl.doc();
        // If requestId provided, quick pre-check to return idempotently
        if (requestId) {
            const existing = await ledgerRef.get();
            if (existing.exists) {
                // Already applied
                return { success: true, alreadyApplied: true, ledgerId: ledgerRef.id };
            }
        }
        // Run transaction to ensure atomicity: check lastRitualTimestamp, create ledger, update user
        const result = await db.runTransaction(async (tx) => {
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists) {
                throw new functions.https.HttpsError('not-found', 'User document not found');
            }
            const userData = userSnap.data() || {};
            const lastRitualTs = typeof userData.lastRitualTimestamp === 'number' ? userData.lastRitualTimestamp : null;
            if (lastRitualTs && lastRitualTs >= utcMidnightMs) {
                throw new functions.https.HttpsError('failed-precondition', 'already-completed', { lastRitualTimestamp: lastRitualTs });
            }
            // If requestId provided, double-check inside transaction
            if (requestId) {
                const ledgerSnap = await tx.get(ledgerRef);
                if (ledgerSnap.exists) {
                    return { success: true, alreadyApplied: true, ledgerId: ledgerRef.id };
                }
            }
            const nowTs = admin.firestore.Timestamp.now();
            // Create ledger entry
            const ledgerData = {
                actorId: uid,
                receiverId: uid,
                category: 'Ritual',
                amount,
                prompt: prompt || null,
                timestamp: nowTs,
            };
            if (requestId)
                ledgerData.requestId = requestId;
            tx.set(ledgerRef, ledgerData);
            // Update user aggregates
            const newHopePoints = (userData.hopePoints || 0) + amount;
            const breakdown = { ...(userData.hopePointsBreakdown || {}) };
            breakdown['Ritual'] = (breakdown['Ritual'] || 0) + amount;
            tx.update(userRef, {
                hopePoints: newHopePoints,
                hopePointsBreakdown: breakdown,
                lastRitualTimestamp: Date.now(),
            });
            return { success: true, ledgerId: ledgerRef.id, newHopePoints, newBreakdown: breakdown };
        });
        // Write analytics as best-effort (outside transaction) to keep transaction small
        try {
            await db.collection('analytics').add({
                eventType: 'daily_ritual_completed',
                userId: uid,
                prompt: prompt || null,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0]
            });
        }
        catch (err) {
            console.warn('Failed to write analytics for awardRitual:', err);
        }
        return result;
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError)
            throw err;
        console.error('Error in awardRitual:', err);
        throw new functions.https.HttpsError('internal', err instanceof Error ? err.message : 'unknown');
    }
});
// When a ledger entry is created, evaluate achievements for the receiver and award if thresholds crossed
exports.onHopeLedgerCreateEvaluateAchievements = functions.firestore
    .document('hope_ledger/{entryId}')
    .onCreate(async (snap, context) => {
    try {
        const data = snap.data();
        if (!data || !data.receiverId)
            return null;
        const receiverId = data.receiverId;
        const ledgerId = context.params.entryId;
        const userRef = db.collection('users').doc(receiverId);
        const userSnap = await userRef.get();
        if (!userSnap.exists)
            return null;
        const userData = userSnap.data() || {};
        const userHopePoints = Number(userData.hopePoints || 0);
        // Query achievements that are of type 'hopePoints'
        const achQuery = await db.collection('achievements').where('criteria.type', '==', 'hopePoints').get();
        if (achQuery.empty)
            return null;
        const batch = db.batch();
        let anyWrites = false;
        for (const achDoc of achQuery.docs) {
            const ach = achDoc.data();
            const criteria = ach?.criteria || {};
            const target = Number(criteria.value || 0);
            if (userHopePoints >= target) {
                const uaId = `${receiverId}_${achDoc.id}`;
                const uaRef = db.collection('userAchievements').doc(uaId);
                const uaSnap = await uaRef.get();
                if (!uaSnap.exists) {
                    const now = admin.firestore.FieldValue.serverTimestamp();
                    batch.set(uaRef, {
                        id: uaId,
                        userId: receiverId,
                        achievementId: achDoc.id,
                        currentProgress: target,
                        targetProgress: target,
                        isCompleted: true,
                        completedAt: now,
                        notificationSent: false,
                        earnedContext: { ledgerId, category: data.category || null },
                        createdAt: now,
                        updatedAt: now,
                    });
                    // Ensure user's badges include this achievement id (denormalized)
                    batch.update(userRef, { badges: admin.firestore.FieldValue.arrayUnion(achDoc.id) });
                    anyWrites = true;
                }
            }
        }
        if (anyWrites) {
            await batch.commit();
        }
        return null;
    }
    catch (err) {
        console.error('Error in onHopeLedgerCreateEvaluateAchievements:', err);
        return null;
    }
});
// Callable function to generate a symbolic icon for a user using OpenAI Images API
exports.generateSymbolicIcon = functions.https.onCall(async (data, context) => {
    try {
        // Only authenticated admins may call this
        if (!context.auth || !context.auth.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }
        const roleClaim = (context.auth.token && context.auth.token.role);
        let isAdmin = roleClaim === 'Admin';
        if (!isAdmin) {
            const userDoc = await db.collection('users').doc(context.auth.uid).get();
            if (userDoc.exists) {
                const u = userDoc.data();
                isAdmin = u?.role === 'Admin';
            }
        }
        if (!isAdmin)
            return { success: false, error: 'permission-denied' };
        const userId = typeof data?.userId === 'string' ? data.userId : null;
        const prompt = typeof data?.prompt === 'string' ? data.prompt : `A symbolic minimal icon representing a caring community in warm gold tones.`;
        if (!userId)
            throw new functions.https.HttpsError('invalid-argument', 'userId required');
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey)
            throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key not configured in functions environment');
        // Call OpenAI Images generation endpoint (request base64) - model selection may vary
        const resp = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                prompt: `${prompt} Simple flat-style icon, square canvas, transparent background, centered symbol, 512x512`,
                n: 1,
                size: '512x512',
                response_format: 'b64_json'
            })
        });
        if (!resp.ok) {
            const t = await resp.text();
            console.error('OpenAI images error:', resp.status, t);
            throw new functions.https.HttpsError('internal', `OpenAI error: ${resp.status}`);
        }
        const payload = await resp.json();
        const b64 = payload?.data?.[0]?.b64_json;
        if (!b64) {
            console.error('Invalid OpenAI response', payload);
            throw new functions.https.HttpsError('internal', 'Invalid OpenAI response');
        }
        const buffer = Buffer.from(b64, 'base64');
        // Save to Firebase Storage
        const bucket = admin.storage().bucket();
        const filePath = `symbolic-icons/${userId}_${Date.now()}.png`;
        const file = bucket.file(filePath);
        await file.save(buffer, { metadata: { contentType: 'image/png' } });
        // Make file public (icons are not considered sensitive); alternatively, store signed URLs
        try {
            await file.makePublic();
        }
        catch (err) {
            console.warn('makePublic failed, continuing with storage media link', err);
        }
        const publicUrl = file.publicUrl();
        // Update user doc to reference the generated icon
        await db.collection('users').doc(userId).update({ symbolicIcon: publicUrl, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        return { success: true, url: publicUrl };
    }
    catch (err) {
        console.error('Error in generateSymbolicIcon:', err);
        if (err instanceof functions.https.HttpsError)
            throw err;
        throw new functions.https.HttpsError('internal', err instanceof Error ? err.message : 'unknown');
    }
});
//# sourceMappingURL=index.js.map