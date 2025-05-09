import mongoose from 'mongoose';

const PurchaseItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

const PurchaseSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [PurchaseItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Cash', 'Mobile Payment', 'Other'],
    default: 'Cash',
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
});

// Index for faster queries
PurchaseSchema.index({ customerId: 1, purchaseDate: -1 });
PurchaseSchema.index({ storeId: 1, purchaseDate: -1 });
PurchaseSchema.index({ 'items.productId': 1 });

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
