import mongoose from 'mongoose';
import { Product } from '../db/models/Product';
import { EXPIRY, STOCK_LEVELS } from '@/shared/constants';
import { addDays } from '@/shared/expiry';
import { ConflictError } from '../core/errors';

const MONGO_DUPLICATE_KEY = 11000;

const SORTS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  expiry: { expiryDate: 1, _id: 1 },
  stock: { stock: 1, _id: 1 },
  name: { name: 1, _id: 1 },
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const oid = (id) => new mongoose.Types.ObjectId(String(id));

/**
 * Repository: the only place that knows how products are stored.
 * Every query is tenant-scoped by storeId.
 */
export class ProductRepository {
  constructor({ model = Product, readPreference = () => 'primary' } = {}) {
    this.model = model;
    this.readPreference = readPreference;
  }

  async create(data) {
    try {
      const doc = await this.model.create(data);
      return doc.toJSON();
    } catch (err) {
      throw translateDuplicate(err);
    }
  }

  async findForStore(id, storeId) {
    return this.model.findOne({ _id: id, storeId, isActive: true }).lean({ virtuals: false }).then(normalize);
  }

  async findManyForStore(ids, storeId, { session } = {}) {
    return this.model
      .find({ _id: { $in: ids }, storeId, isActive: true })
      .session(session ?? null)
      .lean()
      .then((rows) => rows.map(normalize));
  }

  async list({ storeId, page, limit, category, search, expiringWithinDays, expiresFrom, expiresTo, sort }, now = new Date()) {
    const filter = { storeId: oid(storeId), isActive: true };
    if (category) filter.category = category;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { barcode: rx }, { description: rx }];
    }
    if (expiringWithinDays !== undefined || expiresFrom || expiresTo) {
      filter.expiryDate = {};
      if (expiringWithinDays !== undefined) filter.expiryDate.$lte = addDays(now, expiringWithinDays);
      if (expiresFrom) filter.expiryDate.$gte = expiresFrom;
      if (expiresTo) filter.expiryDate.$lte = expiresTo;
    }
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .read(this.readPreference())
        .lean(),
      this.model.countDocuments(filter).read(this.readPreference()),
    ]);
    return { items: items.map(normalize), total };
  }

  async update(id, storeId, patch) {
    return this.model
      .findOneAndUpdate({ _id: id, storeId, isActive: true }, { $set: patch }, { new: true, runValidators: true })
      .lean()
      .then(normalize)
      .catch((err) => {
        throw translateDuplicate(err);
      });
  }

  /** Store closure (account deletion): hide every product in one write. */
  async deactivateAllForStore(storeId, { session } = {}) {
    const res = await this.model.updateMany({ storeId, isActive: true }, { $set: { isActive: false } }, { session });
    return res.modifiedCount;
  }

  /** Streams every product of a store (data export) without loading them all into memory. */
  cursorForStore(storeId) {
    return this.model.find({ storeId }).sort({ _id: 1 }).lean().cursor({ transform: normalize });
  }

  async softDelete(id, storeId) {
    const res = await this.model.updateOne({ _id: id, storeId, isActive: true }, { $set: { isActive: false } });
    return res.modifiedCount === 1;
  }

  /**
   * Atomic conditional decrement: succeeds only if the product is active, unexpired
   * (expiryDate > now, same rule as shared isExpired) and has enough stock.
   * Fixes the old check-then-act race that oversold (stock went to -3).
   */
  async decrementStock(id, storeId, quantity, { session, now = new Date() } = {}) {
    return this.model
      .findOneAndUpdate(
        { _id: id, storeId, isActive: true, stock: { $gte: quantity }, expiryDate: { $gt: now } },
        { $inc: { stock: -quantity } },
        { new: true, session }
      )
      .lean()
      .then(normalize);
  }

  async findExpiringForStore(storeId, from, to, limit) {
    return this.model
      .find({ storeId, isActive: true, expiryDate: { $gte: from, $lte: to } })
      .sort({ expiryDate: 1 })
      .limit(limit)
      .read(this.readPreference())
      .lean()
      .then((rows) => rows.map(normalize));
  }

  async findActiveForStore(storeId, { fields = 'name category stock expiryDate price' } = {}) {
    return this.model
      .find({ storeId, isActive: true })
      .select(fields)
      .read(this.readPreference())
      .lean()
      .then((rows) => rows.map(normalize));
  }

  /** Dashboard summary computed in one aggregation (was: ship every product to the browser). */
  async inventorySummary(storeId, { now = new Date(), thresholdDays = EXPIRY.DEFAULT_THRESHOLD_DAYS } = {}) {
    const soon = addDays(now, thresholdDays);
    const statusSoon = addDays(now, EXPIRY.SOON_DAYS);
    const [res] = await this.model
      .aggregate([
        { $match: { storeId: oid(storeId), isActive: true } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalItems: { $sum: 1 },
                  totalUnits: { $sum: '$stock' },
                  inventoryValue: { $sum: { $multiply: ['$stock', '$price'] } },
                  availableItems: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
                  outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
                  expired: { $sum: { $cond: [{ $lte: ['$expiryDate', now] }, 1, 0] } },
                  expiringSoon: {
                    $sum: { $cond: [{ $and: [{ $gt: ['$expiryDate', now] }, { $lte: ['$expiryDate', soon] }] }, 1, 0] },
                  },
                  statusExpiring: {
                    $sum: { $cond: [{ $and: [{ $gt: ['$expiryDate', now] }, { $lte: ['$expiryDate', statusSoon] }] }, 1, 0] },
                  },
                },
              },
            ],
            byCategory: [
              { $group: { _id: '$category', items: { $sum: 1 }, stock: { $sum: '$stock' } } },
              { $sort: { stock: -1 } },
            ],
            stockLevels: [
              {
                $bucket: {
                  groupBy: '$stock',
                  boundaries: [0, STOCK_LEVELS.CRITICAL_MAX + 1, STOCK_LEVELS.LOW_MAX + 1, STOCK_LEVELS.MEDIUM_MAX + 1],
                  default: 'high',
                  output: { count: { $sum: 1 } },
                },
              },
            ],
            topByStock: [{ $sort: { stock: -1 } }, { $limit: 5 }, { $project: { name: 1, stock: 1 } }],
            lowStock: [
              { $match: { stock: { $gt: 0, $lt: STOCK_LEVELS.LOW_STOCK_ALERT } } },
              { $sort: { stock: 1 } },
              { $limit: 5 },
              { $project: { name: 1, stock: 1, category: 1 } },
            ],
            expiringSoonItems: [
              { $match: { expiryDate: { $gt: now, $lte: soon } } },
              { $sort: { expiryDate: 1 } },
              { $limit: 10 },
              { $project: { name: 1, stock: 1, category: 1, expiryDate: 1 } },
            ],
            expiredItems: [
              { $match: { expiryDate: { $lte: now } } },
              { $sort: { expiryDate: -1 } },
              { $limit: 10 },
              { $project: { name: 1, stock: 1, category: 1, expiryDate: 1 } },
            ],
          },
        },
      ])
      .read(this.readPreference());
    return res;
  }

  /** Stores with active products expiring inside a window — used by the digest job. */
  async countExpiringForStore(storeId, from, to) {
    return this.model.countDocuments({ storeId, isActive: true, expiryDate: { $gte: from, $lte: to } });
  }
}

/** Persistence errors become domain errors here, so services never see driver codes. */
function translateDuplicate(err) {
  if (err?.code === MONGO_DUPLICATE_KEY) {
    return new ConflictError('A product with this barcode already exists in your store', 'DUPLICATE');
  }
  return err;
}

function normalize(doc) {
  if (!doc) return null;
  return { ...doc, id: String(doc._id), _id: String(doc._id), storeId: String(doc.storeId) };
}
