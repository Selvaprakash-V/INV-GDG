import mongoose from 'mongoose';
import { after } from 'next/server';
import { getEnv } from './config/env';
import { CACHE_LIMITS, EVENTS, JOB_TYPES } from './config/constants';
import { logger as rootLogger } from './core/logger';
import { RateLimiter } from './core/rateLimiter';
import { createCacheStore } from './cache/CacheStore';
import { CacheService, cacheNamespaces } from './cache/CacheService';
import { analyticsReadPreference } from './db/connection';
import { EventBus } from './messaging/EventBus';
import { JobQueue } from './messaging/JobQueue';
import { createNotifier } from './messaging/notifiers';
import { ProductRepository } from './repositories/ProductRepository';
import { PurchaseRepository } from './repositories/PurchaseRepository';
import { UserRepository } from './repositories/UserRepository';
import { JobRepository } from './repositories/JobRepository';
import { UserService } from './services/UserService';
import { ProductService } from './services/ProductService';
import { PurchaseService } from './services/PurchaseService';
import { NotificationService } from './services/NotificationService';
import { AnalyticsService } from './services/analytics/AnalyticsService';
import {
  InventorySummaryStrategy,
  SalesStrategy,
  StoreExpiryStrategy,
  PredictiveStrategy,
  CustomerSpendingStrategy,
  CustomerExpiryStrategy,
} from './services/analytics/strategies';

/**
 * Composition root (Dependency Injection). The only module that knows concrete
 * classes; everything else receives its collaborators via constructors.
 *
 * @param {object} [overrides] swap any dependency (used by tests)
 */
export async function createContainer(overrides = {}) {
  const env = overrides.env ?? getEnv();
  const logger = overrides.logger ?? rootLogger;
  const now = overrides.now ?? (() => new Date());

  const cacheStore = overrides.cacheStore ?? (await createCacheStore({ redisUrl: env.REDIS_URL, maxEntries: CACHE_LIMITS.MEMORY_MAX_ENTRIES, logger }));
  const cache = new CacheService(cacheStore, { logger });
  const rateLimiter = new RateLimiter(cacheStore, { logger });
  const events = new EventBus({ logger });

  const readPreference = overrides.readPreference ?? analyticsReadPreference;
  const userRepository = new UserRepository();
  const productRepository = new ProductRepository({ readPreference });
  const purchaseRepository = new PurchaseRepository({ readPreference });
  const jobRepository = new JobRepository();

  const jobQueue = new JobQueue({ jobRepository, logger, now });
  const notifier = overrides.notifier ?? createNotifier(env, logger);

  const userService = new UserService({ userRepository, cache, events, allowAdminSignup: env.ALLOW_ADMIN_SIGNUP });
  const productService = new ProductService({ productRepository, cache, events });
  const purchaseService = new PurchaseService({
    purchaseRepository,
    productRepository,
    userRepository,
    events,
    now,
    runInTransaction: overrides.runInTransaction ?? ((fn) => mongoose.connection.transaction(fn)),
  });
  const notificationService = new NotificationService({
    userRepository,
    productRepository,
    jobQueue,
    notifier,
    appUrl: env.APP_URL,
    supportEmail: env.SUPPORT_EMAIL,
    timezone: env.APP_TIMEZONE,
    logger,
    now,
  });
  const tz = env.APP_TIMEZONE;
  const analyticsService = new AnalyticsService({
    cache,
    userService,
    now,
    strategies: [
      new InventorySummaryStrategy({ productRepository }),
      new SalesStrategy({ purchaseRepository, timezone: tz }),
      new StoreExpiryStrategy({ productRepository }),
      new PredictiveStrategy({ productRepository, purchaseRepository, timezone: tz }),
      new CustomerSpendingStrategy({ purchaseRepository, timezone: tz }),
      new CustomerExpiryStrategy({ purchaseRepository }),
    ],
  });

  // Job handlers (Strategy registry on the queue)
  jobQueue
    .register(JOB_TYPES.EXPIRY_DIGEST, (p) => notificationService.handleExpiryDigest(p))
    .register(JOB_TYPES.LOW_STOCK_ALERT, (p) => notificationService.handleLowStock(p))
    .register(JOB_TYPES.CONTACT_MESSAGE, (p) => notificationService.handleContactMessage(p));

  // "Run soon, after the response": moves notification work off the request path.
  const defer = overrides.defer ?? defaultDefer(logger);
  const kickJobs = () => defer(() => jobQueue.drain());

  // Event subscriptions (Observer)
  events.on(EVENTS.PRODUCT_CHANGED, ({ storeId }) => cache.invalidate(cacheNamespaces.store(storeId)));
  events.on(EVENTS.PURCHASE_RECORDED, async (evt) => {
    await Promise.all([cache.invalidate(cacheNamespaces.store(evt.storeId)), cache.invalidate(cacheNamespaces.customer(evt.customerId))]);
  });
  events.on(EVENTS.PURCHASE_RECORDED, async (evt) => {
    await notificationService.onPurchaseRecorded(evt);
    kickJobs();
  });
  events.on(EVENTS.SETTINGS_CHANGED, async ({ userId }) => {
    await Promise.all([cache.invalidate(cacheNamespaces.user(userId)), cache.invalidate(cacheNamespaces.store(userId))]);
  });

  return {
    kickJobs,
    env,
    logger,
    cacheStore,
    cache,
    rateLimiter,
    events,
    jobQueue,
    notifier,
    userService,
    productService,
    purchaseService,
    analyticsService,
    notificationService,
    jobRepository,
  };
}

function defaultDefer(logger) {
  return (task) => {
    const run = () => Promise.resolve().then(task).catch((err) => logger.error('deferred task failed', { err }));
    try {
      after(run); // Next.js: runs once the response has been sent
    } catch {
      setTimeout(run, 0); // outside a request scope (scripts, tests)
    }
  };
}

const holder = globalThis.__trackitContainer ?? (globalThis.__trackitContainer = { promise: null });

/** Process-wide singleton (survives Next.js dev HMR). */
export function getContainer() {
  if (!holder.promise) {
    holder.promise = createContainer().catch((err) => {
      holder.promise = null;
      throw err;
    });
  }
  return holder.promise;
}
