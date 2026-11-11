import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, clearDb, makeContainer, seedUsers, productInput, fakeNotifier } from './helpers';
import { Product } from '@/server/db/models/Product';
import { Purchase } from '@/server/db/models/Purchase';
import { InsufficientStockError, NotFoundError, ValidationError } from '@/server/core/errors';
import { JOB_TYPES } from '@/server/config/constants';
import { Job } from '@/server/db/models/Job';

let replSet;
let c;
let u;

beforeAll(async () => {
  replSet = await startDb();
});
afterAll(async () => stopDb(replSet));
beforeEach(async () => {
  await clearDb();
  c = await makeContainer();
  u = await seedUsers(c);
});

const stockOf = async (id) => (await Product.findById(id).lean()).stock;
const sale = (productId, quantity, extra = {}) => ({ customerEmail: u.customer.email, items: [{ productId, quantity }], ...extra });

describe('PurchaseService.record', () => {
  it('rejects negative quantities without touching stock (was: stock 10 -> 15)', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 10 }));
    await expect(c.purchaseService.record(u.adminA, sale(p.id, -5))).rejects.toBeInstanceOf(ValidationError);
    expect(await stockOf(p.id)).toBe(10);
  });

  it('computes prices and total on the server (client total ignored)', async () => {
    const p = await c.productService.create(u.adminA, productInput({ price: 100, stock: 10 }));
    const purchase = await c.purchaseService.record(u.adminA, sale(p.id, 2, { totalAmount: 1 }));
    expect(purchase.totalAmount).toBe(200);
    expect(purchase.items[0].price).toBe(100);
    expect(await stockOf(p.id)).toBe(8);
  });

  it('is all-or-nothing across items (was: partial stock deduction)', async () => {
    const p1 = await c.productService.create(u.adminA, productInput({ stock: 10 }));
    const p2 = await c.productService.create(u.adminA, productInput({ stock: 1, name: 'Bread' }));
    const input = { customerEmail: u.customer.email, items: [{ productId: p1.id, quantity: 3 }, { productId: p2.id, quantity: 5 }] };
    await expect(c.purchaseService.record(u.adminA, input)).rejects.toBeInstanceOf(InsufficientStockError);
    expect(await stockOf(p1.id)).toBe(10);
    expect(await stockOf(p2.id)).toBe(1);
    expect(await Purchase.countDocuments()).toBe(0);
  });

  it('never oversells under concurrency (was: 6 of 12 succeeded, stock -3)', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 3 }));
    const results = await Promise.allSettled(Array.from({ length: 12 }, () => c.purchaseService.record(u.adminA, sale(p.id, 1))));
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(3);
    expect(await stockOf(p.id)).toBe(0);
    expect(await Purchase.countDocuments()).toBe(3);
  });

  it("cannot sell another store's product", async () => {
    const p = await c.productService.create(u.adminB, productInput({ stock: 5 }));
    await expect(c.purchaseService.record(u.adminA, sale(p.id, 1))).rejects.toBeInstanceOf(NotFoundError);
    expect(await stockOf(p.id)).toBe(5);
  });

  it('requires an existing customer account (was: any ObjectId accepted)', async () => {
    const p = await c.productService.create(u.adminA, productInput());
    await expect(c.purchaseService.record(u.adminA, { ...sale(p.id, 1), customerEmail: 'ghost@test.io' })).rejects.toBeInstanceOf(NotFoundError);
    await expect(c.purchaseService.record(u.adminA, { ...sale(p.id, 1), customerEmail: u.adminB.email })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('merges duplicate lines into one decrement', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 5, price: 10 }));
    const purchase = await c.purchaseService.record(u.adminA, {
      customerEmail: u.customer.email,
      items: [{ productId: p.id, quantity: 2 }, { productId: p.id, quantity: 3 }],
    });
    expect(purchase.items).toHaveLength(1);
    expect(purchase.totalAmount).toBe(50);
    expect(await stockOf(p.id)).toBe(0);
  });
});

describe('PurchaseService.list (keyset pagination + scoping)', () => {
  it('pages through results without duplicates and scopes by role', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 100 }));
    for (let i = 0; i < 5; i += 1) await c.purchaseService.record(u.adminA, sale(p.id, 1));
    await c.purchaseService.record(u.adminA, { ...sale(p.id, 1), customerEmail: u.customer2.email });

    const seen = [];
    let cursor;
    do {
      const page = await c.purchaseService.list(u.adminA, { limit: '2', ...(cursor ? { cursor } : {}) });
      seen.push(...page.purchases.map((x) => x.id));
      cursor = page.pagination.nextCursor;
    } while (cursor);
    expect(seen).toHaveLength(6);
    expect(new Set(seen).size).toBe(6);

    const mine = await c.purchaseService.list(u.customer, { limit: '50' });
    expect(mine.purchases).toHaveLength(5);
    expect(mine.purchases[0].store.shopName).toBe('Shop A');
    expect(await c.purchaseService.list(u.adminB, {})).toMatchObject({ purchases: [] });
  });
});

describe('async low-stock alerts', () => {
  it('enqueues a job after a sale and the worker sends it', async () => {
    const notifier = fakeNotifier();
    c = await makeContainer({ notifier });
    const p = await c.productService.create(u.adminA, productInput({ stock: 16, name: 'Eggs' }));
    await c.purchaseService.record(u.adminA, sale(p.id, 2));
    expect(await Job.countDocuments({ type: JOB_TYPES.LOW_STOCK_ALERT })).toBe(1);
    const summary = await c.jobQueue.drain();
    expect(summary.succeeded).toBe(1);
    expect(notifier.sent[0].to).toBe(u.adminA.email);
    expect(notifier.sent[0].text).toContain('Eggs: 14 left');
  });
});
