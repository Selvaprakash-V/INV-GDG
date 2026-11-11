import { randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ForbiddenError, RateLimitError, UnauthorizedError, toAppError } from './errors';
import { logger } from './logger';

/**
 * Route decorator: one place for request ids, authentication, authorization,
 * rate limiting, DB connection, error mapping and access logging.
 * Route files shrink to "parse input -> call service -> return data".
 *
 * @param {(ctx: {request: Request, params: object, query: URLSearchParams, user: any, container: any, log: any}) => Promise<any>} handler
 * @param {{ roles?: string[] | 'any', rateLimit?: {name: string, policy: {limit:number, windowSeconds:number}}, db?: boolean, cronAuth?: boolean, status?: number }} [options]
 */
export function withApi(handler, options = {}) {
  const { roles, rateLimit, db = true, cronAuth = false, status = 200 } = options;
  return async function route(request, context) {
    const requestId = request.headers.get('x-request-id') || randomUUID();
    const started = Date.now();
    const url = new URL(request.url);
    const log = logger.child({ requestId, method: request.method, path: url.pathname });
    let user = null;
    try {
      // Lazy imports keep `next build` from evaluating env/DB at module load.
      const [{ getContainer }, { connectDb }] = await Promise.all([import('../container'), import('../db/connection')]);
      const container = await getContainer();

      if (cronAuth) assertCronSecret(request, container.env.CRON_SECRET);
      if (roles) user = await requireUser(request, roles, container.env.NEXTAUTH_SECRET);
      if (rateLimit) {
        const id = user?.id || clientIp(request.headers);
        const res = await container.rateLimiter.consume(rateLimit.name, id, rateLimit.policy);
        if (!res.allowed) throw new RateLimitError(res.retryAfterSeconds);
      }
      if (db) await connectDb();

      const params = context?.params ? await context.params : {};
      const result = await handler({ request, params, query: url.searchParams, user, container, log });
      const response = result instanceof Response ? result : NextResponse.json({ success: true, ...(result || {}) }, { status });
      response.headers.set('x-request-id', requestId);
      if (!response.headers.has('cache-control')) response.headers.set('cache-control', 'no-store');
      log.info('request', { status: response.status, ms: Date.now() - started, userId: user?.id });
      return response;
    } catch (err) {
      const appErr = toAppError(err);
      const level = appErr.status >= 500 ? 'error' : 'warn';
      log[level]('request failed', { status: appErr.status, code: appErr.code, ms: Date.now() - started, userId: user?.id, err: appErr.status >= 500 ? err : undefined });
      const response = NextResponse.json(appErr.toResponseBody(), { status: appErr.status });
      response.headers.set('x-request-id', requestId);
      response.headers.set('cache-control', 'no-store');
      if (appErr instanceof RateLimitError) response.headers.set('retry-after', String(appErr.retryAfterSeconds));
      return response;
    }
  };
}

/**
 * Decode-only JWT check. getServerSession() re-encrypts the token and emits a
 * Set-Cookie on every call; API routes only need to read it (measured ~2x cheaper).
 * Session sliding still happens via page loads and /api/auth/session.
 */
async function requireUser(request, roles, secret) {
  const token = await getToken({ req: request, secret });
  if (!token?.id) throw new UnauthorizedError();
  const user = { id: token.id, role: token.role, shopName: token.shopName ?? null, name: token.name, email: token.email };
  if (Array.isArray(roles) && !roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

function assertCronSecret(request, secret) {
  const header = request.headers.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!secret || !provided) throw new UnauthorizedError();
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedError();
}

/**
 * Client IP for rate limiting. Prefer X-Real-IP (overwritten by our nginx LB);
 * otherwise the LAST X-Forwarded-For hop — the one appended by the nearest
 * proxy (Cloud Run / LB). The first hop is client-controlled and spoofable.
 */
export function clientIp(headers) {
  const get = (k) => (typeof headers?.get === 'function' ? headers.get(k) : headers?.[k]);
  const realIp = get('x-real-ip');
  if (realIp) return String(realIp).trim();
  const xff = get('x-forwarded-for');
  if (xff) return String(xff).split(',').at(-1).trim();
  return 'unknown';
}
