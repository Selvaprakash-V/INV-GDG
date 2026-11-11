// Domain constants shared by client and server.
// Single source of truth: replaces magic numbers/strings previously duplicated across files.

export const ROLES = Object.freeze({
  ADMIN: 'Administrator',
  CUSTOMER: 'Customer',
});

export const ROLE_HOME = Object.freeze({
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.CUSTOMER]: '/customer/dashboard',
});

export const PRODUCT_CATEGORIES = Object.freeze([
  'Dairy',
  'Bakery',
  'Meat',
  'Produce',
  'Beverages',
  'Canned Goods',
  'Frozen Foods',
  'Snacks',
  'Household',
  'Personal Care',
  'Other',
]);

export const PAYMENT_METHODS = Object.freeze([
  'Cash',
  'Credit Card',
  'Debit Card',
  'Mobile Payment',
  'Other',
]);

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const EXPIRY = Object.freeze({
  /** Items expiring within this many days are "expiring soon". */
  SOON_DAYS: 7,
  /** Default admin notification threshold (days before expiry). */
  DEFAULT_THRESHOLD_DAYS: 7,
  MIN_THRESHOLD_DAYS: 1,
  MAX_THRESHOLD_DAYS: 60,
  /** Horizon used by expiry analytics. */
  ANALYTICS_WINDOW_DAYS: 30,
  /** How far back customer purchases are checked for upcoming expiry. */
  CUSTOMER_LOOKBACK_DAYS: 90,
});

export const EXPIRY_STATUS = Object.freeze({
  FRESH: 'fresh',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  OUT_OF_STOCK: 'out',
});

export const STOCK_LEVELS = Object.freeze({
  CRITICAL_MAX: 10,
  LOW_MAX: 30,
  MEDIUM_MAX: 70,
  /** Below this, an admin gets a low-stock alert after a sale. */
  LOW_STOCK_ALERT: 15,
});

export const LIMITS = Object.freeze({
  NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  FULL_NAME_MAX: 60,
  SHOP_NAME_MAX: 100,
  BARCODE_MAX: 64,
  SEARCH_MAX: 100,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  MAX_PRICE: 10_000_000,
  MAX_STOCK: 1_000_000,
  MAX_ITEM_QUANTITY: 10_000,
  MAX_ITEMS_PER_PURCHASE: 100,
});

/** Login throttling — shared so the UI message always matches the server policy. */
export const LOGIN_THROTTLE = Object.freeze({
  MAX_ATTEMPTS: 5,
  WINDOW_MINUTES: 15,
});

export const PAGINATION = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const ANALYTICS_TYPES = Object.freeze({
  INVENTORY: 'inventory',
  SALES: 'sales',
  EXPIRY: 'expiry',
  PREDICTIVE: 'predictive',
  SPENDING: 'spending',
});

export const ANALYTICS_PERIODS = Object.freeze(['daily', 'weekly', 'monthly']);

export const DEFAULT_BUDGET = Object.freeze({ monthly: 25000, weekly: 7500 });

/** One currency for the whole app (was `$` in admin screens and `₹` in customer screens). */
export const CURRENCY = Object.freeze({ code: 'INR', locale: 'en-IN' });
