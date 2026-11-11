import { LIMITS, PRODUCT_CATEGORIES } from '@/shared/constants';
import { addDays, startOfDay } from '@/shared/expiry';

// Pure form model for ProductForm: initial values, client validation that mirrors
// productCreateSchema/productUpdateSchema on the server, and the API payload.

export const EMPTY_PRODUCT_VALUES = Object.freeze({
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  expiryDate: null,
  barcode: '',
});

/** API product → form values (numbers become strings so 0 renders and edits naturally). */
export function toFormValues(product) {
  return {
    name: product.name ?? '',
    description: product.description ?? '',
    category: product.category ?? '',
    price: product.price === undefined || product.price === null ? '' : String(product.price),
    stock: product.stock === undefined || product.stock === null ? '' : String(product.stock),
    expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
    barcode: product.barcode ?? '',
  };
}

/** Earliest selectable expiry date for new products (tomorrow). */
export function earliestNewExpiry(now = new Date()) {
  return startOfDay(addDays(now, 1));
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

/** Field → message map; empty when valid. `0` is a valid price and stock. */
export function validateProduct(values, { requireFutureExpiry = false } = {}) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Product name is required';
  else if (name.length > LIMITS.NAME_MAX) errors.name = `Name must be at most ${LIMITS.NAME_MAX} characters`;

  if (!PRODUCT_CATEGORIES.includes(values.category)) errors.category = 'Category is required';

  const price = Number(values.price);
  if (isBlank(values.price) || !Number.isFinite(price)) errors.price = 'Price is required';
  else if (price < 0) errors.price = 'Price cannot be negative';
  else if (price > LIMITS.MAX_PRICE) errors.price = `Price cannot exceed ${LIMITS.MAX_PRICE.toLocaleString()}`;

  const stock = Number(values.stock);
  if (isBlank(values.stock) || !Number.isFinite(stock)) errors.stock = 'Stock quantity is required';
  else if (!Number.isInteger(stock)) errors.stock = 'Stock must be a whole number';
  else if (stock < 0) errors.stock = 'Stock cannot be negative';
  else if (stock > LIMITS.MAX_STOCK) errors.stock = `Stock cannot exceed ${LIMITS.MAX_STOCK.toLocaleString()}`;

  const expiry = values.expiryDate ? new Date(values.expiryDate) : null;
  if (!expiry || Number.isNaN(expiry.getTime())) errors.expiryDate = 'Expiry date is required';
  else if (requireFutureExpiry && startOfDay(expiry) < earliestNewExpiry()) {
    errors.expiryDate = 'Expiry date must be after today';
  }

  const barcode = values.barcode.trim();
  if (!barcode) errors.barcode = 'Barcode is required';
  else if (barcode.length > LIMITS.BARCODE_MAX) errors.barcode = `Barcode must be at most ${LIMITS.BARCODE_MAX} characters`;

  if (values.description.trim().length > LIMITS.DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${LIMITS.DESCRIPTION_MAX} characters`;
  }
  return errors;
}

/** Form values → POST/PUT body. */
export function toProductPayload(values) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category: values.category,
    price: Number(values.price),
    stock: Number(values.stock),
    expiryDate: new Date(values.expiryDate).toISOString(),
    barcode: values.barcode.trim(),
  };
}
