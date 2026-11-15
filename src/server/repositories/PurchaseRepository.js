import mongoose from 'mongoose';
import { Purchase } from '../db/models/Purchase';
import { keysetFilter } from '../core/pagination';

const oid = (id) => new mongoose.Types.ObjectId(String(id));

export class PurchaseRepository {
  constructor({ model = Purchase, readPreference = () => 'primary' } = {}) {
    this.model = model;
    this.readPreference = readPreference;
  }

  async create(doc, { session } = {}) {
    const [created] = await this.model.create([doc], { session });
    return created.toJSON();
  }

  /** Keyset pagination: stable and O(limit) regardless of how deep the user scrolls. */
  async list({ storeId, customerId, from, to, cursor, limit }) {
    const filter = {};
    if (storeId) filter.storeId = oid(storeId);
    if (customerId) filter.customerId = oid(customerId);
    if (from || to) {
      filter.purchaseDate = {};
      if (from) filter.purchaseDate.$gte = from;
      if (to) filter.purchaseDate.$lte = to;
    }
    Object.assign(filter, keysetFilter('purchaseDate', cursor, oid));

    const rows = await this.model
      .find(filter)
      .sort({ purchaseDate: -1, _id: -1 })
      .limit(limit + 1)
      .populate('customerId', 'fullName email')
      .populate('storeId', 'shopName')
      .read(this.readPreference())
      .lean();
    const hasNext = rows.length > limit;
    return { items: rows.slice(0, limit).map(normalize), hasNext };
  }

  /** Streams a store's sales or a customer's purchases (data export), oldest first. */
  cursorFor({ storeId, customerId }) {
    const filter = storeId ? { storeId: oid(storeId) } : { customerId: oid(customerId) };
    return this.model
      .find(filter)
      .sort({ purchaseDate: 1, _id: 1 })
      .populate('storeId', 'shopName')
      .lean()
      .cursor({ transform: normalize });
  }

  /** Revenue/units bucketed in the database (bucketExpr from analytics/periods), not in app memory. */
  async salesSeries(storeId, since, bucketExpr) {
    return this.model
      .aggregate([
        { $match: { storeId: oid(storeId), purchaseDate: { $gte: since } } },
        {
          $group: {
            _id: bucketExpr,
            totalSales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            itemCount: { $sum: { $sum: '$items.quantity' } },
          },
        },
        { $project: { _id: 0, key: '$_id', totalSales: 1, orders: 1, itemCount: 1 } },
      ])
      .read(this.readPreference());
  }

  async productSales(storeId, since, limit) {
    return this.model
      .aggregate([
        { $match: { storeId: oid(storeId), purchaseDate: { $gte: since } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $last: '$items.productName' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            salesLines: { $sum: 1 },
            firstSale: { $min: '$purchaseDate' },
          },
        },
        { $sort: { totalQuantity: -1 } },
        ...(limit ? [{ $limit: limit }] : []),
        { $project: { _id: 0, productId: { $toString: '$_id' }, productName: 1, totalQuantity: 1, totalRevenue: 1, salesLines: 1, firstSale: 1 } },
      ])
      .read(this.readPreference());
  }

  async storeTotals(storeId, since) {
    const [res] = await this.model
      .aggregate([
        { $match: { storeId: oid(storeId), purchaseDate: { $gte: since } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } },
      ])
      .read(this.readPreference());
    return res || { totalRevenue: 0, totalOrders: 0 };
  }

  async customerSpendingSeries(customerId, since, bucketExpr) {
    return this.model
      .aggregate([
        { $match: { customerId: oid(customerId), purchaseDate: { $gte: since } } },
        {
          $group: {
            _id: bucketExpr,
            amount: { $sum: '$totalAmount' },
            itemCount: { $sum: { $sum: '$items.quantity' } },
          },
        },
        { $project: { _id: 0, key: '$_id', amount: 1, itemCount: 1 } },
      ])
      .read(this.readPreference());
  }

  /** Per-store totals for one customer; all-time unless `since` is given (index: customerId, purchaseDate). */
  async customerSpendingByStore(customerId, since) {
    const match = { customerId: oid(customerId), ...(since ? { purchaseDate: { $gte: since } } : {}) };
    return this.model
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$storeId',
            totalSpent: { $sum: '$totalAmount' },
            visitCount: { $sum: 1 },
            lastVisit: { $max: '$purchaseDate' },
          },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'store', pipeline: [{ $project: { shopName: 1 } }] } },
        { $sort: { totalSpent: -1 } },
        {
          $project: {
            _id: 0,
            storeId: { $toString: '$_id' },
            storeName: { $ifNull: [{ $first: '$store.shopName' }, 'Closed store'] },
            totalSpent: 1,
            visitCount: 1,
            lastVisit: 1,
          },
        },
      ])
      .read(this.readPreference());
  }

  /** Items a customer bought that expire within a window (store name resolved — was undefined). */
  async customerExpiringItems(customerId, { purchasedSince, now, until }) {
    return this.model
      .aggregate([
        { $match: { customerId: oid(customerId), purchaseDate: { $gte: purchasedSince } } },
        { $unwind: '$items' },
        { $match: { 'items.expiryDate': { $gte: now, $lte: until } } },
        { $lookup: { from: 'users', localField: 'storeId', foreignField: '_id', as: 'store', pipeline: [{ $project: { shopName: 1 } }] } },
        { $sort: { 'items.expiryDate': 1 } },
        {
          $project: {
            _id: 0,
            purchaseId: { $toString: '$_id' },
            productName: '$items.productName',
            quantity: '$items.quantity',
            price: '$items.price',
            value: { $round: [{ $multiply: ['$items.price', '$items.quantity'] }, 2] },
            expiryDate: '$items.expiryDate',
            purchaseDate: 1,
            storeName: { $ifNull: [{ $first: '$store.shopName' }, 'Closed store'] },
          },
        },
      ])
      .read(this.readPreference());
  }
}

function normalize(p) {
  const customer = p.customerId && typeof p.customerId === 'object' && p.customerId._id ? p.customerId : null;
  const store = p.storeId && typeof p.storeId === 'object' && p.storeId._id ? p.storeId : null;
  return {
    id: String(p._id),
    receiptNumber: p.receiptNumber,
    purchaseDate: p.purchaseDate,
    paymentMethod: p.paymentMethod,
    totalAmount: p.totalAmount,
    items: (p.items || []).map((i) => ({ ...i, productId: String(i.productId) })),
    customer: customer ? { id: String(customer._id), fullName: customer.fullName, email: customer.email } : null,
    store: store ? { id: String(store._id), shopName: store.shopName } : null,
  };
}
