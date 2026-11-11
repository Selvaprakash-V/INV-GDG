import { randomUUID } from 'node:crypto';
import { InsufficientStockError, NotFoundError, ServiceUnavailableError } from '../core/errors';
import { decodeCursor, encodeCursor } from '../core/pagination';
import { EVENTS } from '../config/constants';
import { ROLES } from '@/shared/constants';
import { parse, purchaseCreateSchema, purchaseListQuerySchema } from '../validation/schemas';

const TXN_UNSUPPORTED = /Transaction numbers are only allowed|replica set/i;

/**
 * Records sales atomically:
 * - quantities validated (>= 1) at the boundary (negative qty used to *add* stock)
 * - stock decremented with an atomic conditional update (no overselling)
 * - prices and total computed server-side (client total is ignored)
 * - all writes in one MongoDB transaction (no partial updates)
 */
export class PurchaseService {
  constructor({ purchaseRepository, productRepository, userRepository, events, runInTransaction, now = () => new Date() }) {
    this.purchases = purchaseRepository;
    this.products = productRepository;
    this.users = userRepository;
    this.events = events;
    this.runInTransaction = runInTransaction;
    this.now = now;
  }

  async record(admin, input) {
    const data = parse(purchaseCreateSchema, input);
    const customer = await this.users.findCustomer({ id: data.customerId, email: data.customerEmail });
    if (!customer) throw new NotFoundError('Customer');

    const lines = mergeLines(data.items);

    let purchase;
    try {
      purchase = await this.runInTransaction(async (session) => {
        const items = [];
        for (const { productId, quantity } of lines) {
          const updated = await this.products.decrementStock(productId, admin.id, quantity, { session });
          if (!updated) {
            const [existing] = await this.products.findManyForStore([productId], admin.id, { session });
            if (!existing) throw new NotFoundError(`Product ${productId}`);
            throw new InsufficientStockError(existing.name);
          }
          items.push({
            productId,
            productName: updated.name,
            quantity,
            price: updated.price,
            expiryDate: updated.expiryDate,
            remainingStock: updated.stock,
          });
        }
        const totalAmount = roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
        const created = await this.purchases.create(
          {
            customerId: customer.id,
            storeId: admin.id,
            items: items.map(({ remainingStock: _r, ...i }) => i),
            totalAmount,
            paymentMethod: data.paymentMethod,
            receiptNumber: `REC-${this.now().getTime()}-${randomUUID().slice(0, 8)}`,
            purchaseDate: this.now(),
          },
          { session }
        );
        return { ...created, remaining: items.map((i) => ({ productId: i.productId, name: i.productName, stock: i.remainingStock })) };
      });
    } catch (err) {
      if (TXN_UNSUPPORTED.test(err?.message || '')) {
        throw new ServiceUnavailableError('Database must run as a replica set to record sales (see README)');
      }
      throw err;
    }

    const { remaining, ...publicPurchase } = purchase;
    await this.events.emit(EVENTS.PURCHASE_RECORDED, {
      storeId: admin.id,
      customerId: customer.id,
      purchaseId: publicPurchase.id,
      remaining,
    });
    return publicPurchase;
  }

  async list(user, query) {
    const q = parse(purchaseListQuerySchema, query);
    // Admins are always pinned to their own store; customers to their own purchases (optionally one store).
    const scope = user.role === ROLES.ADMIN ? { storeId: user.id } : { customerId: user.id, ...(q.storeId ? { storeId: q.storeId } : {}) };
    const { items, hasNext } = await this.purchases.list({ ...scope, from: q.from, to: q.to, cursor: decodeCursor(q.cursor), limit: q.limit });
    const last = items[items.length - 1];
    return {
      purchases: items,
      pagination: { limit: q.limit, hasNext, nextCursor: hasNext && last ? encodeCursor(last.purchaseDate, last.id) : null },
    };
  }
}

/** Combine duplicate product lines so each product is decremented once. */
export function mergeLines(items) {
  const map = new Map();
  for (const { productId, quantity } of items) map.set(productId, (map.get(productId) || 0) + quantity);
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

const roundMoney = (n) => Math.round(n * 100) / 100;
