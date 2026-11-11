# TrackIt runbook

## Deploy (Cloud Run + MongoDB Atlas)

1. **Atlas:** M10+ cluster (replica set, continuous backups on), IP access list restricted to the Cloud Run egress (Serverless VPC connector + Cloud NAT static IP), a dedicated DB user with `readWrite` on `trackit`.
2. **Secrets** (Secret Manager → env): `MONGODB_URI`, `NEXTAUTH_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`; plain env: `NEXTAUTH_URL`, `APP_URL`, `NOTIFIER=resend`, `NOTIFY_FROM`, `SUPPORT_EMAIL`, `APP_TIMEZONE`, optionally `REDIS_URL` (Memorystore) and `MONGODB_READ_PREFERENCE=secondaryPreferred`.
3. `gcloud run deploy trackit --source . --min-instances=1 --max-instances=10 --concurrency=80 --cpu=1 --memory=512Mi`
   - Cloud Run's front end is the load balancer; instances are stateless (JWT sessions, shared Redis when >1 instance).
4. Indexes build automatically on startup. On the **first** deploy over the pre-refactor database, also run `curl -X POST -H "Authorization: Bearer $CRON_SECRET" $APP_URL/api/internal/db-indexes` once to drop obsolete indexes (startup never drops indexes).
5. **Cloud Scheduler:** `POST /api/internal/jobs` every minute; `POST /api/internal/expiry-scan` daily at 07:00 local, both with the bearer header.
6. Uptime check on `/api/health` (alert on 2 consecutive failures).

### First-time migration from the pre-refactor database
- Run `/api/internal/db-indexes` once: it drops the old globally-unique `barcode_1` index (blocked two stores stocking the same item) and builds the new per-store indexes.
- Existing users/products/purchases are compatible; new fields (`notificationSettings`, `budget`) get defaults on read/write.
- **Rotate the Atlas password that was committed to git history**, and update `MONGODB_URI`.

## Health & signals

| Signal | Where | Action threshold |
|---|---|---|
| `/api/health` 503 | uptime check | page on-call |
| `request failed` logs with `status >= 500` | log explorer (`jsonPayload.level="error"`) | > 1% of requests over 5 min |
| `login rate limited` warnings | logs | spike → possible credential stuffing; consider blocking IP at LB |
| Job queue `dead` count | `POST /api/internal/jobs` response `queue.dead` | > 0 → inspect `jobs` collection `lastError` |
| p95 latency | Cloud Run metrics | > 800 ms sustained |

Every log line is JSON with `requestId`; responses return it in `x-request-id` for correlation.

## Common incidents

**Sales fail with 503 "Database must run as a replica set"** — the URI points at a standalone mongod. Use Atlas or `start-mongodb.bat` (replica set).

**Login always says "Too many attempts"** — the per-account limit (5/15 min) or per-IP limit (30/15 min) tripped. Wait for the window or, with Redis, `DEL trackit:rl:login:<email>:*`. If every user is limited from one IP, check that the LB sets `X-Real-IP`/`X-Forwarded-For` correctly.

**Expiry emails not arriving** — check `jobs` collection: `status: "dead"` with `lastError` (provider 4xx = bad API key/from address). Fix config, then reset: `db.jobs.updateMany({status:"dead"},{$set:{status:"pending",attempts:0,runAt:new Date()}})`.

**Stale dashboard numbers across instances** — expected up to 60 s with the in-memory cache when running >1 instance. Set `REDIS_URL` for shared cache invalidation.

**Database unavailable** — app returns 503 quickly (10 s server-selection timeout), health goes red; Atlas failover is automatic (retryable writes on). No data is written outside transactions for sales.

## Backups & restore
Atlas continuous backup (point-in-time, 7 days for the pilot). Quarterly restore drill into a scratch cluster; verify with `npm run test:smoke` pointed at a staging deploy.

## Data retention
Completed jobs auto-expire after 7 days (TTL index). Purchases are retained; delete a customer's data on request via `db.users.deleteOne` + `db.purchases.deleteMany({customerId})`.
