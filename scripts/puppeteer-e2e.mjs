/*
  Puppeteer UI E2E Test
  - Assumes project can run `npm run dev` locally and dev server is available at http://localhost:3002
  - Uses Admin SDK to create a test user and a test request document
  - Uses Puppeteer to open the app, sign in, navigate to the request detail, add to tapestry, and assert navigation/highlight
  - Cleans up created docs and user

  Run: node ./scripts/puppeteer-e2e.mjs
*/

import fs from 'fs';
import path from 'path';
import child from 'child_process';

async function loadServiceAccountFlexible() {
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

async function startDevServer() {
  console.log('Starting dev server...');
  const proc = child.spawn('npm', ['run', 'dev'], { cwd: process.cwd(), shell: true, stdio: 'inherit' });
  // Wait for vite output via a sleep then assume ready; in CI you'd parse stdout or use wait-on
  await new Promise(r => setTimeout(r, 3000));
  return proc;
}

async function run() {
  const adminModule = await import('firebase-admin');
  const admin = adminModule && adminModule.default ? adminModule.default : adminModule;
  const serviceAccount = await loadServiceAccountFlexible();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const adminAuth = admin.auth();
  const adminDb = admin.firestore();

  // Create test user
  const email = `puppeteer_test_${Date.now()}@example.com`;
  const password = 'Test1234!';
  console.log('Creating admin test user', email);
  const userRecord = await adminAuth.createUser({ email, password, emailVerified: true });

  // Create a test request document
  const reqRef = await adminDb.collection('requests').add({
    title: 'Puppeteer E2E Test Request',
    description: 'Used for automated UI test',
    userId: userRecord.uid,
    userSymbolicName: 'PuppeteerUser',
    userSymbolicIcon: 'Star',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'Open'
  });
  console.log('Created request', reqRef.id);

  // Start dev server
  const devProc = await startDevServer();

  // Launch puppeteer
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    // Open auth modal
    await page.click('button:has-text("Start") , button');
    await page.waitForSelector('#login-username');

    // Fill login form
    await page.type('#login-username', userRecord.email);
    await page.type('#login-password', password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // Navigate directly to the request detail
    await page.goto(`http://localhost:3002/requests/${reqRef.id}`, { waitUntil: 'networkidle2' });

    // Click Add to Tapestry
    await page.waitForSelector('button:has-text("Add to Tapestry")');
    await page.click('button:has-text("Add to Tapestry")');
    await page.waitForSelector('textarea');
    await page.type('textarea', 'Automated tapestry story from Puppeteer test');
    await page.click('button:has-text("Add to Tapestry")');

    // Wait for navigation to /tapestry
    await page.waitForFunction(() => window.location.pathname.includes('/tapestry'));

    // Check that the page contains an element that indicates the highlight (looks for ring class)
    const highlighted = await page.evaluate(() => !!document.querySelector('.ring-2, .ring-amber-400, .ring-amber-300'));

    if (!highlighted) throw new Error('Tapestry highlight not found after add');

    console.log('Puppeteer E2E flow succeeded');

    // write success report
    fs.writeFileSync(path.resolve(process.cwd(), 'e2e-ui-report.json'), JSON.stringify({ success: true, requestId: reqRef.id }, null, 2));

  } catch (err) {
    console.error('Puppeteer E2E failed:', err);
    fs.writeFileSync(path.resolve(process.cwd(), 'e2e-ui-report.json'), JSON.stringify({ success: false, error: String(err) }, null, 2));
    throw err;
  } finally {
    await browser.close();
    // Kill dev server
    try { devProc.kill(); } catch (e) { }
    // Cleanup
    await adminDb.collection('tapestryThreads').where('creatorUid', '==', userRecord.uid).get().then(s => s.forEach(d => d.ref.delete()));
    await adminDb.collection('requests').doc(reqRef.id).delete();
    await adminAuth.deleteUser(userRecord.uid);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
