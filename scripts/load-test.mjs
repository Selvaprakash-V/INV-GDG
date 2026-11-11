#!/usr/bin/env node
// Lightweight load test (no extra deps). Seeds a store, then measures latency
// percentiles for hot read paths with N concurrent clients.
//   BASE_URL=http://localhost:3000 CONCURRENCY=50 REQUESTS=500 SEED=400 npm run load-test
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = Number(process.env.CONCURRENCY || 50);
const REQUESTS = Number(process.env.REQUESTS || 500);
const SEED = Number(process.env.SEED || 400);
const uniq = Date.now().toString(36);
const PASSWORD = 'Passw0rdXy';

const cookies = {};
const cookieHeader = () => Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
function keep(res) {
  for (const c of res.headers.getSetCookie?.() || []) {
    const [kv] = c.split(';');
    const i = kv.indexOf('=');
    cookies[kv.slice(0, i)] = kv.slice(i + 1);
  }
}
async function call(path, { method = 'GET', body, form } = {}) {
  const headers = { cookie: cookieHeader() };
  let payload;
  if (form) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(form).toString();
  } else if (body) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' });
  keep(res);
  await res.arrayBuffer();
  return res.status;
}

const email = `load_${uniq}@x.io`;
await call('/api/register', { method: 'POST', body: { fullName: 'Load', email, password: PASSWORD, confirmPassword: PASSWORD, role: 'Administrator', shopName: 'Load Shop' } });
const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: cookieHeader() } });
keep(csrfRes);
const { csrfToken } = await csrfRes.json();
await call('/api/auth/callback/credentials', { method: 'POST', form: { csrfToken, email, password: PASSWORD, json: 'true' } });

console.log(`Seeding ${SEED} products...`);
for (let i = 0; i < SEED; i += 25) {
  await Promise.all(
    Array.from({ length: Math.min(25, SEED - i) }, (_, j) =>
      call('/api/products', {
        method: 'POST',
        body: { name: `Item ${i + j}`, category: 'Dairy', price: 10, stock: 50, barcode: `L${uniq}${i + j}`, expiryDate: new Date(Date.now() + ((i + j) % 40) * 864e5).toISOString() },
      })
    )
  );
}

async function bench(label, path) {
  const latencies = [];
  let errors = 0;
  let next = 0;
  const t0 = performance.now();
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < REQUESTS) {
        next += 1;
        const s = performance.now();
        const status = await call(path);
        latencies.push(performance.now() - s);
        if (status !== 200) errors += 1;
      }
    })
  );
  const total = (performance.now() - t0) / 1000;
  latencies.sort((a, b) => a - b);
  const p = (q) => Math.round(latencies[Math.min(latencies.length - 1, Math.floor(q * latencies.length))]);
  console.log(`${label.padEnd(36)} rps=${(REQUESTS / total).toFixed(0).padStart(5)}  p50=${p(0.5)}ms  p95=${p(0.95)}ms  p99=${p(0.99)}ms  errors=${errors}`);
}

console.log(`\n${REQUESTS} requests @ concurrency ${CONCURRENCY}`);
await bench('GET /api/products (page of 20)', '/api/products?limit=20');
await bench('GET /api/analytics?type=inventory', '/api/analytics?type=inventory');
await bench('GET /api/analytics?type=predictive', '/api/analytics?type=predictive');
await bench('GET /api/health?probe=live', '/api/health?probe=live');
