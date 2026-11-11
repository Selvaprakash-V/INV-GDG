import { NextResponse } from 'next/server';
import { withApi } from '@/server/core/http';
import { pingDb } from '@/server/db/connection';

const startedAt = Date.now();

// Load-balancer probes. ?probe=live -> process is up; default -> readiness (DB + cache).
export const GET = withApi(
  async ({ query, container }) => {
    if (query.get('probe') === 'live') return { status: 'ok' };
    const checks = await Promise.allSettled([pingDb(), container.cacheStore.ping()]);
    const [db, cache] = checks.map((c) => (c.status === 'fulfilled' && c.value ? 'ok' : 'down'));
    const healthy = db === 'ok';
    return NextResponse.json(
      {
        success: healthy,
        status: healthy ? 'ok' : 'degraded',
        checks: { db, cache, cacheKind: container.cacheStore.kind },
        // Setup self-check for operators (kinds and on/off flags only, never values).
        config: {
          notifier: container.notifier.kind,
          cronSecretSet: Boolean(container.env.CRON_SECRET),
          errorTracking: Boolean(container.env.SENTRY_DSN),
          requireEmailVerification: container.env.REQUIRE_EMAIL_VERIFICATION,
          allowAdminSignup: container.env.ALLOW_ADMIN_SIGNUP,
        },
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      },
      { status: healthy ? 200 : 503 }
    );
  },
  { db: false }
);
