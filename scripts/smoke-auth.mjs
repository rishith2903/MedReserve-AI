/*
  Smoke test for signup and login against a running backend.
  Usage:
    API_BASE_URL=http://localhost:8080 node scripts/smoke-auth.mjs
  Notes:
    - Requires Node 18+ (global fetch available).
    - Generates a random email to avoid duplicate issues.
*/

const BASE = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080';

function randEmail() {
  const n = Math.floor(Math.random() * 1e9);
  return `smoke_${n}@example.com`;
}

const email = randEmail();
const password = 'StrongPwd1@';
const newPassword = 'NewStrongPwd1@';
const phoneNumber = '+919876543210';

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

(async () => {
  console.log(`[smoke] Using API base: ${BASE}`);
  console.log(`[smoke] Creating user: ${email}`);

  const signupBody = {
    firstName: 'Smoke',
    lastName: 'Test',
    email,
    password,
    phoneNumber,
    role: 'PATIENT',
  };

  const s = await post('/auth/signup', signupBody);
  if (!s.ok) {
    console.error('[smoke] Signup failed', s.status, s.data);
    process.exit(1);
  }
  console.log('[smoke] Signup ok');

  // Login with initial password
  const l = await post('/auth/login', { email, password });
  if (!l.ok || !l.data?.accessToken) {
    console.error('[smoke] Login failed', l.status, l.data);
    process.exit(1);
  }
  console.log('[smoke] Login ok');

  const token = l.data.accessToken;
  const me = await get('/auth/me', token);
  if (!me.ok || !me.data?.email) {
    console.error('[smoke] /auth/me failed', me.status, me.data);
    process.exit(1);
  }
  console.log('[smoke] /auth/me ok for', me.data.email);

  // Change password
  const cp = await post('/auth/change-password', { currentPassword: password, newPassword }, token);
  if (!cp.ok) {
    console.error('[smoke] Change password failed', cp.status, cp.data);
    process.exit(1);
  }
  console.log('[smoke] Change password ok');

  // Login with new password
  const l2 = await post('/auth/login', { email, password: newPassword });
  if (!l2.ok || !l2.data?.accessToken) {
    console.error('[smoke] Re-login with new password failed', l2.status, l2.data);
    process.exit(1);
  }
  console.log('[smoke] Re-login with new password ok');

  console.log('[smoke] All good');
  process.exit(0);
})();
