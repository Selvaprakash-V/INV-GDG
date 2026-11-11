import { z } from 'zod';

// Validated, typed configuration. Fails fast with a clear message instead of
// silently falling back to hardcoded credentials (the old behaviour).

const boolFromString = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  /** Route read-heavy queries (analytics, listings) to replicas: e.g. secondaryPreferred. */
  MONGODB_READ_PREFERENCE: z
    .enum(['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'])
    .default('primary'),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),
  MONGODB_AUTO_INDEX: boolFromString.optional(),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET must be at least 16 characters'),
  REDIS_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  ALLOW_ADMIN_SIGNUP: boolFromString.default(true),
  NOTIFIER: z.enum(['console', 'resend']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  NOTIFY_FROM: z.string().default('TrackIt <alerts@trackit.local>'),
  /** Inbox that receives contact-form messages. */
  SUPPORT_EMAIL: z.email().default('support@trackit.local'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

let cached;

/** Lazily parse env (so `next build` doesn't require runtime secrets). */
export function getEnv() {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  const env = parsed.data;
  if (env.NOTIFIER === 'resend' && !env.RESEND_API_KEY) {
    throw new Error('Invalid environment configuration: RESEND_API_KEY is required when NOTIFIER=resend');
  }
  cached = Object.freeze({
    ...env,
    // On by default everywhere: uniqueness (per-store barcode, email) must never depend on
    // someone remembering a deploy step. Creating existing indexes is a no-op. Set false only
    // for very large collections and run POST /api/internal/db-indexes during deploys instead.
    MONGODB_AUTO_INDEX: env.MONGODB_AUTO_INDEX ?? true,
    isProduction: env.NODE_ENV === 'production',
  });
  return cached;
}

/** Test hook. */
export function resetEnvCache() {
  cached = undefined;
}
