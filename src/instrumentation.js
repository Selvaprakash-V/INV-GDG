// Next.js instrumentation hook. Error tracking is opt-in: nothing loads unless SENTRY_DSN is set.
// The NEXT_RUNTIME check is inlined at build time, so the Edge (middleware) bundle never includes the SDK.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    const { initErrorTracking } = await import('./instrumentation-node');
    await initErrorTracking();
  }
}

/** Errors Next.js itself catches (render failures, uncaught route errors). */
export async function onRequestError(err, request, context) {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    const { captureRequestError } = await import('./instrumentation-node');
    captureRequestError(err, request, context);
  }
}
