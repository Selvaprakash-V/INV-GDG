# TrackIt runbook

## Pilot go-live checklist

Tick every line before the first pilot store signs in.

- [ ] Atlas password rotated (the old one is in git history), network access restricted, dedicated `readWrite` DB user
- [ ] Vercel env vars set (table below) for **Production**
- [ ] Redeployed after setting env vars (Vercel only applies them to new deployments)
- [ ] `GET /api/health` → `200`, `checks.db: "ok"`, `config.notifier: "resend"`, `config.cronSecretSet: true`
- [ ] `POST /api/internal/db-indexes` run once against the existing database
- [ ] Email sending verified: use "Forgot password?" on your own account and receive the link
- [ ] Vercel Cron jobs visible under Project → Settings → Cron Jobs
- [ ] Atlas backups on; one test restore done
- [ ] Uptime monitor on `/api/health`; Sentry DSN set (optional but recommended)
- [ ] `/privacy` and `/terms` reviewed; `LEGAL_ENTITY_NAME` and `SUPPORT_EMAIL` set
- [ ] Pilot store admins registered, then `ALLOW_ADMIN_SIGNUP=false`
- [ ] Clicked through: sign up, add product, record sale, customer history, password reset, account deletion

## Deploy on Vercel (primary)

Pushing to `main` deploys to production automatically (Vercel Git integration). PRs get preview deployments.

| Variable | Value | Notes |
|---|---|---|
| `MONGODB_URI` | Atlas SRV URI with the **new** password, database `trackit` | Atlas clusters are replica sets (needed for sales transactions) |
| `MONGODB_MAX_POOL_SIZE` | `5` | Many serverless instances × pool size must stay under the Atlas connection limit |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Changing it signs everyone out |
| `NEXTAUTH_URL`, `APP_URL` | `https://<your-domain>` | Used in emailed links |
| `CRON_SECRET` | `openssl rand -hex 24` | Vercel Cron sends it automatically as `Authorization: Bearer` |
| `NOTIFIER` | `resend` | `console` writes emails, including reset links, to the logs |
| `RESEND_API_KEY` | from Resend | Domain must be verified in Resend |
| `NOTIFY_FROM` | `TrackIt <alerts@your-domain>` | Must be on the verified domain |
| `SUPPORT_EMAIL` | your support inbox | Contact form + legal pages |
| `LEGAL_ENTITY_NAME` | your legal name | Shown on /privacy and /terms |
| `ALLOW_ADMIN_SIGNUP` | `true` → `false` after onboarding | |
| `REQUIRE_EMAIL_VERIFICATION` | `false` (or `true` once email works) | Needs `NOTIFIER=resend` |
| `SENTRY_DSN` | optional | Server error tracking, PII off |
| `APP_TIMEZONE` | `Asia/Kolkata` | Day boundaries for digests and charts |

Set the function region close to the Atlas region (Project → Settings → Functions), e.g. `bom1` for Atlas `ap-south-1`.

**Cron (`vercel.json`)**: `/api/internal/expiry-scan` daily 03:30 UTC (09:00 IST) and `/api/internal/jobs` daily 04:00 UTC. Hobby plans allow daily schedules only; that is enough because emails are also sent right after each request (`after()`), and any API traffic drains due retries at most once a minute per instance. On Pro, change the jobs schedule to `*/5 * * * *` for faster retries.

**Redis**: optional on Vercel at pilot scale. Without it each instance has its own cache (up to 60 s staleness across instances) and its own rate-limit counters. For stricter limits use a managed Redis (e.g. Upstash) and set `REDIS_URL`.

## Deploy on Cloud Run (alternative)

1. Atlas M10+ with the IP access list restricted to the Cloud Run egress (VPC connector + Cloud NAT static IP).
2. Same variables as above via Secret Manager; optionally `REDIS_URL` (Memorystore) and `MONGODB_READ_PREFERENCE=secondaryPreferred`.
3. `gcloud run deploy trackit --source . --min-instances=1 --max-instances=10 --concurrency=80 --cpu=1 --memory=512Mi`
4. Cloud Scheduler: `POST /api/internal/jobs` every minute; `POST /api/internal/expiry-scan` daily 09:00 local; both with the bearer header.

`docker-compose.yml` runs the same topology locally (Mongo replica set, Redis, 2 app replicas behind nginx, scheduler).

### First-time migration from the pre-refactor database
- Run `curl -X POST -H "Authorization: Bearer $CRON_SECRET" $APP_URL/api/internal/db-indexes` once: it drops the old globally-unique `barcode_1` index and builds the per-store and new collection indexes (startup never drops indexes).
- Existing users count as email-verified (the field is absent), so `REQUIRE_EMAIL_VERIFICATION=true` never locks them out.
- New fields (`notificationSettings`, `budget`) get defaults on read/write.

## Health & signals

| Signal | Where | Action threshold |
|---|---|---|
| `/api/health` 503 | uptime monitor | page on-call |
| `/api/health` `config` | same response | notifier/cron/flags as expected after each env change |
| Errors | Sentry (if `SENTRY_DSN`) or logs with `"level":"error"` | > 1% of requests over 5 min |
| `login rate limited` warnings | logs | spike → possible credential stuffing |
| Job queue `dead` count | `POST /api/internal/jobs` → `queue.dead` | > 0 → inspect `jobs.lastError` |
| p95 latency | Vercel / Cloud Run metrics | > 800 ms sustained |

Every log line is JSON with `requestId`; responses carry it in `x-request-id`.

## Common incidents

**Users don't receive reset / confirmation emails** — `GET /api/health` → `config.notifier` must be `resend`. Then check `jobs` for `status: "dead"` with `lastError` (4xx = bad API key or unverified sender domain). Fix, then retry: `db.jobs.updateMany({status:"dead"},{$set:{status:"pending",attempts:0,runAt:new Date()}})`.

**Someone is signed out with "your password was changed"** — expected after a password reset/change on another device. Deleted accounts get the same treatment.

**Sales fail with 409 PRODUCT_EXPIRED** — working as intended: the product's expiry date has passed. Correct the date if it was entered wrongly.

**Sales fail with 503 "Database must run as a replica set"** — the URI points at a standalone mongod. Use Atlas or `start-mongodb.bat`.

**Login always says "Too many attempts"** — per-account (5/15 min) or per-IP (30/15 min) limit. A password reset clears the per-account lockout. With Redis: `DEL trackit:rl:login:<email>:*`.

**Too many database connections (Atlas alert)** — lower `MONGODB_MAX_POOL_SIZE` (5 on Vercel) or upgrade the cluster tier.

**Database unavailable** — app returns 503 within 10 s and health goes red; Atlas failover is automatic.

## Backups & restore
Atlas continuous backup (point-in-time; at least 7 days for the pilot). Do one restore into a scratch cluster before go-live and quarterly after, then run `npm run test:smoke` against a deployment pointed at it.

## Data requests
Users export their data and delete their accounts themselves on `/account`. Deleting a store admin deactivates their products; sales records are kept but no longer link to a deleted person. Completed jobs expire after 7 days; reset/confirmation tokens after at most 48 hours (TTL indexes).

## Tests
- `npm test` — unit + integration (in-memory MongoDB replica set)
- `npm run build && npm run test:e2e` — Playwright browser flows + axe accessibility checks
- `BASE_URL=... npm run test:smoke` — API regression suite against any running deployment
