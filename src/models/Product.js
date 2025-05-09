import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    maxlength: [100, 'Product name cannot be more than 100 characters'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Dairy', 'Bakery', 'Meat', 'Produce', 'Beverages', 
      'Canned Goods', 'Frozen Foods', 'Snacks', 'Household', 'Other'
    ],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide an expiry date'],
  },
  barcode: {
    type: String,
    unique: true,
    required: [true, 'Please provide a barcode'],
  },
  image: {
    type: String,
    default: '/images/default-product.png',
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a store ID'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for days until expiry
ProductSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  const diffTime = Math.abs(expiryDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for faster queries
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ storeId: 1, expiryDate: 1 });
ProductSchema.index({ barcode: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
