'use client';

import { useCallback, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import { LIMITS, PAYMENT_METHODS } from '@/shared/constants';

const MIN_QUANTITY = 1;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const maxQuantityFor = (product) => Math.max(MIN_QUANTITY, Math.min(product.stock, LIMITS.MAX_ITEM_QUANTITY));
const clampQuantity = (qty, product) => Math.min(maxQuantityFor(product), Math.max(MIN_QUANTITY, Math.floor(qty) || MIN_QUANTITY));

/** Maps API error codes to messages a cashier can act on. */
export function describeSaleError(err) {
  switch (err?.code) {
    case 'INSUFFICIENT_STOCK':
      return `${err.message}. Lower the quantity or remove the item — stock may have changed since it was added.`;
    case 'NOT_FOUND':
      return /^customer/i.test(err.message)
        ? 'No customer account matches that email. Ask the customer to sign up first, or check the spelling.'
        : 'One of the products no longer exists. Remove it and try again.';
    case 'VALIDATION_ERROR':
      return 'Some details are invalid. Check the highlighted fields.';
    case 'RATE_LIMITED':
      return 'Too many requests. Wait a moment and try again.';
    default:
      return err?.message || 'Could not record the sale. Please try again.';
  }
}

/** Cart state + submission for the "Record sale" page. Prices shown are estimates; the server is authoritative. */
export function useRecordSale() {
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [lines, setLines] = useState([]); // [{ product, quantity }]
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [receipt, setReceipt] = useState(null);

  const addProduct = useCallback((product) => {
    if (product.stock < MIN_QUANTITY) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: clampQuantity(l.quantity + 1, product) } : l));
      }
      if (prev.length >= LIMITS.MAX_ITEMS_PER_PURCHASE) return prev;
      return [...prev, { product, quantity: MIN_QUANTITY }];
    });
    setError(null);
  }, []);

  const setQuantity = useCallback((productId, qty) => {
    setLines((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity: clampQuantity(qty, l.product) } : l)));
  }, []);

  const removeLine = useCallback((productId) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const updateEmail = useCallback((value) => {
    setCustomerEmail(value);
    setFieldErrors((f) => ({ ...f, customerEmail: undefined }));
  }, []);

  const estimatedTotal = useMemo(() => lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0), [lines]);

  const submit = useCallback(async () => {
    const email = customerEmail.trim();
    const errors = {};
    if (!EMAIL_PATTERN.test(email)) errors.customerEmail = 'Enter the customer’s email address';
    if (lines.length === 0) errors.items = 'Add at least one product';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/api/purchases', {
        customerEmail: email,
        paymentMethod,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      });
      setReceipt(res.purchase);
    } catch (err) {
      setError(describeSaleError(err));
      if (err?.details) setFieldErrors(err.details);
      else if (err?.code === 'NOT_FOUND' && /^customer/i.test(err.message)) {
        setFieldErrors({ customerEmail: 'Customer not found' });
      }
    } finally {
      setSubmitting(false);
    }
  }, [customerEmail, paymentMethod, lines]);

  const reset = useCallback(() => {
    setCustomerEmail('');
    setPaymentMethod(PAYMENT_METHODS[0]);
    setLines([]);
    setError(null);
    setFieldErrors({});
    setReceipt(null);
  }, []);

  return {
    customerEmail,
    setCustomerEmail: updateEmail,
    paymentMethod,
    setPaymentMethod,
    lines,
    addProduct,
    setQuantity,
    removeLine,
    maxQuantityFor,
    estimatedTotal,
    submit,
    submitting,
    error,
    fieldErrors,
    receipt,
    reset,
  };
}
