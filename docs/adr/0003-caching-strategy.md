# ADR 0003 — Cache-aside with namespace versioning; Redis optional

**Status:** accepted · 2026-11-11

## Context
Dashboards repeatedly run the same aggregations (inventory summary, sales, predictive). Writes are rare relative to reads. The old dashboard downloaded the entire inventory to the browser to compute stats.

## Decision
- Aggregations run in MongoDB; results are cached per tenant (`store:<id>` / `customer:<id>` namespaces) with short TTLs (30–300 s).
- Invalidation = increment the namespace version (one `INCR`), triggered by domain events (`product.changed`, `purchase.recorded`, `settings.changed`). No key scans.
- Single-flight collapses concurrent misses; the cache fails open.
- `CacheStore` interface with two implementations: in-process LRU (default) and Redis (`REDIS_URL`). Rate-limit counters use the same store.

## Consequences
+ Repeated dashboard loads skip the database; correctness is restored immediately after writes on the same instance.
− With several instances and the memory store, other instances can serve data up to one TTL old. **Use Redis whenever more than one instance runs** (compose file and runbook do).
