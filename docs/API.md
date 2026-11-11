# TrackIt HTTP API

All endpoints return JSON.

- Success: `{ "success": true, ...data }`
- Error: `{ "success": false, "code": "VALIDATION_ERROR", "message": "…", "details": { "field": "reason" } }`

| Status | `code` | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input failed validation; `details` maps field → message |
| 401 | `UNAUTHORIZED` | No session (or bad cron secret) |
| 403 | `FORBIDDEN` | Wrong role / feature disabled |
| 404 | `NOT_FOUND` | Missing, or belongs to another store (indistinguishable by design) |
| 409 | `DUPLICATE`, `EMAIL_TAKEN`, `INSUFFICIENT_STOCK` | Conflict |
| 429 | `RATE_LIMITED` | Slow down; see `Retry-After` |
| 503 | `SERVICE_UNAVAILABLE` | Database unavailable / not a replica set |

Every response carries `x-request-id` (also in server logs) and `cache-control: no-store`.

## Auth

NextAuth credentials provider. `POST /api/auth/callback/credentials` (via `signIn('credentials', { email, password })`).
Errors: `INVALID_CREDENTIALS`, `RATE_LIMITED` (5 attempts / 15 min per account, 30 per IP). Sessions are JWT cookies (24 h).

`POST /api/register` — `{ fullName, email, password, confirmPassword, role: "Customer" | "Administrator", shopName? }` → 201 `{ user }`.
Password: 8–128 chars with lowercase, uppercase and a digit. Rate limit: 10/hour per IP.

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
Prices and totals are computed by the server; stock is decremented atomically in a transaction (all items or none).

## Analytics

`GET /api/analytics?type=…&period=daily|weekly|monthly`

| Role | `type` | Returns |
|---|---|---|
| Administrator | `inventory` | `stats`, `expiryBreakdown`, `stockLevels`, `byCategory`, `topByStock`, `lowStock`, `expiringSoonItems`, `expiredItems`, `thresholdDays` |
| Administrator | `sales` | `salesTrend[{label,totalSales,orders,itemCount}]`, `topProducts`, `totalRevenue`, `totalOrders` |
| Administrator | `expiry` | `expiryGroups{thisWeek,nextWeek,thisMonth}`, `totalExpiringSoon` |
| Administrator | `predictive` | `method`, `predictedDemand`, `expiryRisk`, `categoryPerformance`, `salesTrend`, `forecast[7]`, `recommendations` |
| Customer | `spending` | `monthly`, `weekly`, `byStore`, `currentMonth`, `currentWeek`, `totalSpent`, `totalVisits` |
| Customer | `expiry` | `expiringItems[{productName,quantity,expiryDate,storeName,daysUntilExpiry}]` |

Results are cached per tenant (60 s) and invalidated when products, sales or settings change.

## Settings

`GET /api/me/settings` → `{ settings: { notificationSettings: { expiryThresholdDays, emailEnabled, dailyDigest }, budget: { monthly, weekly } } }`
`PATCH /api/me/settings` — any subset of the above.

## Contact

`POST /api/contact` (public) — `{ name, email, message }` → 202. Queued and emailed to `SUPPORT_EMAIL`. Rate limit: 5/hour per IP.

## Operations

`GET /api/health` → 200/503 with `checks: { db, cache, cacheKind }` (readiness). `GET /api/health?probe=live` → liveness.

Internal (header `Authorization: Bearer $CRON_SECRET`): `POST /api/internal/jobs`, `POST /api/internal/expiry-scan`, `POST /api/internal/db-indexes`.
