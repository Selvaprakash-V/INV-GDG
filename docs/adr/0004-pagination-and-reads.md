# ADR 0004 — Pagination model and read scaling

**Status:** accepted · 2026-11-11

## Decision
- **Products:** offset pagination (`page`, `limit ≤ 100`) with totals — bounded per store (thousands), and the UI needs page numbers.
- **Purchases:** keyset pagination on `(purchaseDate desc, _id desc)` with an opaque cursor — unbounded, append-heavy; cost stays O(limit) at any depth and pages don't shift when new sales arrive.
- **Indexes** mirror query shapes, all prefixed by tenant: `{storeId, isActive, createdAt}`, `{storeId, isActive, expiryDate}`, `{storeId, isActive, category}`, unique partial `{storeId, barcode}`; purchases `{storeId|customerId, purchaseDate, _id}`.
- **Read replicas:** analytics and list queries use `MONGODB_READ_PREFERENCE` (e.g. `secondaryPreferred`); writes, transactions and read-your-write paths (stock checks) stay on the primary.

## Consequences
+ Predictable latency as data grows; analytics load can move off the primary with a config change.
− Replica reads can lag by a few hundred ms — acceptable for dashboards, never used for stock decisions. Offset pages beyond ~10k rows would degrade; product counts per store are far below that.
