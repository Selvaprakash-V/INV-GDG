import { z } from 'zod';
import {
  ROLES,
  PRODUCT_CATEGORIES,
  PAYMENT_METHODS,
  LIMITS,
  PAGINATION,
  EXPIRY,
  ANALYTICS_TYPES,
  ANALYTICS_PERIODS,
} from '@/shared/constants';
import { ValidationError, formatZodIssues } from '../core/errors';

// All input crosses this boundary. Schemas whitelist fields (unknown keys are
// stripped), which closes the old mass-assignment hole (e.g. PUT { storeId }).

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');
const email = z.string().trim().toLowerCase().pipe(z.email('Invalid email'));
const password = z
  .string()
  .min(LIMITS.PASSWORD_MIN, `Password must be at least ${LIMITS.PASSWORD_MIN} characters`)
  .max(LIMITS.PASSWORD_MAX)
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/\d/, 'Password needs a number');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Name is required').max(LIMITS.FULL_NAME_MAX),
    email,
    password,
    confirmPassword: z.string(),
    role: z.enum([ROLES.ADMIN, ROLES.CUSTOMER]),
    shopName: z.string().trim().max(LIMITS.SHOP_NAME_MAX).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
    }
    if (v.role === ROLES.ADMIN && !v.shopName) {
      ctx.addIssue({ code: 'custom', path: ['shopName'], message: 'Shop name is required for administrators' });
    }
  });

export const loginSchema = z.object({ email, password: z.string().min(1).max(LIMITS.PASSWORD_MAX) });

const productFields = {
  name: z.string().trim().min(1, 'Name is required').max(LIMITS.NAME_MAX),
  description: z.string().trim().max(LIMITS.DESCRIPTION_MAX).optional().default(''),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.coerce.number().min(0).max(LIMITS.MAX_PRICE),
  stock: z.coerce.number().int().min(0).max(LIMITS.MAX_STOCK),
  expiryDate: z.coerce.date(),
  barcode: z.string().trim().min(1, 'Barcode is required').max(LIMITS.BARCODE_MAX),
  image: z.string().trim().max(2048).optional(),
};

export const productCreateSchema = z.object(productFields);

export const productUpdateSchema = z
  .object({
    ...productFields,
    description: z.string().trim().max(LIMITS.DESCRIPTION_MAX).optional(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'No updatable fields provided');

const pageParams = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
};

export const productListQuerySchema = z.object({
  ...pageParams,
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  search: z.string().trim().max(LIMITS.SEARCH_MAX).optional(),
  expiringWithinDays: z.coerce.number().int().min(0).max(365).optional(),
  expiresFrom: z.coerce.date().optional(),
  expiresTo: z.coerce.date().optional(),
  sort: z.enum(['newest', 'expiry', 'stock', 'name']).default('newest'),
});

export const purchaseCreateSchema = z
  .object({
    customerId: objectId.optional(),
    customerEmail: email.optional(),
    items: z
      .array(z.object({ productId: objectId, quantity: z.coerce.number().int().min(1).max(LIMITS.MAX_ITEM_QUANTITY) }))
      .min(1, 'At least one item is required')
      .max(LIMITS.MAX_ITEMS_PER_PURCHASE),
    paymentMethod: z.enum(PAYMENT_METHODS).default('Cash'),
  })
  .refine((v) => v.customerId || v.customerEmail, {
    message: 'customerEmail or customerId is required',
    path: ['customerEmail'],
  });

export const purchaseListQuerySchema = z.object({
  limit: pageParams.limit,
  /** Customers can narrow their history to one store. */
  storeId: objectId.optional(),
  cursor: z.string().max(200).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const analyticsQuerySchema = z.object({
  type: z.enum(Object.values(ANALYTICS_TYPES)),
  period: z.enum(ANALYTICS_PERIODS).default('weekly'),
});

export const settingsUpdateSchema = z
  .object({
    notificationSettings: z
      .object({
        expiryThresholdDays: z.coerce.number().int().min(EXPIRY.MIN_THRESHOLD_DAYS).max(EXPIRY.MAX_THRESHOLD_DAYS),
        emailEnabled: z.boolean(),
        dailyDigest: z.boolean(),
      })
      .partial()
      .optional(),
    budget: z
      .object({ monthly: z.coerce.number().min(0).max(LIMITS.MAX_PRICE), weekly: z.coerce.number().min(0).max(LIMITS.MAX_PRICE) })
      .partial()
      .optional(),
  })
  .refine((v) => v.notificationSettings || v.budget, 'Nothing to update');

export const idParamSchema = z.object({ id: objectId });

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(LIMITS.FULL_NAME_MAX),
  email,
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(2000),
});

/** Parse or throw a ValidationError with per-field details. */
export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError('Invalid request', formatZodIssues(result.error.issues));
  return result.data;
}

/** URLSearchParams -> plain object (drops bracket keys like `category[$ne]`). */
export function queryToObject(searchParams) {
  const out = {};
  for (const [k, v] of searchParams.entries()) {
    if (/^[a-zA-Z0-9_]+$/.test(k)) out[k] = v;
  }
  return out;
}
