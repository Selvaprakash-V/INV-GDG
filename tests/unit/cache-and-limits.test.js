import { describe, it, expect, vi } from 'vitest';
import { MemoryCacheStore, RedisCacheStore } from '@/server/cache/CacheStore';
import { CacheService } from '@/server/cache/CacheService';
import { RateLimiter } from '@/server/core/rateLimiter';

describe('MemoryCacheStore', () => {
  it('expires entries after their TTL', async () => {
    let t = 0;
    const store = new MemoryCacheStore({ now: () => t });
    await store.set('k', { v: 1 }, 10);
    expect(await store.get('k')).toEqual({ v: 1 });
    t = 10_001;
    expect(await store.get('k')).toBeUndefined();
  });

  it('evicts least-recently-used entries beyond capacity', async () => {
    const store = new MemoryCacheStore({ maxEntries: 2 });
    await store.set('a', 1, 60);
    await store.set('b', 2, 60);
    await store.get('a'); // a is now most recent
    await store.set('c', 3, 60);
    expect(await store.get('b')).toBeUndefined();
    expect(await store.get('a')).toBe(1);
  });

  it('incr creates counters with TTL', async () => {
    const store = new MemoryCacheStore();
    expect(await store.incr('n', 60)).toBe(1);
    expect(await store.incr('n', 60)).toBe(2);
  });
});

describe('RedisCacheStore (fake client)', () => {
  it('serialises JSON with a prefix and uses MULTI for incr', async () => {
    const data = new Map();
    const client = {
      get: async (k) => data.get(k) ?? null,
      set: async (k, v) => data.set(k, v),
      del: async (k) => data.delete(k),
      ping: async () => 'PONG',
      multi() {
        const ops = [];
        const chain = {
          incr: (k) => (ops.push(() => data.set(k, (Number(data.get(k)) || 0) + 1) && Number(data.get(k))), chain),
          expire: () => (ops.push(() => 1), chain),
          exec: async () => ops.map((op) => [null, op()]),
        };
        return chain;
      },
    };
    const store = new RedisCacheStore(client, { prefix: 't:' });
    await store.set('a', { x: 1 }, 30);
    expect(data.get('t:a')).toBe('{"x":1}');
    expect(await store.get('a')).toEqual({ x: 1 });
    expect(await store.incr('c', 60)).toBe(1);
    expect(await store.incr('c', 60)).toBe(2);
    expect(await store.ping()).toBe(true);
  });
});

describe('CacheService', () => {
  it('serves hits from cache and reloads after namespace invalidation', async () => {
    const cache = new CacheService(new MemoryCacheStore());
    const loader = vi.fn().mockResolvedValueOnce('v1').mockResolvedValueOnce('v2');
    expect(await cache.wrap('store:1', 'k', 60, loader)).toBe('v1');
    expect(await cache.wrap('store:1', 'k', 60, loader)).toBe('v1');
    expect(loader).toHaveBeenCalledTimes(1);
    await cache.invalidate('store:1');
    expect(await cache.wrap('store:1', 'k', 60, loader)).toBe('v2');
  });

  it('collapses concurrent misses into one load (stampede protection)', async () => {
    const cache = new CacheService(new MemoryCacheStore());
    let calls = 0;
    const loader = () => new Promise((r) => setTimeout(() => r(++calls), 20));
    const results = await Promise.all(Array.from({ length: 10 }, () => cache.wrap('ns', 'k', 60, loader)));
    expect(new Set(results)).toEqual(new Set([1]));
    expect(calls).toBe(1);
  });

  it('fails open when the backend is down', async () => {
    const broken = { get: () => Promise.reject(new Error('down')), set: () => Promise.reject(new Error('down')), incr: () => Promise.reject(new Error('down')) };
    const cache = new CacheService(broken, { logger: { warn: vi.fn() } });
    expect(await cache.wrap('ns', 'k', 60, async () => 'fresh')).toBe('fresh');
    await expect(cache.invalidate('ns')).resolves.toBeUndefined();
  });
});

describe('RateLimiter', () => {
  it('blocks after the limit and resets on a new window', async () => {
    let t = 0;
    const limiter = new RateLimiter(new MemoryCacheStore({ now: () => t }), { now: () => t });
    const policy = { limit: 2, windowSeconds: 60 };
    expect((await limiter.consume('login', 'a', policy)).allowed).toBe(true);
    expect((await limiter.consume('login', 'a', policy)).allowed).toBe(true);
    const blocked = await limiter.consume('login', 'a', policy);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect((await limiter.consume('login', 'b', policy)).allowed).toBe(true); // per-identity
    t = 61_000;
    expect((await limiter.consume('login', 'a', policy)).allowed).toBe(true);
  });

  it('reset clears the counter', async () => {
    const limiter = new RateLimiter(new MemoryCacheStore());
    const policy = { limit: 1, windowSeconds: 60 };
    await limiter.consume('x', 'a', policy);
    await limiter.reset('x', 'a', policy);
    expect((await limiter.consume('x', 'a', policy)).allowed).toBe(true);
  });

  it('fails open if the store errors', async () => {
    const limiter = new RateLimiter({ incr: () => Promise.reject(new Error('down')) }, { logger: { warn: vi.fn() } });
    expect((await limiter.consume('x', 'a', { limit: 1, windowSeconds: 60 })).allowed).toBe(true);
  });
});
