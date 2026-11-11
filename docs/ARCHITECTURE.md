# TrackIt architecture

This document walks the system through the 12-step HLD process, then maps the low-level design (patterns, SOLID, refactorings) to code.

---

## Step 1 — Requirements

### Functional
| # | Requirement | Where |
|---|---|---|
| F1 | Customers and store administrators register, log in, log out | `/api/register`, NextAuth, `LogoutButton` |
| F2 | Admins manage products (add, edit, soft-delete) with category, price, stock, expiry, barcode (unique per store) | `ProductService` |
| F3 | Admins browse inventory with search, filters, sort, pagination | `GET /api/products` |
| F4 | Admins record sales to a registered customer; stock decrements atomically | `PurchaseService`, `/admin/record-sale` |
| F5 | Admins see inventory KPIs, expiry calendar, expiry alerts, sales trends | `analytics: inventory, sales, expiry` |
| F6 | Admins get demand forecasts, expiry-risk scores and recommendations from real sales | `analytics: predictive` |
| F7 | Admins receive daily expiry digests and low-stock alerts by email; thresholds configurable | `NotificationService`, job queue, `/api/me/settings` |
| F8 | Customers see purchase history, spending trends per week/month and per store, items about to expire, and a saved budget | `analytics: spending, expiry`, `/api/purchases` |
| F9 | Signed-in users can use the embedded assistant (Jotform agent) | `ChatbotScript` |
| F10 | Users recover access (forgot/reset password), confirm their email, and change their password | `AccountService`, `/forgot-password`, `/reset-password`, `/verify-email`, `/account` |
| F11 | Users download all their data and delete their account; privacy policy and terms are published | `GET /api/me/export`, `DELETE /api/me`, `/privacy`, `/terms` |
| F12 | Expired products can never be sold, whatever the client sends | `ProductRepository.decrementStock` (`expiryDate > now`) |

### Non-functional targets (pilot)
| Quality | Target | Mechanism |
|---|---|---|
| Performance | p95 < 300 ms for reads at pilot load; no unbounded responses | DB-side aggregation, indexes, pagination, cache |
| Security | OWASP ASVS L1: authN, tenant isolation, input validation, rate limiting, secure headers, no secrets in code/logs | `withApi`, schemas, middleware, logger redaction |
| Availability | 99.5% monthly for the pilot; graceful degradation | stateless replicas behind LB, health probes, fail-open cache |
| Reliability | No lost or double stock updates; alerts eventually delivered | transactions, conditional updates, durable queue with retries |
| Maintainability | Layered, tested, linted, documented; CI gate | this doc, ADRs, Vitest, ESLint, GitHub Actions |
| Usability | Real data everywhere, clear errors, keyboard/screen-reader friendly controls; WCAG 2.1 AA automated checks | feature hooks, inline errors, aria labels, axe in CI |

## Step 2 — Estimate scale

| | Pilot (3 stores) | Design ceiling (500 stores) |
|---|---|---|
| Users | ~50 (6 admins, ~45 customers) | ~50k |
| Products | 15k (5k/store) | 2.5M |
| Sales | ~1k/day → 365k/yr | ~150k/day → 55M/yr |
| Peak read RPS | ~5 (≈50 with 10× burst) | ~500 |
| Peak write RPS | < 2 | ~20 |
| Storage | ~250 MB/yr incl. indexes | ~40 GB/yr |

Conclusion: the pilot fits comfortably on one small app instance + Atlas M10. The design keeps a clear path to the ceiling without rewrites: stateless app tier, tenant-prefixed indexes (`storeId` is also the natural shard key), cache and read-replica knobs, and a queue abstraction that can move to a managed broker.

## Step 3 — Major components

```
 Browser (React client pages, features/*)
     │  HTTPS (JWT session cookie)
     ▼
 Load balancer (Cloud Run front end / nginx in compose)  ── edge rate limit, TLS
     ▼
 Next.js app instances (stateless, N replicas)
   ├─ middleware.js          role-based page protection
   ├─ API routes → withApi    auth · rate limit · validation · errors · logs
   ├─ Services                Product · Purchase · User · Analytics(strategies) · Notification
   ├─ Repositories            Product · Purchase · User · Job
   ├─ EventBus (in-process)   product.changed · purchase.recorded · settings.changed
   └─ JobQueue worker         drained via after() and the scheduler
     │                 │                       │
     ▼                 ▼                       ▼
 MongoDB replica set   Redis (optional)        Email provider (Resend)
 (primary + replicas)  cache + rate limits
     ▲
 Scheduler (Cloud Scheduler / compose sidecar) → /api/internal/jobs, /expiry-scan
```

## Step 4 — Data flow

**Record a sale** (`POST /api/purchases`)
1. `withApi`: session → role Administrator → write rate limit → DB connection.
2. `purchaseCreateSchema` validates (quantities ≥ 1, ObjectIds, whitelist).
3. Customer resolved by email (must be a Customer account).
4. Transaction: for each merged line `findOneAndUpdate({_id, storeId, stock ≥ q}, {$inc: -q})`; any miss aborts everything. Prices come from the DB. Purchase inserted with server-computed total.
5. Emit `purchase.recorded` → invalidate store + customer cache namespaces; enqueue low-stock job if any item < threshold; `after()` drains the queue once the response is sent.

**Dashboard read** (`GET /api/analytics?type=inventory`)
`withApi` → `AnalyticsService` picks the strategy for `(Administrator, inventory)` → `cache.wrap(store:<id>, key, 30–60 s)` → on miss one `$facet` aggregation on the replica-preferred connection → JSON (a few KB, independent of inventory size).

**Expiry digest**
Scheduler → `/api/internal/expiry-scan` → stream admins with digests on → per store count expiring products → `enqueue('expiry.digest', dedupeKey=store+day)` → drain → `notifier.send` → retries with backoff → dead-letter after 5 attempts.

## Step 5 — Choose database

**MongoDB (Atlas replica set)**, kept from the original build:
- Document model fits products and purchases-with-embedded-line-items (one read per receipt).
- Multi-document ACID transactions (replica set) for sales; conditional atomic updates for stock.
- Aggregation pipeline for analytics in the database; `$facet` gives the whole dashboard in one round trip.
- Built-in replicas for HA and read scaling; `storeId` prefix on every index gives a ready shard key.
The unused Prisma/PostgreSQL scaffold was removed to avoid two sources of truth.

## Step 6 — Add cache

Cache-aside via `CacheService` over a `CacheStore` interface (in-memory LRU or Redis). Namespaced per tenant; invalidated by domain events through a version counter (O(1), no key scans); single-flight stampede protection; fail-open. TTLs: product 300 s, analytics 60 s, settings 300 s. Static assets get immutable caching at the LB. See ADR 0003.

## Step 7 — Add load balancing

App instances hold no session state (JWT cookies), no in-memory queues that matter (queue is durable in MongoDB), and share cache/rate limits through Redis — so any instance can serve any request.
- **Cloud Run:** managed LB + autoscaling (min 1, max 10, concurrency 80).
- **Compose:** nginx `least_conn` over 2 replicas with re-resolving upstream, passive health (`max_fails`), retry on 502/503, edge rate limit, gzip.
- `/api/health` (readiness: DB + cache) and `?probe=live` (liveness) for LB and orchestrator probes.

## Step 8 — Add messaging

- **In-process events** (`EventBus`, observer) decouple services from side effects (cache invalidation, alert enqueueing).
- **Durable job queue** in MongoDB for anything slow or failure-prone (emails): atomic claim, lock expiry for crash recovery, exponential backoff capped at 1 h, dead-letter, idempotent `dedupeKey`, TTL cleanup. Trigger: `after()` right after the response, an opportunistic sweep from API traffic (at most once a minute per instance), plus the platform scheduler (Vercel Cron daily on Hobby, Cloud Scheduler every minute on Cloud Run).
- **Account emails** (reset, confirmation) are jobs that carry only the `userId`; the handler issues the single-use token at send time, so no raw token is ever persisted. See ADR 0002 for the broker trade-off.

## Step 9 — Handle failures

| Failure | Behaviour |
|---|---|
| DB unreachable | 10 s server-selection timeout → 503 `SERVICE_UNAVAILABLE`; readiness probe fails so the LB drains the instance; connection promise resets for retry |
| Concurrent sales on the same stock | conditional decrement + transaction retry on transient errors; never negative stock |
| Mid-sale error (unknown product, insufficient stock) | transaction aborts; nothing written |
| Not a replica set | explicit 503 with a fix-it message (no silent partial writes) |
| Redis down | cache and rate limiter fail open; app keeps serving from MongoDB |
| Email provider down | job retried with backoff, then dead-lettered and visible in `/api/internal/jobs` stats |
| Instance crash mid-job | job lock expires; another instance re-claims it (at-least-once; handlers idempotent) |
| Event subscriber throws | isolated and logged; the request still succeeds |
| Bad input | 400 with field details; never a 500 with stack/regex/cast messages |
| No email provider configured | console notifier writes messages to the log (operator can relay); `/api/health` shows `config.notifier` so it is caught at go-live |
| Unhandled server error | logged with request id and, if `SENTRY_DSN` is set, reported to Sentry (PII off) |

## Step 10 — Security

- **Secrets:** env only, validated at startup; no fallbacks (the old hardcoded Atlas URI and NextAuth secret are gone — rotate the leaked password).
- **AuthN:** bcrypt (12 rounds), generic login errors, JWT sessions (24 h), logout.
- **Account recovery:** reset/confirmation tokens are 256-bit random, stored as SHA-256 hashes with TTL indexes, single-use, newest-only, 30 min / 48 h lifetimes; forgot-password and resend never reveal whether an account exists; per-IP and per-address limits stop mailbox flooding; the token is stripped from the address bar and pages send no referrer.
- **Session revocation:** every authenticated API call checks the account still exists and the session's sign-in time (`authAt` claim, which survives JWT refresh unlike `iat`) is after the last password change. Cached per instance for 60 s and invalidated immediately on change; the client signs out on `SESSION_REVOKED`.
- **Optional email verification:** `REQUIRE_EMAIL_VERIFICATION=true` blocks unconfirmed accounts, revealed only after a correct password.
- **Brute force:** per-account (5/15 min) and per-IP (30/15 min) login limits; registration and write limits; nginx edge limit. Client IP from `X-Real-IP` / last XFF hop (not spoofable first hop).
- **AuthZ:** middleware protects `/admin/*` and `/customer/*` server-side; `withApi` enforces roles; repositories scope every query by `storeId`/`customerId` (cross-tenant reads return 404).
- **Input:** Zod schemas whitelist fields (no mass assignment), bound sizes, coerce types; regex input escaped; operator-style query keys dropped; prices/totals server-computed.
- **Transport/browser:** CSP (self + Jotform only), HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; `X-Powered-By` removed.
- **Logging:** structured JSON with recursive redaction of password/secret/token/cookie/authorization keys; request ids for audit.
- **Supply chain:** patched Next/NextAuth/Mongoose/Zod; `npm audit --omit=dev` = 0 vulnerabilities, enforced in CI; debug and test-user endpoints removed.
- **Admin onboarding:** `ALLOW_ADMIN_SIGNUP=false` makes store-admin accounts invite-only for the pilot.

## Step 11 — Identify bottlenecks

| Bottleneck (before) | Fix |
|---|---|
| Dashboard shipped the whole inventory to the browser and computed stats client-side | `$facet` aggregation + cache; payload is constant-size |
| Analytics loaded every purchase into Node memory and grouped in JS | grouping/bucketing in MongoDB (`$group`, `$dateToString`) |
| Purchases fetched products one by one (N+1) and checked stock non-atomically | one conditional update per line inside a transaction |
| Unbounded `GET /api/products` and `/api/purchases` | offset (products) and keyset (purchases) pagination, `limit ≤ 100` |
| Indexes didn't match queries (global barcode unique, unused text index, duplicate barcode index) | tenant-prefixed compound indexes matching each query shape |
| Repeated identical dashboard queries | cache-aside with event invalidation + single-flight |
| Analytics competing with writes on the primary | `MONGODB_READ_PREFERENCE=secondaryPreferred` for read-heavy repositories |
| Emails sent inline | async job queue |
| Large client bundles | removed 6 unused deps, `optimizePackageImports` for lucide/recharts/date-fns/framer-motion, split components |

Remaining known limits: offset pagination beyond ~10k products per store; memory cache is per-instance unless Redis is configured; MongoDB queue throughput (see ADR 0002).

## Step 12 — Trade-offs

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Monolith vs services | Modular monolith (layers inside Next.js) | Microservices | Pilot scale; one deploy; module boundaries allow later extraction |
| Queue | MongoDB collection | Pub/Sub / SQS / RabbitMQ | No new infra; swap behind `JobQueue` when volume demands |
| Cache | Memory by default, Redis when scaled | Always Redis | Zero-dependency dev/pilot; Redis required for >1 instance (documented) |
| Consistency | Strong for stock (primary + txn); eventual (≤60 s) for dashboards | Strong everywhere | Dashboards tolerate staleness; enables replicas + caching |
| Forecasting | Transparent moving-average heuristic | ML service | Explainable, no training data yet; labelled honestly in the UI |
| Sessions | Stateless JWT + cached revocation check | DB sessions / pure JWT | No sticky sessions; deletion and password changes take effect within 60 s everywhere (immediately on the same instance) for one cached lookup per request |
| Account deletion | Delete person, keep sales unlinked | Hard-delete everything | Stores keep their books; the customer's name and email are gone |
| Error tracking | Sentry server-side only, opt-in | Browser SDK too | No client bundle or CSP cost; server errors are where the risk is |
| Pagination | Offset (products) + keyset (purchases) | One style everywhere | Page numbers where data is bounded, stable cursors where it's unbounded |
| Framework version | Next 15.5 (patched) | Next 16 | Lower-risk upgrade for the pilot; revisit post-pilot |

---

## Low-level design

### Design patterns
| Pattern | Where | Purpose |
|---|---|---|
| Singleton | `db/connection.js`, `getContainer()` | one connection pool / one object graph per process (HMR-safe) |
| Factory | `createCacheStore`, `createNotifier`, `createContainer` | choose implementation from config |
| Strategy | analytics strategies, notifiers, job handlers | interchangeable algorithms selected at runtime |
| Observer | `EventBus` + subscribers in the container | side effects decoupled from use-cases |
| Repository | `repositories/*` | isolate persistence, enforce tenant scoping |
| Decorator | `withApi(handler, options)` | cross-cutting concerns around route handlers |
| Dependency Injection / Composition Root | `container.js` | wiring in one place; test overrides |
| Cache-aside + Single-flight | `CacheService.wrap` | read performance without stampedes |
| Template (registry dispatch) | `AnalyticsService.run` | common flow (validate → cache → execute), strategy-specific step |
| Iterator (async generator) | `AccountService.exportData` | stream a store's export in constant memory |

### SOLID
- **S** — routes (transport), services (use-cases), repositories (persistence), strategies (one report each), UI hooks vs presentational components.
- **O** — new analytics type / job type / notifier / cache backend = new class registered in the container; no edits to dispatch code.
- **L** — `MemoryCacheStore` and `RedisCacheStore` are interchangeable behind `CacheStore`; `ConsoleNotifier`/`ResendNotifier` behind `send()`; all `AppError` subclasses render via `toResponseBody()`.
- **I** — small interfaces: `CacheStore {get,set,del,incr,ping}`, notifier `{send}`, strategy `{role,type,execute}`, repositories per aggregate.
- **D** — services receive repositories/cache/events/clock via constructors; only `container.js` imports concrete classes.

### Refactoring catalogue (applied)
| Technique | Example |
|---|---|
| Extract Method | `mergeLines`, `linearForecast`, `buildRecommendations`, `fillSeries`, `translateDuplicate`, `clientIp` |
| Extract Class | `PurchaseService`, `ProductRepository`, `CacheService`, `RateLimiter`, `JobQueue`, `NotificationService`, UI feature hooks/components |
| Move Method | stock/expiry logic from route handlers and React components into services and `shared/expiry.js` |
| Replace Conditional with Polymorphism | `AppError` hierarchy (status per class); analytics strategy registry replaces nested `if role / if type`; job handler registry |
| Replace Conditional with Lookup Table | `PERIODS` / unit builders replace duplicated `switch(period)`; `SORTS`; `ROLE_FOR_PREFIX`; `ROLE_HOME` |
| Introduce Interface | `CacheStore`, notifier, analytics strategy, repository contracts (JSDoc typedefs) |
| Replace Magic Number with Constant | `shared/constants.js` (`EXPIRY`, `STOCK_LEVELS`, `LIMITS`, `PAGINATION`), `server/config/constants.js` (`RATE_LIMITS`, `CACHE_TTL_SECONDS`, `JOBS`, `PREDICTION`, `AUTH`) |
| Simplify Conditional Logic | guard clauses in `expiryStatus`, `withApi`; status precedence made explicit |
| Introduce Parameter Object | `list({ storeId, page, limit, ... })`, analytics `ctx` |
| Replace Error Code with Exception | services throw typed errors; one mapper produces responses |
| Extract Class (account lifecycle) | `AccountService` split from `UserService` (sign-up/login/settings vs recovery/export/deletion); `emailTemplates.js` |
| Extract Component | `SiteFooter` replaces five copy-pasted footers; `LegalPage`; `useApiAll` / `useExpiryPage` hooks |
| Remove Dead Code | 3 connection modules → 1; duplicate layouts/components, test pages, mock dashboards, unused Prisma schema and 6 unused dependencies deleted |
| Decompose Conditional / Consolidate Duplicate Fragments | shared `ProductForm` for add/edit, shared signup logic |

## Measured results (2026-11-11, after pilot hardening)

| Check | Result |
|---|---|
| `npm audit --omit=dev` | 0 vulnerabilities |
| `eslint .` | 0 problems |
| `next build` | passes (41 routes) |
| Unit + integration tests | 80 passing (14 new for account lifecycle and expired-sale guard) |
| Browser tests (Playwright, Chromium) | 14 passing: sign-up → confirm email → reset password → export → delete; admin adds product → records sale → customer sees it; expired sale refused; protected routes redirect |
| Accessibility (axe, WCAG 2.1 A/AA) | 0 serious/critical violations on 18 screens incl. dashboards with data (fixed: low-contrast orange text, unlabeled and empty chart slices). The third-party Jotform widget is blocked in tests (it is not our markup and has one critical issue: an unlabeled voice button) |
| API smoke suite | 48/48 |

Load test, same laptop, in-memory-server MongoDB 8.2 replica set (not identical to the earlier run's local mongod, so compare loosely):

| Endpoint | 1 client p50 / p95 | 50 clients rps · p95 |
|---|---|---|
| `GET /api/products` | 6 / 9 ms | 231 · 294 ms |
| `GET /api/analytics?type=inventory` | 6 / 8 ms | 315 · 197 ms |
| `GET /api/analytics?type=predictive` | 6 / 8 ms | 352 · 186 ms |
| `GET /api/health?probe=live` (framework floor) | 5 / 6 ms | 314 · 207 ms |

The per-request session check added no measurable latency (it is a cache hit after the first request per user per minute).

## Measured results (2026-11-11, first refactor)

Environment: one Node process (standalone production build) on a Windows 11 laptop, local single-node MongoDB 8.2 replica set, in-memory cache, load generator on the same machine.

| Check | Result |
|---|---|
| `npm audit --omit=dev` | 0 vulnerabilities (was 10: 3 critical, 6 high) |
| `eslint .` | 0 errors, 0 warnings (ESLint previously not installed; `.jsx` files were silently unlinted) |
| `next build` | passes (previously failed on a type error) |
| Unit + integration tests | 66 passing; ~80% line coverage of `src/server` + `src/shared` |
| End-to-end smoke (`scripts/smoke.mjs`) | 48/48 checks, every defect from the evaluation replayed and fixed |
| Plaintext passwords in server logs | 0 in 4,478 lines (previously logged on every register/login) |

**Latency, single client (pilot-like load):**

| Endpoint | p50 | p95 | Payload |
|---|---|---|---|
| `GET /api/products?limit=20` | 4.4 ms | 13.6 ms | 7.4 KB (was 141 KB for 400 rows, unpaginated) |
| `GET /api/analytics?type=inventory` | 5.2 ms | 9.4 ms | 2.3 KB (constant, any inventory size) |
| `GET /api/analytics?type=predictive` | 6.8 ms | 18.6 ms | 6.2 KB |

**Throughput, 50 concurrent clients, 1,000 requests, 400-product store, 0 errors:**

| Endpoint | Before optimisation pass | After (decode-only JWT + list cache) |
|---|---|---|
| `GET /api/products` | 96 rps · p95 713 ms | **189 rps · p95 345 ms** |
| `GET /api/analytics?type=inventory` | 193 rps · p95 353 ms | **222 rps · p95 300 ms** |
| `GET /api/analytics?type=predictive` | 216 rps · p95 328 ms | **236 rps · p95 262 ms** |
| `GET /api/health?probe=live` (framework floor) | 237 rps | 291 rps |

Reading: authenticated endpoints now run within ~35% of the framework's own per-request floor on this machine; latency under 50-way concurrency is queueing on one process. The next lever is horizontal (more instances behind the LB + Redis), not code. The original build measured p95 1,703 ms for the unpaginated list at the same concurrency (dev mode, so not a strict like-for-like comparison).

Concurrency correctness: 12 simultaneous sales of a 3-unit product → exactly 3 succeed, final stock 0 (was 6 succeeded, stock −3).
