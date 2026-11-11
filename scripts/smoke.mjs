#!/usr/bin/env node
// End-to-end regression suite against a running server.
// Replays every defect found in the evaluation and asserts it is fixed.
//   BASE_URL=http://localhost:3000 npm run test:smoke
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const uniq = Date.now().toString(36);
const results = [];

async function req(path, { method = 'GET', body, cookie, form, headers: extra = {} } = {}) {
  const headers = { ...extra };
  if (cookie) headers.cookie = cookie;
  let payload;
  if (form) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const t0 = performance.now();
  const r = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: r.status, json, text, headers: r.headers, ms: Math.round(performance.now() - t0) };
}

const jar = (res, j = {}) => {
  for (const c of res.headers.getSetCookie?.() || []) {
    const [kv] = c.split(';');
    const i = kv.indexOf('=');
    j[kv.slice(0, i)] = kv.slice(i + 1);
  }
  return j;
};
const cookieStr = (j) => Object.entries(j).map(([k, v]) => `${k}=${v}`).join('; ');

async function login(email, password) {
  const j = {};
  const csrf = await req('/api/auth/csrf');
  jar(csrf, j);
  const r = await req('/api/auth/callback/credentials', {
    method: 'POST',
    cookie: cookieStr(j),
    form: { csrfToken: csrf.json.csrfToken, email, password, json: 'true' },
  });
  jar(r, j);
  const s = await req('/api/auth/session', { cookie: cookieStr(j) });
  // With json=true NextAuth answers { url } instead of a redirect; the error rides in that URL.
  const target = r.json?.url || r.headers.get('location') || '';
  return { ok: Boolean(s.json?.user), cookie: cookieStr(j), user: s.json?.user, error: target ? new URL(target, BASE).searchParams.get('error') : null };
}

function check(name, pass, detail = '') {
  results.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const PASSWORD = 'Passw0rd!Xy'; // special chars are allowed now
const register = (name, role, shopName) =>
  req('/api/register', {
    method: 'POST',
    headers: { 'x-forwarded-for': `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
    body: { fullName: name, email: `${name}_${uniq}@x.io`, password: PASSWORD, confirmPassword: PASSWORD, role, shopName },
  });
const product = (name, barcode, stock = 10, days = 5, price = 100) => ({
  name,
  category: 'Dairy',
  price,
  stock,
  barcode,
  expiryDate: new Date(Date.now() + days * 864e5).toISOString(),
});

// ---------------- auth & accounts ----------------
const health = await req('/api/health');
check('health/readiness probe is green', health.status === 200 && health.json?.checks?.db === 'ok', JSON.stringify(health.json?.checks));

const regA = await register('admina', 'Administrator', 'Shop A');
check('register admin (special chars in password allowed)', regA.status === 201, `${regA.status} ${regA.json?.message || ''}`);
await register('adminb', 'Administrator', 'Shop B');
await register('cust', 'Customer');
const dup = await register('cust', 'Customer');
check('duplicate email rejected with 409', dup.status === 409);

const A = await login(`admina_${uniq}@x.io`, PASSWORD);
const B = await login(`adminb_${uniq}@x.io`, PASSWORD);
const C = await login(`cust_${uniq}@x.io`, PASSWORD);
check('login works for all roles', A.ok && B.ok && C.ok);

check('test-user backdoor removed', (await req('/api/create-test-user')).status === 404);

const victim = `cust_${uniq}@x.io`;
let lastError = null;
for (let i = 0; i < 6; i += 1) lastError = (await login(victim, `wrong${i}`)).error;
check('brute force is rate limited per account', lastError === 'RATE_LIMITED', `last error=${lastError}`);

// ---------------- route protection & headers ----------------
for (const page of ['/admin/dashboard', '/customer/dashboard', '/admin/record-sale']) {
  const r = await req(page);
  check(`anonymous ${page} redirected to login`, [302, 307].includes(r.status) && (r.headers.get('location') || '').includes('/login'), `${r.status}`);
}
const crossRole = await req('/admin/dashboard', { cookie: C.cookie });
check('customer cannot open admin pages', [302, 307].includes(crossRole.status) && (crossRole.headers.get('location') || '').includes('/customer/dashboard'));
for (const gone of ['/admindashboard', '/customerdashboard', '/login-test', '/chatbot-test', '/test']) {
  check(`debug page ${gone} removed`, (await req(gone)).status === 404);
}
const h = (await req('/login')).headers;
check('security headers present', ['content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy'].every((k) => h.get(k)));
check('x-powered-by removed', !h.get('x-powered-by'));

// ---------------- products ----------------
const bc = `BC${uniq}`;
const pA = await req('/api/products', { method: 'POST', cookie: A.cookie, body: product('Milk', bc) });
check('admin adds product', pA.status === 201, `${pA.status} ${pA.ms}ms`);
const pB = await req('/api/products', { method: 'POST', cookie: B.cookie, body: product('Milk', bc) });
check('same barcode allowed in another store', pB.status === 201);
const dupBc = await req('/api/products', { method: 'POST', cookie: A.cookie, body: product('Milk', bc) });
check('duplicate barcode in same store -> 409', dupBc.status === 409);
const zero = await req('/api/products', { method: 'POST', cookie: A.cookie, body: product('Zero', `${bc}z`, 0, 5, 0) });
check('stock 0 / price 0 accepted', zero.status === 201);
check('customer cannot add products', (await req('/api/products', { method: 'POST', cookie: C.cookie, body: product('X', `${bc}c`) })).status === 403);

const idA = pA.json?.product?.id;
const idB = pB.json?.product?.id;
check('anonymous product read -> 401', (await req(`/api/products/${idA}`)).status === 401);
check("admin cannot read another store's product", (await req(`/api/products/${idB}`, { cookie: A.cookie })).status === 404);
check('customer cannot list inventory', (await req('/api/products', { cookie: C.cookie })).status === 403);
const ma = await req(`/api/products/${idB}`, { method: 'PUT', cookie: B.cookie, body: { storeId: A.user.id, stock: 9 } });
check('mass assignment of storeId ignored', ma.status === 200 && ma.json?.product?.storeId === B.user.id);
const rx = await req(`/api/products?search=${encodeURIComponent('(')}`, { cookie: A.cookie });
check('regex metacharacters in search are safe', rx.status === 200);
const badDate = await req('/api/products?expiresFrom=abc', { cookie: A.cookie });
check('invalid filter -> 400 without internals', badDate.status === 400 && !/Cast|mongo/i.test(badDate.text));
check('operator injection keys ignored', (await req('/api/products?category[$ne]=x', { cookie: A.cookie })).status === 200);
const paged = await req('/api/products?limit=1', { cookie: A.cookie });
check('products are paginated', paged.json?.products?.length === 1 && paged.json?.pagination?.total >= 2);
check('page size is capped', (await req('/api/products?limit=5000', { cookie: A.cookie })).status === 400);

// ---------------- purchases ----------------
const custEmail = `cust_${uniq}@x.io`;
const neg = await req('/api/purchases', { method: 'POST', cookie: A.cookie, body: { customerEmail: custEmail, items: [{ productId: idA, quantity: -5 }] } });
const stockAfterNeg = (await req(`/api/products/${idA}`, { cookie: A.cookie })).json?.product?.stock;
check('negative quantity rejected, stock unchanged', neg.status === 400 && stockAfterNeg === 10, `status=${neg.status} stock=${stockAfterNeg}`);

const tamper = await req('/api/purchases', { method: 'POST', cookie: A.cookie, body: { customerEmail: custEmail, totalAmount: 1, items: [{ productId: idA, quantity: 2 }] } });
check('total computed server-side', tamper.status === 201 && tamper.json?.purchase?.totalAmount === 200, `total=${tamper.json?.purchase?.totalAmount}`);
check('unknown customer rejected', (await req('/api/purchases', { method: 'POST', cookie: A.cookie, body: { customerEmail: 'ghost@x.io', items: [{ productId: idA, quantity: 1 }] } })).status === 404);

const before = (await req(`/api/products/${idA}`, { cookie: A.cookie })).json.product.stock;
const partial = await req('/api/purchases', {
  method: 'POST',
  cookie: A.cookie,
  body: { customerEmail: custEmail, items: [{ productId: idA, quantity: 1 }, { productId: idB, quantity: 1 }] },
});
const afterPartial = (await req(`/api/products/${idA}`, { cookie: A.cookie })).json.product.stock;
check('multi-item sale is atomic', partial.status === 404 && before === afterPartial, `${before} -> ${afterPartial}`);

const race = await req('/api/products', { method: 'POST', cookie: A.cookie, body: product('Race', `${bc}r`, 3) });
const rid = race.json?.product?.id;
const raceRes = await Promise.all(Array.from({ length: 12 }, () => req('/api/purchases', { method: 'POST', cookie: A.cookie, body: { customerEmail: custEmail, items: [{ productId: rid, quantity: 1 }] } })));
const finalStock = (await req(`/api/products/${rid}`, { cookie: A.cookie })).json?.product?.stock;
const ok = raceRes.filter((r) => r.status === 201).length;
check('no overselling under concurrency', ok === 3 && finalStock === 0, `${ok} succeeded, stock=${finalStock}`);

const page1 = await req('/api/purchases?limit=2', { cookie: A.cookie });
const page2 = await req(`/api/purchases?limit=2&cursor=${page1.json?.pagination?.nextCursor}`, { cookie: A.cookie });
const ids = [...(page1.json?.purchases || []), ...(page2.json?.purchases || [])].map((p) => p.id);
check('purchases use cursor pagination', page1.json?.pagination?.hasNext && new Set(ids).size === ids.length && ids.length === 4);
const custList = await req('/api/purchases', { cookie: C.cookie });
check('customer sees own purchases with store name', custList.json?.purchases?.[0]?.store?.shopName === 'Shop A');

// ---------------- analytics & settings ----------------
for (const type of ['inventory', 'sales', 'expiry', 'predictive']) {
  const r = await req(`/api/analytics?type=${type}&period=daily`, { cookie: A.cookie });
  check(`admin analytics: ${type}`, r.status === 200, `${r.ms}ms`);
}
const sales = await req('/api/analytics?type=sales&period=daily', { cookie: A.cookie });
check('sales revenue matches server prices', sales.json?.totalOrders === 4 && sales.json?.totalRevenue === 500, `orders=${sales.json?.totalOrders} revenue=${sales.json?.totalRevenue}`);
const cExp = await req('/api/analytics?type=expiry', { cookie: C.cookie });
check('customer expiry alerts include store name', cExp.json?.expiringItems?.[0]?.storeName === 'Shop A');
check('role-inappropriate analytics rejected', (await req('/api/analytics?type=predictive', { cookie: C.cookie })).status === 400);
const patch = await req('/api/me/settings', { method: 'PATCH', cookie: A.cookie, body: { notificationSettings: { expiryThresholdDays: 3 } } });
const settings = await req('/api/me/settings', { cookie: A.cookie });
check('notification settings persisted server-side', patch.status === 200 && settings.json?.settings?.notificationSettings?.expiryThresholdDays === 3);

// ---------------- internal endpoints ----------------
check('cron endpoints reject missing secret', (await req('/api/internal/jobs', { method: 'POST' })).status === 401);
if (process.env.CRON_SECRET) {
  const scan = await req('/api/internal/expiry-scan', { method: 'POST', headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
  check('expiry scan enqueues and drains digests', scan.status === 200 && scan.json?.result?.enqueued >= 1, JSON.stringify(scan.json?.result));
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
