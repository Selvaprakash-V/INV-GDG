import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, clearDb, makeContainer, seedUsers, productInput } from './helpers';
import { ConflictError, ForbiddenError, NotFoundError } from '@/server/core/errors';
import { ROLES } from '@/shared/constants';
import { resetEnvCache } from '@/server/config/env';

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

describe('ProductService tenant isolation', () => {
  it("hides other stores' products on get/update/delete/list", async () => {
    const p = await c.productService.create(u.adminB, productInput());
    await expect(c.productService.get(u.adminA, p.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(c.productService.update(u.adminA, p.id, { stock: 1 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(c.productService.remove(u.adminA, p.id)).rejects.toBeInstanceOf(NotFoundError);
    expect((await c.productService.list(u.adminA, {})).products).toHaveLength(0);
  });

  it('ignores storeId in updates (was: product moved to another store)', async () => {
    const p = await c.productService.create(u.adminB, productInput());
    const updated = await c.productService.update(u.adminB, p.id, { storeId: u.adminA.id, stock: 7 });
    expect(updated.storeId).toBe(u.adminB.id);
    expect(updated.stock).toBe(7);
  });

  it('enforces barcode uniqueness per store, not globally', async () => {
    const input = productInput({ barcode: 'SAME-1' });
    await c.productService.create(u.adminA, input);
    await expect(c.productService.create(u.adminA, input)).rejects.toBeInstanceOf(ConflictError);
    await expect(c.productService.create(u.adminB, input)).resolves.toMatchObject({ barcode: 'SAME-1' });
  });

  it('allows re-adding a barcode after soft delete', async () => {
    const p = await c.productService.create(u.adminA, productInput({ barcode: 'RE-1' }));
    await c.productService.remove(u.adminA, p.id);
    await expect(c.productService.create(u.adminA, productInput({ barcode: 'RE-1' }))).resolves.toBeTruthy();
  });

  it('paginates, searches literally (regex-safe) and filters', async () => {
    for (let i = 0; i < 25; i += 1) await c.productService.create(u.adminA, productInput({ name: i === 3 ? 'Jam (Strawberry)' : `Item ${i}` }));
    const page2 = await c.productService.list(u.adminA, { page: '2', limit: '10' });
    expect(page2.products).toHaveLength(10);
    expect(page2.pagination).toMatchObject({ total: 25, totalPages: 3, hasNext: true });
    const found = await c.productService.list(u.adminA, { search: '(Straw' });
    expect(found.products.map((p) => p.name)).toEqual(['Jam (Strawberry)']);
  });

  it('serves cached reads and invalidates them on update', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 4 }));
    expect((await c.productService.get(u.adminA, p.id)).stock).toBe(4);
    await c.productService.update(u.adminA, p.id, { stock: 9 });
    expect((await c.productService.get(u.adminA, p.id)).stock).toBe(9);
  });
});

describe('UserService', () => {
  it('hashes passwords once so registered users can log in (was: test users double-hashed)', async () => {
    expect(await c.userService.authenticate(u.customer.email, 'Passw0rdXy')).toMatchObject({ role: ROLES.CUSTOMER });
    expect(await c.userService.authenticate(u.customer.email, 'wrong')).toBeNull();
    expect(await c.userService.authenticate('nobody@test.io', 'Passw0rdXy')).toBeNull();
  });

  it('rejects duplicate emails case-insensitively', async () => {
    await expect(
      c.userService.register({ fullName: 'X', email: u.customer.email.toUpperCase(), password: 'Passw0rdXy', confirmPassword: 'Passw0rdXy', role: ROLES.CUSTOMER })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('can close admin self-signup for an invite-only pilot', async () => {
    process.env.ALLOW_ADMIN_SIGNUP = 'false';
    resetEnvCache();
    try {
      const closed = await makeContainer();
      await expect(
        closed.userService.register({ fullName: 'Y', email: 'y@test.io', password: 'Passw0rdXy', confirmPassword: 'Passw0rdXy', role: ROLES.ADMIN, shopName: 'S' })
      ).rejects.toBeInstanceOf(ForbiddenError);
    } finally {
      delete process.env.ALLOW_ADMIN_SIGNUP;
      resetEnvCache();
    }
  });

  it('persists settings server-side and refreshes the cache', async () => {
    expect((await c.userService.getSettings(u.adminA.id)).notificationSettings.expiryThresholdDays).toBe(7);
    await c.userService.updateSettings(u.adminA.id, { notificationSettings: { expiryThresholdDays: 3 }, budget: { monthly: 100 } });
    const s = await c.userService.getSettings(u.adminA.id);
    expect(s.notificationSettings).toMatchObject({ expiryThresholdDays: 3, emailEnabled: true });
    expect(s.budget.monthly).toBe(100);
  });
});
