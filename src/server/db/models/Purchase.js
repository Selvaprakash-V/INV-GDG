import mongoose from 'mongoose';
import { PAYMENT_METHODS, LIMITS } from '@/shared/constants';

const PurchaseItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: LIMITS.MAX_ITEM_QUANTITY },
    /** Unit price captured at sale time (server-side, never client-supplied). */
    price: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
  },
  { _id: false }
);

const PurchaseSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [PurchaseItemSchema],
      validate: [(v) => v.length > 0 && v.length <= LIMITS.MAX_ITEMS_PER_PURCHASE, 'Invalid item count'],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'Cash' },
    receiptNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Keyset pagination + analytics windows, per tenant.
PurchaseSchema.index({ storeId: 1, purchaseDate: -1, _id: -1 });
PurchaseSchema.index({ customerId: 1, purchaseDate: -1, _id: -1 });

PurchaseSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret.__v;
    return ret;
  },
});

export const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
