/**
 * CacheStore interface (Introduce Interface / Dependency Inversion).
 * Services depend on this contract, not on Redis or a Map.
 *
 * @typedef {object} CacheStore
 * @property {(key: string) => Promise<any|undefined>} get
 * @property {(key: string, value: any, ttlSeconds: number) => Promise<void>} set
 * @property {(key: string) => Promise<void>} del
 * @property {(key: string, ttlSeconds: number) => Promise<number>} incr
 *           Atomically increments a counter, setting its TTL when first created.
 * @property {() => Promise<boolean>} ping
 * @property {string} kind
 */

/** In-process LRU cache with TTL. Default store; per-instance (see trade-offs doc). */
export class MemoryCacheStore {
  constructor({ maxEntries = 5000, now = () => Date.now() } = {}) {
    this.kind = 'memory';
    this.maxEntries = maxEntries;
    this.now = now;
    /** @type {Map<string, {value: any, expiresAt: number}>} */
    this.map = new Map();
  }

  #read(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.map.delete(key);
      return undefined;
    }
    // refresh LRU position
    this.map.delete(key);
    this.map.set(key, entry);
    return entry;
  }

  #write(key, value, ttlSeconds) {
    this.map.delete(key);
    this.map.set(key, { value, expiresAt: this.now() + ttlSeconds * 1000 });
    while (this.map.size > this.maxEntries) {
      this.map.delete(this.map.keys().next().value);
    }
  }

  async get(key) {
    return this.#read(key)?.value;
  }

  async set(key, value, ttlSeconds) {
    this.#write(key, value, ttlSeconds);
  }

  async del(key) {
    this.map.delete(key);
  }

  async incr(key, ttlSeconds) {
    const entry = this.#read(key);
    if (!entry) {
      this.#write(key, 1, ttlSeconds);
      return 1;
    }
    entry.value += 1;
    return entry.value;
  }

  async ping() {
    return true;
  }
}

/** Redis-backed store: shared across app instances behind a load balancer. */
export class RedisCacheStore {
  /** @param {import('ioredis').Redis} client */
  constructor(client, { prefix = 'trackit:' } = {}) {
    this.kind = 'redis';
    this.client = client;
    this.prefix = prefix;
  }

  async get(key) {
    const raw = await this.client.get(this.prefix + key);
    return raw === null ? undefined : JSON.parse(raw);
  }

  async set(key, value, ttlSeconds) {
    await this.client.set(this.prefix + key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key) {
    await this.client.del(this.prefix + key);
  }

  async incr(key, ttlSeconds) {
    const k = this.prefix + key;
    const [[, count]] = await this.client.multi().incr(k).expire(k, ttlSeconds, 'NX').exec();
    return count;
  }

  async ping() {
    return (await this.client.ping()) === 'PONG';
  }
}

/** Factory: Redis when REDIS_URL is set, otherwise in-memory. */
export async function createCacheStore({ redisUrl, maxEntries, logger }) {
  if (!redisUrl) return new MemoryCacheStore({ maxEntries });
  const { default: Redis } = await import('ioredis');
  const client = new Redis(redisUrl, { maxRetriesPerRequest: 2, enableOfflineQueue: false, lazyConnect: false });
  client.on('error', (err) => logger?.warn('redis error', { err }));
  return new RedisCacheStore(client);
}
