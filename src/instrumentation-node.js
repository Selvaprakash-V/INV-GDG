import * as Sentry from '@sentry/nextjs';

let started = false;

/** Server-side Sentry init. PII stays off: no cookies, headers or request bodies are sent. */
export async function initErrorTracking() {
  if (started) return;
  started = true;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });
  // Errors handled by withApi (mapped to 5xx JSON responses) reach Sentry through the logger.
  globalThis.__trackitErrorReporter = (err, extra) => Sentry.captureException(err, { extra });
}

export function captureRequestError(err, request, context) {
  if (typeof Sentry.captureRequestError === 'function') Sentry.captureRequestError(err, request, context);
  else Sentry.captureException(err);
}
