import { PAGINATION } from '@/shared/constants';

/** Dashboard tabs, in sidebar order. `id` is the value used in `?tab=`. */
export const DASHBOARD_TABS = Object.freeze({
  DASHBOARD: 'dashboard',
  INVENTORY: 'inventory',
  ALERTS: 'alerts',
  REPORTS: 'reports',
  CALENDAR: 'calendar',
  AI_ANALYSIS: 'ai-analysis',
});

export const DEFAULT_TAB = DASHBOARD_TABS.DASHBOARD;

/** Alternate `?tab=` values (e.g. digest emails link `?tab=expiry`). */
export const TAB_ALIASES = Object.freeze({
  expiry: DASHBOARD_TABS.ALERTS,
  analysis: DASHBOARD_TABS.AI_ANALYSIS,
});

/** The existing admin UI shows prices in dollars. */

export const DATE_FORMAT = 'yyyy-MM-dd';

export const SEARCH_DEBOUNCE_MS = 300;

export const INVENTORY_PAGE_SIZE = PAGINATION.DEFAULT_LIMIT;

/** Upper bound the API allows per request; used for month-wide calendar fetches. */
export const CALENDAR_FETCH_LIMIT = PAGINATION.MAX_LIMIT;
/** Safety cap on pages followed per calendar month (10 x 100 = 1,000 rows per list). */
export const CALENDAR_MAX_PAGES = 10;

export const PRODUCT_PICKER_LIMIT = 10;

export const PRODUCT_SORTS = Object.freeze([
  { value: 'newest', label: 'Newest first' },
  { value: 'expiry', label: 'Expiry date' },
  { value: 'stock', label: 'Stock level' },
  { value: 'name', label: 'Name' },
]);

export const ALL_CATEGORIES = 'all';

/** Stock count that fills the inventory table's progress bar. */
export const STOCK_BAR_FULL = 200;

/** Items expiring within this many days get the most urgent styling. */
export const URGENT_EXPIRY_DAYS = 3;

export const SALES_PERIODS = Object.freeze([
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]);

export const DEFAULT_SALES_PERIOD = 'weekly';

/** Risk score (0-100) thresholds for predictive expiry risk styling. */
export const RISK_THRESHOLDS = Object.freeze({ HIGH: 70, MEDIUM: 50 });

/** Header switches to a solid background after this many pixels of scroll. */
export const HEADER_SCROLL_OFFSET = 10;

export const CHART_COLORS = Object.freeze({
  primary: '#8884d8',
  secondary: '#82ca9d',
  fresh: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  success: '#10b981',
});

/** Colours for the four server-provided stock level buckets, in order. */
export const STOCK_LEVEL_COLORS = Object.freeze([
  CHART_COLORS.danger,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.success,
]);

export const ROUTES = Object.freeze({
  DASHBOARD: '/admin/dashboard',
  ADD_PRODUCT: '/admin/add-product',
  RECORD_SALE: '/admin/record-sale',
  editProduct: (id) => `/admin/edit-product/${id}`,
});
