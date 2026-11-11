import { describe, it, expect } from 'vitest';
import {
  parse,
  registerSchema,
  productCreateSchema,
  productUpdateSchema,
  purchaseCreateSchema,
  productListQuerySchema,
  queryToObject,
} from '@/server/validation/schemas';
import { ValidationError } from '@/server/core/errors';
import { buildRecommendations, confidenceOf, linearForecast } from '@/server/services/analytics/strategies';
import { fillSeries, periodWindow } from '@/server/services/analytics/periods';

const validProduct = { name: 'Milk', category: 'Dairy', price: 50, stock: 10, expiryDate: '2030-01-01', barcode: 'B1' };

describe('validation', () => {
  it('accepts special characters in passwords (old regex rejected them)', () => {
    const v = parse(registerSchema, { fullName: 'A', email: 'A@X.io ', password: 'Passw0rd!x', confirmPassword: 'Passw0rd!x', role: 'Customer' });
    expect(v.email).toBe('a@x.io');
  });

  it('requires a shop name for administrators and matching passwords', () => {
    try {
      parse(registerSchema, { fullName: 'A', email: 'a@x.io', password: 'Passw0rdx', confirmPassword: 'nope', role: 'Administrator' });
      throw new Error('should fail');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(Object.keys(e.details)).toEqual(expect.arrayContaining(['confirmPassword', 'shopName']));
    }
  });

  it('allows stock 0 and price 0 (old code treated 0 as missing)', () => {
    expect(parse(productCreateSchema, { ...validProduct, stock: 0, price: 0 }).stock).toBe(0);
  });

  it('strips non-whitelisted fields such as storeId (mass assignment)', () => {
    const v = parse(productUpdateSchema, { stock: 3, storeId: 'evil', isActive: false, createdAt: '2000-01-01' });
    expect(v).toEqual({ stock: 3 });
  });

  it('rejects negative or fractional purchase quantities', () => {
    const base = { customerEmail: 'c@x.io', items: [{ productId: '507f1f77bcf86cd799439011', quantity: -5 }] };
    expect(() => parse(purchaseCreateSchema, base)).toThrow(ValidationError);
    expect(() => parse(purchaseCreateSchema, { ...base, items: [{ ...base.items[0], quantity: 1.5 }] })).toThrow(ValidationError);
  });

  it('ignores client-supplied totals', () => {
    const v = parse(purchaseCreateSchema, { customerEmail: 'c@x.io', totalAmount: 1, items: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }] });
    expect(v.totalAmount).toBeUndefined();
  });

  it('caps page size and rejects invalid dates', () => {
    expect(() => parse(productListQuerySchema, { limit: '1000' })).toThrow(ValidationError);
    expect(() => parse(productListQuerySchema, { expiresFrom: 'abc' })).toThrow(ValidationError);
    expect(parse(productListQuerySchema, {})).toMatchObject({ page: 1, limit: 20, sort: 'newest' });
  });

  it('drops operator-style query keys like category[$ne]', () => {
    expect(queryToObject(new URLSearchParams('category[$ne]=x&page=2'))).toEqual({ page: '2' });
  });
});

describe('analytics helpers', () => {
  it('confidence grows with sample size', () => {
    expect(confidenceOf(0)).toBe('low');
    expect(confidenceOf(5)).toBe('medium');
    expect(confidenceOf(50)).toBe('high');
  });

  it('linear forecast follows the trend and never goes negative', () => {
    expect(linearForecast([1, 2, 3, 4], 2)).toEqual([5, 6]);
    expect(linearForecast([10, 5, 0], 3).every((v) => v >= 0)).toBe(true);
    expect(linearForecast([7], 2)).toEqual([7, 7]);
  });

  it('recommends restock for low cover and discount for expiry risk', () => {
    const recs = buildRecommendations([
      { productId: '1', productName: 'Milk', coverDays: 2, daysUntilExpiry: 10, riskScore: 0, unitsSold: 20, stock: 4 },
      { productId: '2', productName: 'Yogurt', coverDays: 40, daysUntilExpiry: 3, riskScore: 90, unitsAtRisk: 18, unitsSold: 2, stock: 20 },
      { productId: '3', productName: 'Jam', coverDays: null, daysUntilExpiry: 20, riskScore: 0, unitsSold: 0, stock: 5 },
    ]);
    expect(recs.map((r) => [r.productId, r.type])).toEqual([
      ['1', 'stock'],
      ['2', 'promotion'],
      ['3', 'expiry'],
    ]);
  });

  it('fills empty buckets so charts have no gaps', () => {
    const win = periodWindow('daily', { now: new Date('2026-06-15T12:00:00Z'), timezone: 'UTC' });
    expect(win.labels).toHaveLength(7);
    const series = fillSeries(win.labels, [{ key: '2026-06-15', totalSales: 9 }], { totalSales: 0 });
    expect(series).toHaveLength(7);
    expect(series.at(-1).totalSales).toBe(9);
    expect(series[0].totalSales).toBe(0);
  });
});
