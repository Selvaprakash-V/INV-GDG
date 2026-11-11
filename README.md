# TrackIt — supermarket inventory & expiry tracking

TrackIt helps store administrators track stock and expiry dates, record sales, get expiry/low-stock alerts and demand forecasts, and lets customers see their purchases, spending and items about to expire.

- **Stack:** Next.js 15 (App Router) · React 19 · MongoDB (Mongoose) · NextAuth (JWT) · Tailwind/Radix UI · optional Redis
- **Architecture:** layered (routes → services → repositories), DI composition root, event bus + durable job queue. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **API reference:** [docs/API.md](docs/API.md) · **Operations:** [docs/RUNBOOK.md](docs/RUNBOOK.md) · **Decisions:** [docs/adr/](docs/adr/)

## Quick start (local)

Prerequisites: Node 20.9+, MongoDB 7+ running as a **replica set** (sales are recorded in transactions).

```bash
npm ci
cp .env.example .env.local        # fill NEXTAUTH_SECRET (openssl rand -base64 32) and CRON_SECRET
start-mongodb.bat                 # Windows: starts mongod --replSet rs0 and initiates it
# macOS/Linux: mongod --replSet rs0 --dbpath ./data/db &  then  mongosh --eval "rs.initiate()"
npm run dev                       # http://localhost:3000
```

Register a store administrator at `/administratorsignup` and a customer at `/customersignup`.

### Production-like stack (load balancer, 2 replicas, Redis, scheduler)

```bash
cp .env.example .env              # set NEXTAUTH_SECRET and CRON_SECRET
docker compose up --build         # http://localhost:8080
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / production server |
| `npm run lint` | ESLint (Next.js core-web-vitals rules) |
| `npm test` | Unit + integration tests (spins up an in-memory MongoDB replica set) |
| `npm run test:coverage` | Tests with coverage for `src/server` and `src/shared` |
| `npm run test:smoke` | End-to-end regression suite against a running server (`BASE_URL`, optional `CRON_SECRET`) |
| `npm run load-test` | Latency percentiles for hot endpoints (`BASE_URL`, `CONCURRENCY`, `REQUESTS`, `SEED`) |

Tip (Windows/offline): set `MONGOMS_SYSTEM_BINARY` to your local `mongod.exe` so tests don't download MongoDB.

## Project layout

```
src/
  app/                 Next.js pages and thin API route handlers
  features/            UI feature modules (admin, customer, products, auth): hooks + components
  components/ui/       shadcn/Radix primitives
  lib/api-client.js    fetch wrapper + useApi hook
  shared/              constants and expiry logic shared by client and server
  server/
    config/            validated env + tunables (no magic numbers)
    core/              errors, logger (redacting), http decorator, rate limiter, pagination
    cache/             CacheStore interface (memory / Redis) + cache-aside service
    db/                connection singleton + Mongoose models
    repositories/      data access (tenant-scoped, atomic stock updates)
    services/          business use-cases; analytics strategies
    messaging/         EventBus (observer), JobQueue (durable, retries), notifiers
    container.js       composition root (dependency injection)
  middleware.js        role-based route protection
tests/                 unit + integration (Vitest, mongodb-memory-server)
scripts/               smoke + load tests
deploy/                nginx load balancer, scheduler
```

## Scheduled work

Call these with `Authorization: Bearer $CRON_SECRET` (Cloud Scheduler, Vercel Cron or the compose `scheduler`):

| Endpoint | Schedule | Purpose |
|---|---|---|
| `POST /api/internal/jobs` | every minute | drain the job queue (alerts, retries) |
| `POST /api/internal/expiry-scan` | daily, morning | enqueue one expiry digest per store (idempotent per day) |
| `POST /api/internal/db-indexes` | on each deploy | build declared indexes, drop obsolete ones |

## Security notes

- Secrets come only from the environment; the app refuses to start without them.
- **If you are upgrading from the pre-refactor code:** the old MongoDB Atlas password was committed to git history. Rotate it in Atlas and restrict network access; removing it from the code does not revoke it.
