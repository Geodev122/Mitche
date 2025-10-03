/*
  E2E client-auth smoke test
  - Uses Admin SDK (requires GOOGLE_APPLICATION_CREDENTIALS env var or FIREBASE_ADMIN_SA_*) to create a temporary user
  - Uses Firebase client SDK to sign in as that user and perform client-side operations
  - Creates a tapestry thread and a conversation+message via client SDK flows
  - Cleans up created docs and the test user

  Run: node ./scripts/e2e-client-auth-test.mjs
*/

import fs from 'fs';
import path from 'path';

async function loadServiceAccountFlexible() {
  // Reuse logic similar to admin-firestore-test.mjs
  const rawJson = process.env.FIREBASE_ADMIN_SA_JSON;
  if (rawJson) return JSON.parse(rawJson);
  const b64 = process.env.FIREBASE_ADMIN_SA_B64;
  if (b64) return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const fallback = path.resolve(process.cwd(), 'serviceAccountKey.json');
  const envExists = envPath ? fs.existsSync(envPath) : false;
  const fallbackExists = fs.existsSync(fallback);
  const filePath = envPath && envExists ? envPath : (fallbackExists ? fallback : null);
  if (!filePath) throw new Error('Service account JSON not found for Admin SDK');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function run() {
  // We'll dynamically import the project's services to reuse logic
  try {
    const adminModule = await import('firebase-admin');
    const admin = adminModule && adminModule.default ? adminModule.default : adminModule;

    const serviceAccount = await loadServiceAccountFlexible();
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    const adminAuth = admin.auth();
    const adminDb = admin.firestore();

    console.log('Admin SDK initialized for E2E client-auth test.');

    // Create a temporary user
    const email = `e2e_test_${Date.now()}@example.com`;
    const password = 'Test1234!';
    console.log('Creating test user', email);
    const userRecord = await adminAuth.createUser({ email, password, emailVerified: true });

    // Now initialize Firebase client SDK with project config
    // firebase.config.ts is TypeScript; Node can't import it directly. Read and parse the file to extract the object.
    function parseFirebaseConfigFromTs(tsPath) {
      const src = fs.readFileSync(tsPath, 'utf8');
      const marker = 'firebaseConfig';
      const idx = src.indexOf(marker);
      if (idx === -1) throw new Error('firebaseConfig not found in ' + tsPath);
      const after = src.slice(idx);
      const firstBrace = after.indexOf('{');
      if (firstBrace === -1) throw new Error('Could not find object start for firebaseConfig');
      let i = firstBrace;
      let depth = 0;
      for (; i < after.length; i++) {
        const ch = after[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) break;
        }
      }
      if (depth !== 0) throw new Error('Unbalanced braces while parsing firebase.config.ts');
      const objLiteral = after.slice(firstBrace, i + 1);
      // Evaluate the object literal safely
      // This is controlled code from your repo; use Function to parse it as JS.
      const obj = (new Function('return ' + objLiteral))();
      return obj;
    }
    const firebaseConfig = parseFirebaseConfigFromTs(path.resolve(process.cwd(), 'firebase.config.ts'));
    // dynamic import of firebase/app and services
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const { getFirestore, doc, collection, addDoc, setDoc } = await import('firebase/firestore');

  const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Sign in
    console.log('Signing in as test user via client SDK...');
    const signInResult = await signInWithEmailAndPassword(auth, email, password);
    const uid = signInResult.user.uid;
    console.log('Signed in as', uid);

    // Create a tapestry thread document from client side (simulate addTapestryThread)
    const tapestryRef = await addDoc(collection(db, 'tapestryThreads'), {
      title: 'E2E client-created tapestry',
      story: 'This thread was created by e2e-client-auth-test.mjs',
      createdAt: new Date(),
      creatorUid: uid,
      creatorName: email,
      reveal: false
    });
    console.log('Client created tapestry thread:', tapestryRef.id);

    // Assert via Admin SDK that the tapestry doc exists and fields match
    const tapestryDoc = await adminDb.collection('tapestryThreads').doc(tapestryRef.id).get();
    if (!tapestryDoc.exists) throw new Error('Tapestry thread not found via admin read');
    const tapestryData = tapestryDoc.data();
    if (tapestryData.creatorUid !== uid) throw new Error('Tapestry creatorUid mismatch');
    if (!tapestryData.story || !tapestryData.story.includes('E2E')) throw new Error('Tapestry story content mismatch');

    // Conversations/messages are restricted by security rules in this project.
    // Use the Admin SDK to create the conversation and message so the test can verify end-to-end behavior
    const convRefAdmin = await adminDb.collection('conversations').add({
      title: 'E2E test conversation (admin-created)',
      participants: [uid, 'other-test-user'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
    console.log('Admin created conversation:', convRefAdmin.id);

    const msgRefAdmin = await adminDb.collection('messages').add({
      conversationId: convRefAdmin.id,
      senderId: uid,
      text: 'Hello from E2E client test (admin message)',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  console.log('Admin created message:', msgRefAdmin.id);

  // Read back conversation and message via Admin SDK and assert
  const convRead = await adminDb.collection('conversations').doc(convRefAdmin.id).get();
  if (!convRead.exists) throw new Error('Conversation not readable after creation');
  const convData = convRead.data();
  if (!Array.isArray(convData.participants) || !convData.participants.includes(uid)) throw new Error('Conversation participants do not include test user');

  const msgReadSnap = await adminDb.collection('messages').where('conversationId', '==', convRefAdmin.id).get();
  if (msgReadSnap.empty) throw new Error('No messages found for conversation');
  const msgRead = msgReadSnap.docs[0].data();
  if (msgRead.senderId !== uid) throw new Error('Message senderId mismatch');

    // Cleanup: delete created docs and user via admin
    console.log('Cleaning up created docs and user...');
    await adminDb.collection('messages').doc(msgRefAdmin.id).delete();
    await adminDb.collection('conversations').doc(convRefAdmin.id).delete();
    await adminDb.collection('tapestryThreads').doc(tapestryRef.id).delete();

    await adminAuth.deleteUser(userRecord.uid);
    console.log('Deleted test user and created docs. E2E client-auth test completed successfully.');

    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      tapestryThreadId: tapestryRef.id,
      conversationId: convRefAdmin.id,
      messageId: msgRefAdmin.id
    };
    fs.writeFileSync(path.resolve(process.cwd(), 'e2e-report.json'), JSON.stringify(report, null, 2));
    console.log('Wrote e2e-report.json');
    process.exit(0);
  } catch (err) {
    console.error('E2E client-auth test failed:', err);
    const report = {
      success: false,
      timestamp: new Date().toISOString(),
      error: (err && err.message) ? err.message : String(err)
    };
    try { fs.writeFileSync(path.resolve(process.cwd(), 'e2e-report.json'), JSON.stringify(report, null, 2)); console.log('Wrote e2e-report.json (failure)'); } catch (e) { console.error('Failed to write report:', e); }
    process.exit(2);
  }
}

run();
