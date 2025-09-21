/*
  Smoke test for download headers on /medical-reports/{id}/download
  Steps:
    1) Sign up a random user and login
    2) Upload a tiny PNG as a medical report
    3) Download the report and validate security/cache headers and filename
  Usage:
    API_BASE_URL=http://localhost:8080 node scripts/smoke-download-headers.mjs
  Requires: Node 18+ (global fetch/FormData/Blob)
*/

const BASE = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080';

function randEmail() {
  const n = Math.floor(Math.random() * 1e9);
  return `dl_${n}@example.com`;
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
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

async function get(path, token, asBlob = false) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const headers = res.headers;
  let body;
  if (asBlob) {
    body = await res.arrayBuffer();
  } else {
    const text = await res.text();
    try { body = text ? JSON.parse(text) : undefined; } catch { body = { raw: text }; }
  }
  return { ok: res.ok, status: res.status, headers, body };
}

function tinyPngBlob() {
  // PNG signature (8 bytes) — enough to detect type server-side
  const bytes = new Uint8Array([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  return new Blob([bytes], { type: 'image/png' });
}

(async () => {
  console.log(`[dl] Using API base: ${BASE}`);
  const email = randEmail();
  const password = 'StrongPwd1@';
  const phoneNumber = `+91${Math.floor(9000000000 + Math.random()*99999999).toString().padStart(10,'0')}`;

  try {
    // Signup + login with retries (to wait for backend DataInitializer)
    let token;
    for (let attempt = 1; attempt <= 18; attempt++) {
      const signup = await post('/auth/signup', {
        firstName: 'DL',
        lastName: 'Smoke',
        email,
        password,
        phoneNumber,
        role: 'PATIENT',
      });
      if (!signup.ok) {
        console.log(`[dl] Signup attempt ${attempt} failed: ${signup.status}`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      const login = await post('/auth/login', { email, password });
      if (login.ok && login.data?.accessToken) {
        token = login.data.accessToken;
        break;
      } else {
        console.log(`[dl] Login attempt ${attempt} failed: ${login.status}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    if (!token) throw new Error('Unable to signup/login after retries');

    // Upload tiny PNG report
    const form = new FormData();
    const originalName = 'tiny_download.png';
    form.append('file', tinyPngBlob(), originalName);
    const reportMeta = {
      title: 'Download Header Test',
      description: 'Verifying headers',
      reportType: 'OTHER',
      shareWithDoctor: false,
    };
    form.append('report', new Blob([JSON.stringify(reportMeta)], { type: 'application/json' }));

    const up = await post('/medical-reports/upload', form, token);
    if (!up.ok || !up.data?.id) throw new Error(`Upload failed: ${up.status} ${JSON.stringify(up.data)}`);
    const reportId = up.data.id;
    console.log('[dl] Uploaded report id:', reportId);

    // Download and validate headers
    const dl = await get(`/medical-reports/${reportId}/download`, token, true);
    if (!dl.ok) throw new Error(`Download failed: ${dl.status}`);

    const h = dl.headers;
    const contentType = h.get('content-type') || '';
    const dispo = h.get('content-disposition') || '';
    const cacheControl = h.get('cache-control') || '';
    const pragma = h.get('pragma') || '';
    const expires = h.get('expires') || '';
    const nosniff = h.get('x-content-type-options') || '';

    let ok = true;

    // Content type: allow either detected image/* or safe fallback
    if (!(contentType.startsWith('image/') || contentType === 'application/octet-stream')) {
      console.error('[dl] Unexpected content-type:', contentType);
      ok = false;
    }

    // Content-Disposition must be attachment and include the original filename
    if (!/attachment/i.test(dispo)) {
      console.error('[dl] Missing attachment in content-disposition:', dispo);
      ok = false;
    }
    if (!dispo.includes('filename="') || !dispo.includes('tiny_download.png')) {
      console.error('[dl] Filename not preserved in content-disposition:', dispo);
      ok = false;
    }

    // Cache headers
    if (!/no-store/i.test(cacheControl)) {
      console.error('[dl] Cache-Control missing no-store:', cacheControl);
      ok = false;
    }
    if (!/no-cache/i.test(pragma)) {
      console.error('[dl] Pragma missing no-cache:', pragma);
      ok = false;
    }
    if (expires !== '0') {
      console.error('[dl] Expires not 0:', expires);
      ok = false;
    }

    // X-Content-Type-Options: nosniff
    if (nosniff.toLowerCase() !== 'nosniff') {
      console.error('[dl] X-Content-Type-Options not nosniff:', nosniff);
      ok = false;
    }

    // Body present
    if (!dl.body || dl.body.byteLength === 0) {
      console.error('[dl] Empty body in download');
      ok = false;
    }

    if (ok) {
      console.log('[dl] PASSED: Download headers and filename validated.');
      process.exit(0);
    } else {
      console.error('[dl] FAILED: One or more validations failed.');
      process.exit(1);
    }
  } catch (e) {
    console.error('[dl] Error:', e.message);
    process.exit(1);
  }
})();
