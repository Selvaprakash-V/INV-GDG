/**
 * Cache-aside helper on top of any CacheStore.
 *
 * - Namespaced keys with a version counter: invalidating a namespace is a single
 *   INCR (O(1)), no key scanning. Old entries simply age out via TTL.
 * - Single-flight: concurrent misses for the same key share one loader call
 *   (protects the DB from cache stampedes).
 * - Fail-open: if the cache backend errors, we fall through to the loader.
 */
export class CacheService {
  /** @param {import('./CacheStore').CacheStore} store */
  constructor(store, { logger, versionTtlSeconds = 7 * 24 * 60 * 60 } = {}) {
    this.store = store;
    this.logger = logger;
    this.versionTtlSeconds = versionTtlSeconds;
    this.inflight = new Map();
  }

  async #version(namespace) {
    try {
      return (await this.store.get(`ns:${namespace}`)) ?? 0;
    } catch (err) {
      this.logger?.warn('cache version read failed', { err, namespace });
      return null;
    }
  }

  /**
   * @template T
   * @param {string} namespace e.g. `store:<id>`
   * @param {string} key
   * @param {number} ttlSeconds
   * @param {() => Promise<T>} loader
   * @returns {Promise<T>}
   */
  async wrap(namespace, key, ttlSeconds, loader) {
    const version = await this.#version(namespace);
    if (version === null) return loader();
    const fullKey = `${namespace}:v${version}:${key}`;

    try {
      const hit = await this.store.get(fullKey);
      if (hit !== undefined) return hit;
    } catch (err) {
      this.logger?.warn('cache get failed', { err, key: fullKey });
      return loader();
    }

    if (this.inflight.has(fullKey)) return this.inflight.get(fullKey);
    const promise = (async () => {
      const value = await loader();
      try {
        await this.store.set(fullKey, value, ttlSeconds);
      } catch (err) {
        this.logger?.warn('cache set failed', { err, key: fullKey });
      }
      return value;
    })().finally(() => this.inflight.delete(fullKey));
    this.inflight.set(fullKey, promise);
    return promise;
  }

  async invalidate(namespace) {
    try {
      await this.store.incr(`ns:${namespace}`, this.versionTtlSeconds);
    } catch (err) {
      this.logger?.warn('cache invalidate failed', { err, namespace });
    }
  }
}

export const cacheNamespaces = Object.freeze({
  store: (storeId) => `store:${storeId}`,
  customer: (customerId) => `customer:${customerId}`,
  user: (userId) => `user:${userId}`,
});
