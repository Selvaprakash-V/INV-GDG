import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES, LIMITS } from '@/shared/constants';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: LIMITS.NAME_MAX },
    description: { type: String, trim: true, maxlength: LIMITS.DESCRIPTION_MAX, default: '' },
    category: { type: String, required: true, enum: PRODUCT_CATEGORIES },
    price: { type: Number, required: true, min: 0, max: LIMITS.MAX_PRICE },
    stock: { type: Number, required: true, min: 0, max: LIMITS.MAX_STOCK },
    expiryDate: { type: Date, required: true },
    barcode: { type: String, required: true, trim: true, maxlength: LIMITS.BARCODE_MAX },
    image: { type: String, default: '/images/default-product.png' },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes match the actual query shapes (all queries are store-scoped):
// - barcode is unique *per store* among active products (was globally unique,
//   which blocked two stores from stocking the same item).
ProductSchema.index(
  { storeId: 1, barcode: 1 },
  { unique: true, partialFilterExpression: { isActive: true }, name: 'uniq_store_barcode_active' }
);
// - default listing: newest first
ProductSchema.index({ storeId: 1, isActive: 1, createdAt: -1 });
// - expiry windows, calendar, digest
ProductSchema.index({ storeId: 1, isActive: 1, expiryDate: 1 });
// - category filter
ProductSchema.index({ storeId: 1, isActive: 1, category: 1 });

ProductSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    ret._id = String(ret._id);
    ret.storeId = String(ret.storeId);
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
