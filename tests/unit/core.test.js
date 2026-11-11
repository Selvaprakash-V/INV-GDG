import { describe, it, expect, vi } from 'vitest';
import { daysUntil, expiryStatus, isExpiringWithin } from '@/shared/expiry';
import { EXPIRY_STATUS, MS_PER_DAY } from '@/shared/constants';
import { AppError, ConflictError, InsufficientStockError, NotFoundError, ValidationError, toAppError } from '@/server/core/errors';
import { redact } from '@/server/core/logger';
import { decodeCursor, encodeCursor, keysetFilter, offsetMeta } from '@/server/core/pagination';
import { EventBus } from '@/server/messaging/EventBus';
import { JobQueue } from '@/server/messaging/JobQueue';
import { JOBS } from '@/server/config/constants';
import { mergeLines } from '@/server/services/PurchaseService';

const now = new Date('2026-06-15T12:00:00Z');
const inDays = (d) => new Date(now.getTime() + d * MS_PER_DAY);

describe('expiry helpers', () => {
  it('reports negative days for expired items (old virtual used Math.abs)', () => {
    expect(daysUntil(inDays(-3), now)).toBe(-3);
    expect(daysUntil(inDays(2), now)).toBe(2);
  });

  it('applies status precedence expired > expiring > out > fresh', () => {
    expect(expiryStatus({ expiryDate: inDays(-1), stock: 0 }, now)).toBe(EXPIRY_STATUS.EXPIRED);
    expect(expiryStatus({ expiryDate: inDays(3), stock: 0 }, now)).toBe(EXPIRY_STATUS.EXPIRING);
    expect(expiryStatus({ expiryDate: inDays(30), stock: 0 }, now)).toBe(EXPIRY_STATUS.OUT_OF_STOCK);
    expect(expiryStatus({ expiryDate: inDays(30), stock: 5 }, now)).toBe(EXPIRY_STATUS.FRESH);
  });

  it('isExpiringWithin excludes already-expired items', () => {
    expect(isExpiringWithin(inDays(0), 7, now)).toBe(false);
    expect(isExpiringWithin(inDays(7), 7, now)).toBe(true);
    expect(isExpiringWithin(inDays(8), 7, now)).toBe(false);
  });
});

describe('errors', () => {
  it('each subclass carries its HTTP status (polymorphism)', () => {
    expect(new ValidationError().status).toBe(400);
    expect(new NotFoundError('Product').message).toBe('Product not found');
    expect(new InsufficientStockError('Milk')).toBeInstanceOf(ConflictError);
  });

  it('hides internal messages from clients', () => {
    const body = toAppError(new Error('connection string mongodb://user:pw@host')).toResponseBody();
    expect(body.message).not.toContain('mongodb');
    expect(body.code).toBe('INTERNAL_ERROR');
  });

  it('maps duplicate-key and cast errors', () => {
    expect(toAppError({ code: 11000, keyPattern: { storeId: 1, barcode: 1 } }).message).toContain('barcode');
    expect(toAppError({ name: 'CastError', path: 'expiryDate' }).status).toBe(400);
    expect(toAppError(new AppError('x', { status: 418 }))).toBeInstanceOf(AppError);
  });
});

describe('logger redaction', () => {
  it('redacts secrets at any depth', () => {
    const out = redact({ email: 'a@b.c', password: 'p', nested: { apiKey: 'k', authorization: 'Bearer x', ok: 1 } });
    expect(out).toEqual({ email: 'a@b.c', password: '[REDACTED]', nested: { apiKey: '[REDACTED]', authorization: '[REDACTED]', ok: 1 } });
  });
});

describe('pagination', () => {
  it('computes offset metadata', () => {
    expect(offsetMeta({ page: 2, limit: 20, total: 45 })).toMatchObject({ totalPages: 3, hasNext: true, hasPrev: true });
    expect(offsetMeta({ page: 1, limit: 20, total: 0 })).toMatchObject({ totalPages: 1, hasNext: false });
  });

  it('round-trips cursors and rejects garbage', () => {
    const id = '507f1f77bcf86cd799439011';
    const c = decodeCursor(encodeCursor(now, id));
    expect(c.id).toBe(id);
    expect(c.date.toISOString()).toBe(now.toISOString());
    expect(() => decodeCursor('not-a-cursor')).toThrow(ValidationError);
  });

  it('builds a (date, _id) keyset filter', () => {
    const f = keysetFilter('purchaseDate', { date: now, id: 'x' }, (v) => `oid(${v})`);
    expect(f.$or[1]).toEqual({ purchaseDate: now, _id: { $lt: 'oid(x)' } });
    expect(keysetFilter('purchaseDate', null)).toEqual({});
  });
});

describe('EventBus', () => {
  it('isolates failing subscribers', async () => {
    const logger = { error: vi.fn() };
    const bus = new EventBus({ logger });
    const ok = vi.fn();
    bus.on('e', () => {
      throw new Error('boom');
    });
    bus.on('e', ok);
    await bus.emit('e', { a: 1 });
    expect(ok).toHaveBeenCalledWith({ a: 1 });
    expect(logger.error).toHaveBeenCalledOnce();
  });
});

describe('JobQueue', () => {
  it('backs off exponentially with a cap', () => {
    expect(JobQueue.backoffMs(1)).toBe(JOBS.BASE_BACKOFF_MS);
    expect(JobQueue.backoffMs(2)).toBe(JOBS.BASE_BACKOFF_MS * 2);
    expect(JobQueue.backoffMs(50)).toBe(JOBS.MAX_BACKOFF_MS);
  });

  it('refuses to enqueue unknown job types', () => {
    const q = new JobQueue({ jobRepository: {} });
    expect(() => q.enqueue('nope', {})).toThrow(/No handler/);
  });
});

describe('mergeLines', () => {
  it('combines duplicate product lines', () => {
    expect(mergeLines([{ productId: 'a', quantity: 1 }, { productId: 'b', quantity: 2 }, { productId: 'a', quantity: 3 }])).toEqual([
      { productId: 'a', quantity: 4 },
      { productId: 'b', quantity: 2 },
    ]);
  });
});
