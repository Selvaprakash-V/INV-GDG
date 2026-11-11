import { ROLES, ANALYTICS_TYPES, EXPIRY, STOCK_LEVELS, MS_PER_DAY } from '@/shared/constants';
import { addDays, daysUntil } from '@/shared/expiry';
import { PREDICTION } from '../../config/constants';
import { periodWindow, fillSeries } from './periods';

/**
 * Analytics Strategy interface:
 *   { role: string, type: string, cacheTtl?: number, cacheKey?(ctx): string, execute(ctx): Promise<object> }
 * ctx = { user, period, now, settings }
 * New analytics = new class registered in the container (Open/Closed).
 */

export class InventorySummaryStrategy {
  role = ROLES.ADMIN;
  type = ANALYTICS_TYPES.INVENTORY;

  constructor({ productRepository }) {
    this.products = productRepository;
  }

  cacheKey({ settings }) {
    return `threshold:${thresholdOf(settings)}`;
  }

  async execute({ user, now, settings }) {
    const raw = await this.products.inventorySummary(user.id, { now, thresholdDays: thresholdOf(settings) });
    const totals = raw?.totals?.[0] || {};
    const levelCount = (id) => raw?.stockLevels?.find((b) => b._id === id)?.count || 0;
    const expired = totals.expired || 0;
    const expiring = totals.statusExpiring || 0;
    return {
      stats: {
        totalItems: totals.totalItems || 0,
        totalUnits: totals.totalUnits || 0,
        inventoryValue: totals.inventoryValue || 0,
        availableItems: totals.availableItems || 0,
        outOfStock: totals.outOfStock || 0,
        expiringSoon: totals.expiringSoon || 0,
        expired,
      },
      expiryBreakdown: [
        { name: 'Fresh', value: Math.max(0, (totals.totalItems || 0) - expired - expiring) },
        { name: 'Expiring', value: expiring },
        { name: 'Expired', value: expired },
      ],
      stockLevels: [
        { name: `Critical (0-${STOCK_LEVELS.CRITICAL_MAX})`, value: levelCount(0) },
        { name: `Low (${STOCK_LEVELS.CRITICAL_MAX + 1}-${STOCK_LEVELS.LOW_MAX})`, value: levelCount(STOCK_LEVELS.CRITICAL_MAX + 1) },
        { name: `Medium (${STOCK_LEVELS.LOW_MAX + 1}-${STOCK_LEVELS.MEDIUM_MAX})`, value: levelCount(STOCK_LEVELS.LOW_MAX + 1) },
        { name: `High (${STOCK_LEVELS.MEDIUM_MAX + 1}+)`, value: levelCount('high') },
      ],
      byCategory: (raw?.byCategory || []).map((c) => ({ name: c._id, items: c.items, stock: c.stock })),
      topByStock: (raw?.topByStock || []).map(toLite),
      lowStock: (raw?.lowStock || []).map(toLite),
      expiringSoonItems: (raw?.expiringSoonItems || []).map((p) => ({ ...toLite(p), daysUntilExpiry: daysUntil(p.expiryDate, now) })),
      expiredItems: (raw?.expiredItems || []).map(toLite),
      thresholdDays: thresholdOf(settings),
    };
  }
}

export class SalesStrategy {
  role = ROLES.ADMIN;
  type = ANALYTICS_TYPES.SALES;

  constructor({ purchaseRepository, timezone }) {
    this.purchases = purchaseRepository;
    this.timezone = timezone;
  }

  async execute({ user, period, now }) {
    const win = periodWindow(period, { now, timezone: this.timezone });
    const [series, topProducts, totals] = await Promise.all([
      this.purchases.salesSeries(user.id, win.since, win.bucketExpr),
      this.purchases.productSales(user.id, win.since, PREDICTION.TOP_N),
      this.purchases.storeTotals(user.id, win.since),
    ]);
    return {
      period,
      salesTrend: fillSeries(win.labels, series, { totalSales: 0, orders: 0, itemCount: 0 }),
      topProducts,
      totalRevenue: totals.totalRevenue,
      totalOrders: totals.totalOrders,
    };
  }
}

export class StoreExpiryStrategy {
  role = ROLES.ADMIN;
  type = ANALYTICS_TYPES.EXPIRY;

  constructor({ productRepository }) {
    this.products = productRepository;
  }

  async execute({ user, now }) {
    const horizon = addDays(now, EXPIRY.ANALYTICS_WINDOW_DAYS);
    const items = await this.products.findExpiringForStore(user.id, now, horizon, 500);
    const groups = { thisWeek: [], nextWeek: [], thisMonth: [] };
    for (const p of items) {
      const days = daysUntil(p.expiryDate, now);
      const bucket = days <= 7 ? 'thisWeek' : days <= 14 ? 'nextWeek' : 'thisMonth';
      groups[bucket].push({ ...toLite(p), expiryDate: p.expiryDate, daysUntilExpiry: days });
    }
    return { expiryGroups: groups, totalExpiringSoon: items.length };
  }
}

/**
 * Demand forecasting heuristic (moving average) with expiry-risk scoring.
 * Replaces the hardcoded sample data in the old PredictiveAnalysis panel.
 */
export class PredictiveStrategy {
  role = ROLES.ADMIN;
  type = ANALYTICS_TYPES.PREDICTIVE;

  constructor({ productRepository, purchaseRepository, timezone }) {
    this.products = productRepository;
    this.purchases = purchaseRepository;
    this.timezone = timezone;
  }

  async execute({ user, now }) {
    const since = addDays(now, -PREDICTION.LOOKBACK_DAYS);
    const win = periodWindow('daily', { now, timezone: this.timezone, buckets: PREDICTION.LOOKBACK_DAYS });
    const [sales, products, series] = await Promise.all([
      this.purchases.productSales(user.id, since),
      this.products.findActiveForStore(user.id),
      this.purchases.salesSeries(user.id, win.since, win.bucketExpr),
    ]);

    const firstSale = sales.reduce((min, s) => (s.firstSale < min ? s.firstSale : min), now);
    const observedDays = clamp(Math.ceil((now - new Date(firstSale)) / MS_PER_DAY), 1, PREDICTION.LOOKBACK_DAYS);
    const salesById = new Map(sales.map((s) => [s.productId, s]));

    const rows = products.map((p) => {
      const s = salesById.get(p.id);
      const daily = s ? s.totalQuantity / observedDays : 0;
      const daysLeft = daysUntil(p.expiryDate, now);
      const expectedSold = daily * Math.max(0, daysLeft);
      const unitsAtRisk = Math.max(0, Math.round(p.stock - expectedSold));
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        stock: p.stock,
        daysUntilExpiry: daysLeft,
        predictedDailyDemand: round1(daily),
        predictedWeeklyDemand: round1(daily * 7),
        predictedMonthlyDemand: round1(daily * 30),
        coverDays: daily > 0 ? round1(p.stock / daily) : null,
        unitsAtRisk,
        riskScore: p.stock > 0 && daysLeft > 0 ? Math.round((100 * unitsAtRisk) / p.stock) : 0,
        confidence: confidenceOf(s?.salesLines || 0),
        unitsSold: s?.totalQuantity || 0,
      };
    });

    const categoryTotals = new Map();
    for (const r of rows) categoryTotals.set(r.category, (categoryTotals.get(r.category) || 0) + r.unitsSold);

    const trend = fillSeries(win.labels, series, { totalSales: 0, orders: 0, itemCount: 0 });
    return {
      method: `Demand: moving average over the last ${observedDays} day(s) of sales. 7-day sales forecast: least-squares linear trend.`,
      observedDays,
      predictedDemand: [...rows].filter((r) => r.unitsSold > 0).sort((a, b) => b.predictedDailyDemand - a.predictedDailyDemand).slice(0, PREDICTION.TOP_N),
      expiryRisk: [...rows].filter((r) => r.riskScore > 0).sort((a, b) => b.riskScore - a.riskScore).slice(0, PREDICTION.TOP_N),
      categoryPerformance: [...categoryTotals.entries()].map(([name, unitsSold]) => ({ name, unitsSold })).sort((a, b) => b.unitsSold - a.unitsSold),
      salesTrend: trend,
      forecast: linearForecast(trend.map((t) => t.totalSales), 7),
      recommendations: buildRecommendations(rows),
    };
  }
}

export class CustomerSpendingStrategy {
  role = ROLES.CUSTOMER;
  type = ANALYTICS_TYPES.SPENDING;

  constructor({ purchaseRepository, timezone }) {
    this.purchases = purchaseRepository;
    this.timezone = timezone;
  }

  async execute({ user, now }) {
    const monthly = periodWindow('monthly', { now, timezone: this.timezone });
    const weekly = periodWindow('weekly', { now, timezone: this.timezone, buckets: 8 });
    const [m, w, byStore] = await Promise.all([
      this.purchases.customerSpendingSeries(user.id, monthly.since, monthly.bucketExpr),
      this.purchases.customerSpendingSeries(user.id, weekly.since, weekly.bucketExpr),
      // All-time per store (was the 6-month chart window, so totals undercounted long-time customers).
      this.purchases.customerSpendingByStore(user.id),
    ]);
    const monthlySeries = fillSeries(monthly.labels, m, { amount: 0, itemCount: 0 });
    const weeklySeries = fillSeries(weekly.labels, w, { amount: 0, itemCount: 0 });
    return {
      monthly: monthlySeries,
      weekly: weeklySeries,
      byStore,
      currentMonth: changeOf(monthlySeries),
      currentWeek: changeOf(weeklySeries),
      totalSpent: byStore.reduce((s, x) => s + x.totalSpent, 0),
      totalVisits: byStore.reduce((s, x) => s + x.visitCount, 0),
    };
  }
}

export class CustomerExpiryStrategy {
  role = ROLES.CUSTOMER;
  type = ANALYTICS_TYPES.EXPIRY;

  constructor({ purchaseRepository }) {
    this.purchases = purchaseRepository;
  }

  async execute({ user, now }) {
    const items = await this.purchases.customerExpiringItems(user.id, {
      purchasedSince: addDays(now, -EXPIRY.CUSTOMER_LOOKBACK_DAYS),
      now,
      until: addDays(now, EXPIRY.ANALYTICS_WINDOW_DAYS),
    });
    const expiringItems = items.map((i) => ({ ...i, daysUntilExpiry: daysUntil(i.expiryDate, now) }));
    return { expiringItems, totalExpiringItems: expiringItems.length };
  }
}

// ---------- helpers (Extract Method) ----------

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const round1 = (n) => Math.round(n * 10) / 10;
const thresholdOf = (settings) => settings?.notificationSettings?.expiryThresholdDays ?? EXPIRY.DEFAULT_THRESHOLD_DAYS;
const toLite = (p) => ({ id: String(p._id ?? p.id), name: p.name, stock: p.stock, category: p.category, expiryDate: p.expiryDate });

export function confidenceOf(salesLines) {
  if (salesLines >= PREDICTION.HIGH_CONFIDENCE_MIN_SALES) return 'high';
  if (salesLines >= PREDICTION.MEDIUM_CONFIDENCE_MIN_SALES) return 'medium';
  return 'low';
}

function changeOf(series) {
  const current = series.at(-1)?.amount || 0;
  const previous = series.at(-2)?.amount || 0;
  return { amount: current, previous, changePct: previous > 0 ? round1(((current - previous) / previous) * 100) : null };
}

/** Least-squares line through the series, projected `ahead` points. */
export function linearForecast(values, ahead) {
  const n = values.length;
  if (n < 2) return Array.from({ length: ahead }, () => values[0] || 0);
  const xs = values.map((_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (values[i] - meanY), 0);
  const den = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return Array.from({ length: ahead }, (_, k) => Math.max(0, Math.round(intercept + slope * (n + k))));
}

export function buildRecommendations(rows) {
  const recs = [];
  for (const r of rows) {
    if (r.coverDays !== null && r.coverDays < PREDICTION.RESTOCK_COVER_DAYS && r.daysUntilExpiry > r.coverDays) {
      recs.push({ type: 'stock', priority: 'high', productId: r.productId, message: `Restock ${r.productName}: about ${r.coverDays} day(s) of stock left at current demand` });
    }
    if (r.riskScore >= 50) {
      recs.push({ type: 'promotion', priority: r.riskScore >= 80 ? 'high' : 'medium', productId: r.productId, message: `Discount ${r.productName}: ~${r.unitsAtRisk} unit(s) may expire unsold in ${r.daysUntilExpiry} day(s)` });
    } else if (r.unitsSold === 0 && r.stock > 0 && r.daysUntilExpiry > 0 && r.daysUntilExpiry <= EXPIRY.ANALYTICS_WINDOW_DAYS) {
      recs.push({ type: 'expiry', priority: 'low', productId: r.productId, message: `${r.productName} has no recent sales and expires in ${r.daysUntilExpiry} day(s)` });
    }
  }
  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, PREDICTION.TOP_N);
}
