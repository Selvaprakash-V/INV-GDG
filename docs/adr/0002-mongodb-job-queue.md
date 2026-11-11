# ADR 0002 — Durable job queue in MongoDB instead of a message broker

**Status:** accepted for the pilot · 2026-11-11

## Context
Expiry digests and low-stock alerts must not block requests, must survive restarts and must retry when the email provider fails. Pilot volume: a few hundred notifications per day.

## Options
1. Fire-and-forget in the request — loses work on crash, slows responses.
2. Managed broker (Pub/Sub, SQS, RabbitMQ) — robust, but another service, credentials and local-dev story.
3. **Queue collection in the existing MongoDB** — atomic `findOneAndUpdate` claim, lock expiry for crash recovery, exponential backoff, dead-letter status, idempotency via a unique `dedupeKey`.

## Decision
Option 3, with the `JobQueue` API (`enqueue`, `drain`, `register(type, handler)`) kept broker-agnostic. Work is triggered (a) right after the response via Next.js `after()` and (b) by a scheduler calling `/api/internal/jobs` every minute.

## Consequences
+ Zero new infrastructure; at-least-once delivery; safe with many app instances.
− Polling adds ≤60 s latency for retries; throughput ceiling around hundreds of jobs/sec. Handlers must be idempotent.
**Revisit when:** >50 stores or >10 jobs/sec sustained → swap the repository for Pub/Sub/SQS behind the same `JobQueue` interface.
