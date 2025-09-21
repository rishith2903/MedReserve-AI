/*
  Smoke test for upload rate limiting via /medical-reports/upload
  Usage:
    API_BASE_URL=http://localhost:8080 node scripts/smoke-upload-rate.mjs
  Notes:
    - Requires Node 18+ (global fetch/FormData/Blob)
    - Starts by signing up a random patient and logging in
    - Tries to upload > N files within a minute to trigger 429
*/

const BASE = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080';
const LIMIT = Number(process.env.UPLOADS_REQUESTS_PER_MINUTE || 10);
const ATTEMPTS = LIMIT + 2; // exceed by 2

function randEmail() {
  const n = Math.floor(Math.random() * 1e9);
  return `rate_${n}@example.com`;
}

async function post(path, body, token, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

async function signupAndLogin(email, password, phoneNumber) {
  const signupBody = {
    firstName: 'Rate',
    lastName: 'Limit',
    email,
    password,
    phoneNumber,
    role: 'PATIENT',
  };
  const s = await post('/auth/signup', signupBody);
  if (!s.ok) throw new Error(`Signup failed: ${s.status} ${JSON.stringify(s.data)}`);

  const l = await post('/auth/login', { email, password });
  if (!l.ok || !l.data?.accessToken) throw new Error(`Login failed: ${l.status} ${JSON.stringify(l.data)}`);
  return l.data.accessToken;
}

function tinyPngBlob() {
  // 8-byte PNG signature is sufficient for server-side magic detection
  const bytes = new Uint8Array([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  return new Blob([bytes], { type: 'image/png' });
}

async function uploadReport(token, idx) {
  const form = new FormData();
  form.append('file', tinyPngBlob(), `tiny_${idx}.png`);
  const report = {
    title: `E2E Report ${idx}`,
    description: 'Automated test upload',
    reportType: 'OTHER',
    shareWithDoctor: false,
  };
  form.append('report', new Blob([JSON.stringify(report)], { type: 'application/json' }));
  return await post('/medical-reports/upload', form, token);
}

(async () => {
  console.log(`[rate] Using API base: ${BASE}`);
  const email = randEmail();
  const password = 'StrongPwd1@';
  const phoneNumber = `+91${Math.floor(9000000000 + Math.random()*99999999).toString().padStart(10,'0')}`;

  try {
    const token = await signupAndLogin(email, password, phoneNumber);
    console.log('[rate] Signed up and logged in as', email);

    let success = 0;
    let tooMany = 0;
    for (let i = 1; i <= ATTEMPTS; i++) {
      const r = await uploadReport(token, i);
      if (r.ok) {
        success++;
        console.log(`[rate] Upload ${i} OK`);
      } else if (r.status === 429) {
        tooMany++;
        console.log(`[rate] Upload ${i} hit rate limit (429)`);
      } else {
        console.log(`[rate] Upload ${i} failed ${r.status}`, r.data);
        process.exit(1);
      }
    }

    if (tooMany > 0) {
      console.log(`[rate] PASSED: Hit rate limit as expected after ~${LIMIT} uploads. Success=${success}, 429s=${tooMany}`);
      process.exit(0);
    } else {
      console.log(`[rate] FAILED: Did not hit rate limit. Success=${success}`);
      process.exit(1);
    }
  } catch (e) {
    console.error('[rate] Error:', e.message);
    process.exit(1);
  }
})();
