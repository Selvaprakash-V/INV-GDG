import { ROLES } from '@/shared/constants';
import { ValidationError } from '../../core/errors';
import { CACHE_TTL_SECONDS } from '../../config/constants';
import { cacheNamespaces } from '../../cache/CacheService';
import { parse, analyticsQuerySchema } from '../../validation/schemas';

/**
 * Dispatches to a registered strategy by (role, type) — replaces the nested
 * if/else on role and type in the old analytics route. Results are cached per
 * tenant and invalidated by domain events.
 */
export class AnalyticsService {
  constructor({ strategies, cache, userService, now = () => new Date() }) {
    this.cache = cache;
    this.userService = userService;
    this.now = now;
    this.registry = new Map(strategies.map((s) => [`${s.role}:${s.type}`, s]));
  }

  async run(user, query) {
    const { type, period } = parse(analyticsQuerySchema, query);
    const strategy = this.registry.get(`${user.role}:${type}`);
    if (!strategy) throw new ValidationError(`Analytics type "${type}" is not available for ${user.role}`);

    const settings = user.role === ROLES.ADMIN ? await this.userService.getSettings(user.id) : undefined;
    const ctx = { user, period, now: this.now(), settings };
    const namespace = user.role === ROLES.ADMIN ? cacheNamespaces.store(user.id) : cacheNamespaces.customer(user.id);
    const key = `analytics:${type}:${period}:${strategy.cacheKey?.(ctx) ?? ''}`;
    const ttl = strategy.cacheTtl ?? CACHE_TTL_SECONDS.ANALYTICS;

    const data = await this.cache.wrap(namespace, key, ttl, () => strategy.execute(ctx));
    return { type, ...data };
  }
}
