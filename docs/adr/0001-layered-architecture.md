# ADR 0001 — Layered architecture with a composition root

**Status:** accepted · 2026-11-11

## Context
Route handlers mixed authentication, validation, database queries and business rules (e.g. the purchase route did auth, stock checks, decrements and receipt generation inline). Analytics branched on `role` and `type` in one 380-line file. There were three database connection modules and no tests.

## Decision
- **Routes** are thin: `withApi` decorator handles request ids, auth/roles, rate limits, DB connection, error mapping and logging.
- **Services** hold use-cases and depend on abstractions passed via constructors (DIP).
- **Repositories** are the only code that touches Mongoose; every query is tenant-scoped by `storeId`; persistence errors are translated to domain errors.
- **Composition root** (`src/server/container.js`) wires concrete classes once; tests swap any dependency (`createContainer(overrides)`).
- Polymorphism instead of conditionals: `AppError` subclasses own their HTTP status; analytics strategies are registered by `(role, type)`; job handlers by type; notifiers by channel.

## Consequences
+ Each layer is unit/integration testable; new analytics, job types or notification channels are additive (OCP).
+ Security rules (tenant scoping, whitelisted fields) live in one place.
− More files and indirection than a flat Next.js app; contributors need the layout map in the README.
