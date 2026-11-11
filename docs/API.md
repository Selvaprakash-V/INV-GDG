# TrackIt HTTP API

All endpoints return JSON.

- Success: `{ "success": true, ...data }`
- Error: `{ "success": false, "code": "VALIDATION_ERROR", "message": "…", "details": { "field": "reason" } }`

| Status | `code` | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input failed validation; `details` maps field → message |
| 400 | `INVALID_TOKEN` | Reset / confirmation link unknown, used or expired |
| 401 | `UNAUTHORIZED` | No session (or bad cron secret) |
| 401 | `SESSION_REVOKED` | Account deleted, or password changed after this session signed in |
| 403 | `FORBIDDEN` | Wrong role / feature disabled |
| 404 | `NOT_FOUND` | Missing, or belongs to another store (indistinguishable by design) |
| 409 | `DUPLICATE`, `EMAIL_TAKEN`, `INSUFFICIENT_STOCK`, `PRODUCT_EXPIRED` | Conflict |
| 429 | `RATE_LIMITED` | Slow down; see `Retry-After` |
| 503 | `SERVICE_UNAVAILABLE` | Database unavailable / not a replica set |

Every response carries `x-request-id` (also in server logs) and `cache-control: no-store`.

## Auth

NextAuth credentials provider. `POST /api/auth/callback/credentials` (via `signIn('credentials', { email, password })`).
Errors: `INVALID_CREDENTIALS`, `RATE_LIMITED` (5 attempts / 15 min per account, 30 per IP), `EMAIL_NOT_VERIFIED` (only when `REQUIRE_EMAIL_VERIFICATION=true`, and only after a correct password). Sessions are JWT cookies (24 h); every API call also checks the account still exists and the session is newer than the last password change.

`POST /api/register` — `{ fullName, email, password, confirmPassword, role: "Customer" | "Administrator", shopName? }` → 201 `{ user }`.
Password: 8–128 chars with lowercase, uppercase and a digit. Rate limit: 10/hour per IP. A confirmation email is queued.

## Account (public)

| Endpoint | Body | Response |
|---|---|---|
| `POST /api/account/password/forgot` | `{ email }` | always 202 (never reveals whether the account exists) |
| `POST /api/account/password/reset` | `{ token, password, confirmPassword }` | 200; signs out older sessions, clears login lockout |
| `POST /api/account/verify-email` | `{ token }` | 200 `{ email }` |
| `POST /api/account/verify-email/resend` | `{ email }` | always 202 |

Links expire after 30 minutes (reset) / 48 hours (confirmation), work once, and only the newest link per purpose is valid. Limits: 10 requests/hour per IP, 3 emails/hour per address, 20 redemptions/15 min per IP.

## Me (any signed-in user)

| Endpoint | Body | Response |
|---|---|---|
| `GET /api/me` | — | `{ account: { id, fullName, email, role, shopName, emailVerified, createdAt } }` |
| `POST /api/me/password` | `{ currentPassword, password, confirmPassword }` | 200; other sessions signed out |
| `GET /api/me/export` | — | streamed JSON download: account, settings, and purchases (customer) or products + sales (admin) |
| `DELETE /api/me` | `{ password, confirmation: "DELETE" }` | 200; admin products deactivated, sales kept unlinked |

Limits: 10 password-confirmed actions / 15 min, 5 exports / hour.

## Products (Administrator, own store only)

`GET /api/products` — query: `page` (1), `limit` (20, max 100), `search`, `category`, `expiringWithinDays`, `expiresFrom`, `expiresTo`, `sort` = `newest|expiry|stock|name`
→ `{ products: [...], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`

`POST /api/products` — `{ name, description?, category, price, stock, expiryDate, barcode, image? }` → 201 `{ product }`. Barcodes are unique per store.

`GET | PUT | DELETE /api/products/:id` — `PUT` accepts any subset of the create fields; other keys are ignored. `DELETE` is a soft delete.

## Purchases

`GET /api/purchases` (Administrator: own store's sales; Customer: own purchases) — query: `limit` (20, max 100), `cursor`, `from`, `to`, `storeId` (customers only: narrow to one store)
→ `{ purchases: [{ id, receiptNumber, purchaseDate, paymentMethod, totalAmount, items: [{ productId, productName, quantity, price, expiryDate }], customer, store }], pagination: { limit, hasNext, nextCursor } }`.
Keyset pagination: pass `nextCursor` back as `cursor`.

`POST /api/purchases` (Administrator) — `{ customerEmail | customerId, items: [{ productId, quantity }], paymentMethod? }` → 201 `{ purchase }`.
Prices and totals are computed by the server; stock is decremented atomically in a transaction (all items or none). Expired products are refused with `PRODUCT_EXPIRED`.

## Analytics

`GET /api/analytics?type=…&period=daily|weekly|monthly`

| Role | `type` | Returns |
|---|---|---|
| Administrator | `inventory` | `stats`, `expiryBreakdown`, `stockLevels`, `byCategory`, `topByStock`, `lowStock`, `expiringSoonItems`, `expiredItems`, `thresholdDays` |
| Administrator | `sales` | `salesTrend[{label,totalSales,orders,itemCount}]`, `topProducts`, `totalRevenue`, `totalOrders` |
| Administrator | `expiry` | `expiryGroups{thisWeek,nextWeek,thisMonth}`, `totalExpiringSoon` |
| Administrator | `predictive` | `method`, `predictedDemand`, `expiryRisk`, `categoryPerformance`, `salesTrend`, `forecast[7]`, `recommendations` |
| Customer | `spending` | `monthly`, `weekly`, `byStore`, `currentMonth`, `currentWeek`, `totalSpent`, `totalVisits` |
| Customer | `expiry` | `expiringItems[{productName,quantity,price,value,expiryDate,storeName,daysUntilExpiry}]` |

Results are cached per tenant (60 s) and invalidated when products, sales or settings change.

## Settings

`GET /api/me/settings` → `{ settings: { notificationSettings: { expiryThresholdDays, emailEnabled, dailyDigest }, budget: { monthly, weekly } } }`
`PATCH /api/me/settings` — any subset of the above.

## Contact

`POST /api/contact` (public) — `{ name, email, message }` → 202. Queued and emailed to `SUPPORT_EMAIL`. Rate limit: 5/hour per IP.

## Operations

`GET /api/health` → 200/503 with `checks: { db, cache, cacheKind }` (readiness) and `config: { notifier, cronSecretSet, errorTracking, requireEmailVerification, allowAdminSignup }` (setup self-check; flags only). `GET /api/health?probe=live` → liveness.

Internal (header `Authorization: Bearer $CRON_SECRET`; GET or POST so Vercel Cron can call them): `/api/internal/jobs`, `/api/internal/expiry-scan`, `POST /api/internal/db-indexes`.
