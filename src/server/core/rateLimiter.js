/**
 * Fixed-window rate limiter backed by a CacheStore, so limits are shared across
 * instances when Redis is configured.
 */
export class RateLimiter {
  /** @param {import('../cache/CacheStore').CacheStore} store */
  constructor(store, { now = () => Date.now(), logger } = {}) {
    this.store = store;
    this.now = now;
    this.logger = logger;
  }

  #key(name, id, windowSeconds) {
    const windowStart = Math.floor(this.now() / (windowSeconds * 1000));
    return `rl:${name}:${id}:${windowStart}`;
  }

  /**
   * @param {string} name policy name
   * @param {string} id caller identity (ip, email, user id)
   * @param {{limit: number, windowSeconds: number}} policy
   * @returns {Promise<{allowed: boolean, remaining: number, retryAfterSeconds: number}>}
   */
  async consume(name, id, { limit, windowSeconds }) {
    try {
      const count = await this.store.incr(this.#key(name, id, windowSeconds), windowSeconds);
      const windowEndMs = (Math.floor(this.now() / (windowSeconds * 1000)) + 1) * windowSeconds * 1000;
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: Math.max(1, Math.ceil((windowEndMs - this.now()) / 1000)),
      };
    } catch (err) {
      // Fail open: an unavailable cache must not take login down.
      this.logger?.warn('rate limiter unavailable', { err, name });
      return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
    }
  }

  async reset(name, id, { windowSeconds }) {
    try {
      await this.store.del(this.#key(name, id, windowSeconds));
    } catch {
      /* ignore */
    }
  }
}
