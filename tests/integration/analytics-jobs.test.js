import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, clearDb, makeContainer, seedUsers, productInput, inDays, fakeNotifier } from './helpers';
import { Job, JOB_STATUS } from '@/server/db/models/Job';
import { JOB_TYPES } from '@/server/config/constants';
import { ValidationError } from '@/server/core/errors';

let replSet;
let c;
let u;
let notifier;

beforeAll(async () => {
  replSet = await startDb();
});
afterAll(async () => stopDb(replSet));
beforeEach(async () => {
  await clearDb();
  notifier = fakeNotifier();
  c = await makeContainer({ notifier });
  u = await seedUsers(c);
});

async function seedStore() {
  const milk = await c.productService.create(u.adminA, productInput({ name: 'Milk', price: 50, stock: 60, expiryDate: inDays(3).toISOString() }));
  const rice = await c.productService.create(u.adminA, productInput({ name: 'Rice', category: 'Other', price: 80, stock: 5, expiryDate: inDays(200).toISOString() }));
  await c.productService.create(u.adminA, productInput({ name: 'Old Bread', category: 'Bakery', stock: 2, expiryDate: inDays(-1).toISOString() }));
  await c.productService.create(u.adminA, productInput({ name: 'Empty', stock: 0, expiryDate: inDays(100).toISOString() }));
  for (let i = 0; i < 3; i += 1) {
    await c.purchaseService.record(u.adminA, { customerEmail: u.customer.email, items: [{ productId: milk.id, quantity: 2 }, { productId: rice.id, quantity: 1 }] });
  }
  return { milk, rice };
}

describe('analytics strategies', () => {
  it('inventory summary is computed in the database', async () => {
    await seedStore();
    const r = await c.analyticsService.run(u.adminA, { type: 'inventory' });
    expect(r.stats).toMatchObject({ totalItems: 4, outOfStock: 1, expired: 1, expiringSoon: 1, availableItems: 3 });
    expect(r.expiryBreakdown.find((b) => b.name === 'Expired').value).toBe(1);
    expect(r.lowStock.map((x) => x.name)).toContain('Rice');
    expect(r.expiringSoonItems[0]).toMatchObject({ name: 'Milk', daysUntilExpiry: 3 });
  });

  it('sales totals reflect server-computed prices', async () => {
    await seedStore();
    const r = await c.analyticsService.run(u.adminA, { type: 'sales', period: 'daily' });
    expect(r.totalOrders).toBe(3);
    expect(r.totalRevenue).toBe(3 * (2 * 50 + 80));
    expect(r.salesTrend).toHaveLength(7);
    expect(r.topProducts[0]).toMatchObject({ productName: 'Milk', totalQuantity: 6 });
  });

  it('predictive analysis derives demand and expiry risk from real sales', async () => {
    await seedStore();
    const r = await c.analyticsService.run(u.adminA, { type: 'predictive' });
    const milk = r.predictedDemand.find((x) => x.productName === 'Milk');
    expect(milk.predictedDailyDemand).toBeGreaterThan(0);
    expect(r.expiryRisk[0].productName).toBe('Milk'); // 54 units left, ~6/day, 3 days to expiry
    expect(r.recommendations.some((x) => x.type === 'promotion' && x.message.includes('Milk'))).toBe(true);
    expect(r.forecast).toHaveLength(7);
  });

  it('customer analytics resolve store names (was: undefined)', async () => {
    await seedStore();
    const spending = await c.analyticsService.run(u.customer, { type: 'spending' });
    expect(spending.totalVisits).toBe(3);
    expect(spending.byStore[0].storeName).toBe('Shop A');
    expect(spending.monthly).toHaveLength(6);
    const expiry = await c.analyticsService.run(u.customer, { type: 'expiry' });
    expect(expiry.expiringItems[0]).toMatchObject({ productName: 'Milk', storeName: 'Shop A' });
  });

  it('rejects analytics types not available to the role', async () => {
    await expect(c.analyticsService.run(u.customer, { type: 'predictive' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('caches results and invalidates them when a sale is recorded', async () => {
    const { milk } = await seedStore();
    const before = await c.analyticsService.run(u.adminA, { type: 'sales', period: 'daily' });
    await c.purchaseService.record(u.adminA, { customerEmail: u.customer.email, items: [{ productId: milk.id, quantity: 1 }] });
    const after = await c.analyticsService.run(u.adminA, { type: 'sales', period: 'daily' });
    expect(after.totalOrders).toBe(before.totalOrders + 1);
  });
});

describe('expiry digest pipeline (scheduler -> queue -> worker -> notifier)', () => {
  it('enqueues one idempotent job per store per day and sends it', async () => {
    await seedStore();
    const first = await c.notificationService.scheduleExpiryDigests();
    const second = await c.notificationService.scheduleExpiryDigests();
    expect(first.enqueued).toBe(1); // only Shop A has expiring stock
    expect(second.enqueued).toBe(0); // dedupeKey prevents duplicates
    await c.jobQueue.drain();
    const digests = notifier.sent.filter((m) => m.subject.includes('expiring'));
    expect(digests).toHaveLength(1);
    expect(digests[0]).toMatchObject({ to: u.adminA.email });
    expect(digests[0].text).toContain('Milk');
  });

  it('retries failures with backoff and dead-letters after max attempts', async () => {
    let t = new Date();
    const flaky = fakeNotifier({ failTimes: 1 });
    c = await makeContainer({ notifier: flaky, now: () => t });
    await seedStore();
    await Job.deleteMany({}); // isolate the digest job from the seed's low-stock alerts
    await c.notificationService.scheduleExpiryDigests();
    expect((await c.jobQueue.drain()).failed).toBe(1);
    expect((await c.jobQueue.drain()).processed).toBe(0); // backoff not elapsed
    t = new Date(t.getTime() + 60 * 60_000);
    expect((await c.jobQueue.drain()).succeeded).toBe(1);
    expect(flaky.sent).toHaveLength(1);

    const alwaysDown = { send: () => Promise.reject(new Error('down')) };
    c = await makeContainer({ notifier: alwaysDown, now: () => t });
    await c.jobQueue.enqueue(JOB_TYPES.LOW_STOCK_ALERT, { storeId: u.adminA.id, items: [{ name: 'X', stock: 1 }] }, { maxAttempts: 2 });
    await c.jobQueue.drain();
    t = new Date(t.getTime() + 60 * 60_000);
    await c.jobQueue.drain();
    expect(await Job.countDocuments({ status: JOB_STATUS.DEAD })).toBe(1);
  });
});
