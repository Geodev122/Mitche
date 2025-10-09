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
exports.generateSymbolicIcon = exports.adminSeedInitialAchievements = exports.adminRecomputeUserAchievements = exports.onHopeLedgerCreateEvaluateAchievements = exports.awardRitual = exports.adminRunLedgerTest = exports.getPreaggregatedLeaderboard = exports.onStagingUploadFinalize = exports.onHopeLedgerCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Secret Manager client
const secret_manager_1 = require("@google-cloud/secret-manager");
// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Secret Manager helper (cached)
const secretClient = new secret_manager_1.SecretManagerServiceClient();
const secretCache = {};
async function getSecretValue(name) {
    // name should be the short secret id like 'OPENAI_API_KEY' in the same GCP project
    if (secretCache[name] !== undefined)
        return secretCache[name];
    try {
        // The resource name follows: projects/{project}/secrets/{secret}/versions/latest
        // Determine project from env (FIREBASE_PROJECT) or from functions.config
        // Prefer environment variables set by the runtime or Build/CI. Avoid functions.config() (deprecated).
        const projectId = process.env.FIREBASE_PROJECT || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID || null;
        if (!projectId) {
            secretCache[name] = null;
            return null;
        }
        const resource = `projects/${projectId}/secrets/${name}/versions/latest`;
        const [accessResponse] = await secretClient.accessSecretVersion({ name: resource });
        const payload = accessResponse.payload?.data?.toString();
        secretCache[name] = payload || null;
        return secretCache[name];
    }
    catch (e) {
        // If secret not found or permission denied, return null and fallback will apply
        const err = e;
        const msg = err && (typeof err.message === 'string' ? err.message : String(err));
        console.warn('Secret Manager access failed for', name, msg);
        secretCache[name] = null;
        return null;
    }
}
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
        // Enhanced aggregation: maintain per-user rawPoints, per-category breakdown, commendation counts, and a composite score.
        await db.runTransaction(async (tx) => {
            const gSnap = await tx.get(globalRef);
            const gData = gSnap.exists ? gSnap.data() || {} : {};
            const gTotals = gData.totals || {};
            // Each entry in gTotals[uid] is an object: { rawPoints, breakdown: {category:points}, commendations: {...}, score }
            const existingGlobalForUser = gTotals[receiverId] || { rawPoints: 0, breakdown: {}, commendations: {}, score: 0 };
            existingGlobalForUser.rawPoints = (existingGlobalForUser.rawPoints || 0) + amount;
            existingGlobalForUser.breakdown = existingGlobalForUser.breakdown || {};
            existingGlobalForUser.breakdown[data.category || 'unknown'] = (existingGlobalForUser.breakdown[data.category || 'unknown'] || 0) + amount;
            // If the ledger entry includes a commendation map, merge counts
            if (data.commendations && typeof data.commendations === 'object') {
                existingGlobalForUser.commendations = existingGlobalForUser.commendations || {};
                for (const [k, v] of Object.entries(data.commendations)) {
                    existingGlobalForUser.commendations[k] = (existingGlobalForUser.commendations[k] || 0) + (Number(v) || 0);
                }
            }
            // Compute composite score using simple weighted formula:
            // score = rawPoints + (threads*3) + (echoes*2) + (souls*4) + (sum of commendation weights)
            // Note: categories mapping to "Threads","Echoes","Souls" should be provided by category names; we'll map by heuristics here.
            const c = existingGlobalForUser.breakdown || {};
            const threads = Number(c.Threads || c.thread || c.tapestry || 0);
            const echoes = Number(c.Echoes || c.echoes || 0);
            const souls = Number(c.Souls || c.souls || 0);
            const rawPoints = Number(existingGlobalForUser.rawPoints || 0);
            // default commendation weights (can be tuned)
            const commendationWeights = { Kind: 3, Punctual: 1, Respectful: 2 };
            let commendationBonus = 0;
            const comms = existingGlobalForUser.commendations || {};
            for (const [k, v] of Object.entries(comms)) {
                commendationBonus += (Number(v) || 0) * (commendationWeights[k] || 1);
            }
            const score = rawPoints + (threads * 3) + (echoes * 2) + (souls * 4) + commendationBonus;
            existingGlobalForUser.score = score;
            gTotals[receiverId] = existingGlobalForUser;
            tx.set(globalRef, { totals: gTotals }, { merge: true });
            // per-user doc summarizing aggregates
            const pSnap = await tx.get(perUserRef);
            const pData = pSnap.exists ? pSnap.data() || {} : {};
            const newTotal = (pData.total || 0) + amount;
            const mergedBreakdown = { ...(pData.breakdown || {}), ...(existingGlobalForUser.breakdown || {}) };
            tx.set(perUserRef, { total: newTotal, breakdown: mergedBreakdown, score: existingGlobalForUser.score, lastUpdated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
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
// Storage trigger: when a file is uploaded to staging_uploads/{userId}/..., validate and move it to protected area
exports.onStagingUploadFinalize = functions.storage.object().onFinalize(async (object, context) => {
    try {
        const name = object.name || '';
        if (!name.startsWith('staging_uploads/'))
            return null;
        // Extract userId from path staging_uploads/{userId}/filename
        const parts = name.split('/');
        if (parts.length < 2)
            return null;
        const userId = parts[1];
        const srcBucket = admin.storage().bucket(object.bucket);
        const srcFile = srcBucket.file(name);
        // Simple validation placeholder: skip files > 20MB
        const size = Number(object.size || 0);
        if (size > 20 * 1024 * 1024) {
            console.warn('Rejecting large staging upload', name, size);
            // Optionally remove
            await srcFile.delete().catch(() => { });
            return null;
        }
        // Move into protected area
        const destPath = name.replace('staging_uploads/', 'protected/user_uploads/');
        const destFile = srcBucket.file(destPath);
        await srcFile.copy(destFile);
        // Delete staging file to avoid double storage
        await srcFile.delete().catch(() => { });
        // Make a signed URL valid for a short time (7 days) so admins can review
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const [signedUrl] = await destFile.getSignedUrl({ action: 'read', expires: new Date(expiresAt) });
        // Update user doc with the protected asset reference and set verificationStatus to Pending
        const userRef = db.collection('users').doc(userId);
        await userRef.set({ submittedDocuments: admin.firestore.FieldValue.arrayUnion(signedUrl), verificationStatus: 'Pending' }, { merge: true });
        // Optionally create an audit doc
        await db.collection('verification_audits').add({ userId, path: destPath, signedUrl, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        return null;
    }
    catch (err) {
        console.error('Error in onStagingUploadFinalize:', err);
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
        // Require an active admin-created Ritual activity to be present
        const activityQuery = await db.collection('activities')
            .where('type', '==', 'ritual')
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        if (activityQuery.empty) {
            throw new functions.https.HttpsError('failed-precondition', 'no-active-ritual', { message: 'No active ritual activity configured by admin' });
        }
        const activityDoc = activityQuery.docs[0];
        const activityId = activityDoc.id;
        const activityData = activityDoc.data() || {};
        const perUserDailyLimit = typeof activityData.limitPerUserPerDay === 'number' ? activityData.limitPerUserPerDay : 1;
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
        // Enforce per-user per-activity daily limit by checking existing ledger entries for today
        const todayStart = admin.firestore.Timestamp.fromMillis(utcMidnightMs);
        const existingTodayQ = await db.collection('hope_ledger')
            .where('actorId', '==', uid)
            .where('category', '==', 'Ritual')
            .where('activityId', '==', activityId)
            .where('timestamp', '>=', todayStart)
            .get();
        if (!existingTodayQ.empty && existingTodayQ.size >= perUserDailyLimit) {
            throw new functions.https.HttpsError('failed-precondition', 'already-completed', { message: 'Already completed ritual for today' });
        }
        // Run transaction to ensure atomicity: check lastRitualTimestamp, create ledger, update user
        const result = await db.runTransaction(async (tx) => {
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists) {
                throw new functions.https.HttpsError('not-found', 'User document not found');
            }
            const userData = userSnap.data() || {};
            const lastRitualTs = typeof userData.lastRitualTimestamp === 'number' ? userData.lastRitualTimestamp : null;
            // Keep the legacy lastRitualTimestamp check as a safeguard; prefer activity-based enforcement above
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
                activityId: activityId,
                activityTitle: activityData.title || null,
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
        // Enhanced: evaluate multiple criteria types (hopePoints, commendations, tapestry, echoes, combo)
        const achSnapshot = await db.collection('achievements').get();
        if (achSnapshot.empty)
            return null;
        // Compute pillar progress and attach to user doc (non-critical)
        const pillars = computePillarsFromUser(userData);
        try {
            await userRef.set({ pillars }, { merge: true });
        }
        catch (e) {
            // ignore write failures (non-fatal)
            console.warn('Failed to set user pillars', e);
        }
        const batch = db.batch();
        let anyWrites = false;
        // Helper to mark achievement for user
        const markAchievement = async (achievementId) => {
            const uaId = `${receiverId}_${achievementId}`;
            const uaRef = db.collection('userAchievements').doc(uaId);
            const uaSnap = await uaRef.get();
            if (!uaSnap.exists) {
                const now = admin.firestore.FieldValue.serverTimestamp();
                batch.set(uaRef, {
                    id: uaId,
                    userId: receiverId,
                    achievementId,
                    currentProgress: 0,
                    targetProgress: 0,
                    isCompleted: true,
                    completedAt: now,
                    notificationSent: false,
                    earnedContext: { ledgerId, category: data.category || null },
                    createdAt: now,
                    updatedAt: now,
                });
                batch.update(userRef, { badges: admin.firestore.FieldValue.arrayUnion(achievementId) });
                anyWrites = true;
            }
        };
        // Evaluate each achievement
        for (const achDoc of achSnapshot.docs) {
            const ach = achDoc.data();
            const criteria = ach?.criteria || {};
            const type = criteria.type;
            const target = Number(criteria.value || 0);
            try {
                if (type === 'hopePoints') {
                    if (userHopePoints >= target)
                        await markAchievement(achDoc.id);
                }
                else if (type === 'commendations') {
                    // sum up all commendation counts on the user
                    const comms = userData.commendations || {};
                    let sum = 0;
                    for (const k of Object.keys(comms))
                        sum += Number(comms[k] || 0);
                    if (sum >= target)
                        await markAchievement(achDoc.id);
                }
                else if (type === 'tapestry') {
                    // try user-supplied counters, else query tapestry collection for authored threads
                    const tapestryCount = Number(userData.tapestryThreadsCount || userData.tapestryCount || 0);
                    if (tapestryCount >= target)
                        await markAchievement(achDoc.id);
                }
                else if (type === 'echoes') {
                    const echoes = Number(userData.echoes || userData.totalEchoes || userData.hopePointsBreakdown?.VoiceOfCompassion || 0);
                    if (echoes >= target)
                        await markAchievement(achDoc.id);
                }
                else if (type === 'combo') {
                    // legacy combo criteria — interpret as number of requests helped or similar
                    const comboCount = Number(userData.combo || 0);
                    if (comboCount >= target)
                        await markAchievement(achDoc.id);
                }
            }
            catch (e) {
                console.warn('Error evaluating achievement', achDoc.id, e);
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
// Helper: compute simple pillar map from user data
function computePillarsFromUser(userData) {
    // pillars: anchor, bridge, symbol, dialog, transpersonal
    const anchor = Number(userData.hopePointsBreakdown?.SilentHero || userData.hopePointsBreakdown?.CommunityGift || 0);
    const bridge = Number(userData.tapestryThreadsCount || userData.tapestryCount || 0);
    // symbol maps to commendation total
    const commendations = userData.commendations || {};
    let symbol = 0;
    for (const k of Object.keys(commendations))
        symbol += Number(commendations[k] || 0);
    const dialog = Number(userData.echoes || userData.totalEchoes || userData.hopePointsBreakdown?.VoiceOfCompassion || 0);
    const transpersonal = Number(userData.hopePoints || 0);
    return { anchor, bridge, symbol, dialog, transpersonal };
}
// Admin callable: recompute achievements for a specific user (idempotent)
exports.adminRecomputeUserAchievements = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth || !context.auth.uid)
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        // basic admin check
        const callerUid = context.auth.uid;
        let isAdmin = (context.auth.token && context.auth.token.role) === 'Admin';
        if (!isAdmin) {
            const callerDoc = await db.collection('users').doc(callerUid).get();
            if (callerDoc.exists)
                isAdmin = (callerDoc.data().role === 'Admin');
        }
        if (!isAdmin)
            return { success: false, error: 'permission-denied' };
        const userId = typeof data?.userId === 'string' ? data.userId : null;
        if (!userId)
            return { success: false, error: 'userId required' };
        // Trigger the same evaluation as ledger trigger by fetching user's data and invoking evaluation logic
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        if (!userSnap.exists)
            return { success: false, error: 'user-not-found' };
        const userData = userSnap.data();
        // reuse computePillarsFromUser and evaluation code by creating a fake ledger context (not writing ledger)
        // We'll perform the evaluation logic here (similar to onHopeLedgerCreateEvaluateAchievements)
        const achSnapshot = await db.collection('achievements').get();
        const batch = db.batch();
        let anyWrites = false;
        // write pillar snapshot
        const pillars = computePillarsFromUser(userData);
        batch.set(userRef, { pillars }, { merge: true });
        for (const achDoc of achSnapshot.docs) {
            const ach = achDoc.data();
            const criteria = ach?.criteria || {};
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
            if (type === 'hopePoints' && userHopePoints >= target)
                markAchievement();
            else if (type === 'commendations') {
                const comms = userData.commendations || {};
                let sum = 0;
                for (const k of Object.keys(comms))
                    sum += Number(comms[k] || 0);
                if (sum >= target)
                    markAchievement();
            }
            else if (type === 'tapestry') {
                const tapestryCount = Number(userData.tapestryThreadsCount || userData.tapestryCount || 0);
                if (tapestryCount >= target)
                    markAchievement();
            }
            else if (type === 'echoes') {
                const echoes = Number(userData.echoes || userData.totalEchoes || userData.hopePointsBreakdown?.VoiceOfCompassion || 0);
                if (echoes >= target)
                    markAchievement();
            }
            else if (type === 'combo') {
                const comboCount = Number(userData.combo || 0);
                if (comboCount >= target)
                    markAchievement();
            }
        }
        if (anyWrites)
            await batch.commit();
        else
            await db.runTransaction(async (tx) => tx.update(userRef, { pillars }));
        return { success: true };
    }
    catch (err) {
        console.error('adminRecomputeUserAchievements error', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
});
// Admin callable to seed initial HBIM pillar achievements and symbolic commendation achievements
exports.adminSeedInitialAchievements = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth || !context.auth.uid)
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        // basic admin check
        const callerUid = context.auth.uid;
        let isAdmin = (context.auth.token && context.auth.token.role) === 'Admin';
        if (!isAdmin) {
            const callerDoc = await db.collection('users').doc(callerUid).get();
            if (callerDoc.exists)
                isAdmin = (callerDoc.data().role === 'Admin');
        }
        if (!isAdmin)
            throw new functions.https.HttpsError('permission-denied', 'Admin only');
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
        for (const ach of achievements) {
            const ref = db.collection('achievements').doc(ach.id);
            batch.set(ref, { ...ach, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }
        await batch.commit();
        return { success: true, seeded: achievements.length };
    }
    catch (err) {
        console.error('adminSeedInitialAchievements error', err);
        if (err instanceof functions.https.HttpsError)
            throw err;
        throw new functions.https.HttpsError('internal', err instanceof Error ? err.message : String(err));
    }
});
// Callable function to generate a symbolic icon for a user using OpenAI Images API
// Bind the function to the Firebase secret OPENAI_API_KEY so it becomes available
// as process.env.OPENAI_API_KEY at runtime when deployed with firebase functions secrets.
exports.generateSymbolicIcon = functions.runWith({ secrets: ['OPENAI_API_KEY'] }).https.onCall(async (data, context) => {
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
        // Prefer the Firebase-bound secret (available in process.env when deployed with secrets)
        let openaiKey = process.env.OPENAI_API_KEY || null;
        // Fallback to Secret Manager directly (for environments where binding wasn't used)
        if (!openaiKey) {
            openaiKey = await getSecretValue('OPENAI_API_KEY');
        }
        // Last-resort fallback to environment variables only (avoid functions.config())
        if (!openaiKey) {
            openaiKey = process.env.OPENAI_API_KEY || null;
        }
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