// Server-only tunables (replaces magic numbers in the old route handlers).
import { LOGIN_THROTTLE } from '@/shared/constants';

export const AUTH = Object.freeze({
  BCRYPT_ROUNDS: 12,
  SESSION_MAX_AGE_SECONDS: 24 * 60 * 60,
});

export const RATE_LIMITS = Object.freeze({
  /** Per account: blocks password guessing against one user. */
  LOGIN: { limit: LOGIN_THROTTLE.MAX_ATTEMPTS, windowSeconds: LOGIN_THROTTLE.WINDOW_MINUTES * 60 },
  /** Per IP: blocks credential spraying across many users. */
  LOGIN_IP: { limit: 30, windowSeconds: 15 * 60 },
  REGISTER: { limit: 10, windowSeconds: 60 * 60 },
  WRITE: { limit: 120, windowSeconds: 60 },
  CONTACT: { limit: 5, windowSeconds: 60 * 60 },
});

export const CACHE_TTL_SECONDS = Object.freeze({
  PRODUCT: 300,
  PRODUCT_LIST: 30,
  ANALYTICS: 60,
  INVENTORY_SUMMARY: 30,
  SETTINGS: 300,
});

export const CACHE_LIMITS = Object.freeze({
  MEMORY_MAX_ENTRIES: 5000,
});

export const JOBS = Object.freeze({
  DEFAULT_MAX_ATTEMPTS: 5,
  LOCK_MS: 60_000,
  BASE_BACKOFF_MS: 30_000,
  MAX_BACKOFF_MS: 60 * 60_000,
  DRAIN_BATCH: 25,
  /** Completed jobs are purged by a TTL index after this many seconds. */
  RETAIN_DONE_SECONDS: 7 * 24 * 60 * 60,
});

export const DB = Object.freeze({
  SERVER_SELECTION_TIMEOUT_MS: 10_000,
  SOCKET_TIMEOUT_MS: 45_000,
});

export const PREDICTION = Object.freeze({
  /** Days of stock cover below which a restock is recommended. */
  RESTOCK_COVER_DAYS: 7,
  /** Minimum sales lines in the window before confidence is "high". */
  HIGH_CONFIDENCE_MIN_SALES: 20,
  MEDIUM_CONFIDENCE_MIN_SALES: 5,
  TOP_N: 10,
  LOOKBACK_DAYS: 30,
});

export const EVENTS = Object.freeze({
  PRODUCT_CHANGED: 'product.changed',
  PURCHASE_RECORDED: 'purchase.recorded',
  SETTINGS_CHANGED: 'settings.changed',
});

export const JOB_TYPES = Object.freeze({
  EXPIRY_DIGEST: 'expiry.digest',
  LOW_STOCK_ALERT: 'stock.low',
  CONTACT_MESSAGE: 'contact.message',
});
