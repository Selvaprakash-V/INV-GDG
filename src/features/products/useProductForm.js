'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { toProductPayload, validateProduct } from './productFormModel';

/** Server error → { fieldErrors, message }. 409 DUPLICATE is shown on the barcode field. */
export function describeProductError(err) {
  if (!(err instanceof ApiError)) {
    return { fieldErrors: {}, message: 'Network error. Check your connection and try again.' };
  }
  if (err.code === 'VALIDATION_ERROR') {
    const { _: general, ...fieldErrors } = err.details ?? {};
    return { fieldErrors, message: general || 'Please fix the highlighted fields.' };
  }
  if (err.code === 'DUPLICATE') {
    return { fieldErrors: { barcode: 'A product with this barcode already exists in your store.' }, message: '' };
  }
  return { fieldErrors: {}, message: err.message || 'Something went wrong. Please try again.' };
}

/**
 * Shared state for the add/edit product forms.
 * @param {object} opts
 * @param {object} opts.initialValues
 * @param {boolean} [opts.requireFutureExpiry]
 * @param {(payload: object) => Promise<unknown>} opts.onSubmit  resolves on success
 */
export function useProductForm({ initialValues, requireFutureExpiry = false, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const setField = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChange = (e) => setField(e.target.id, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const clientErrors = validateProduct(values, { requireFutureExpiry });
    setErrors(clientErrors);
    setFormError('');
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(toProductPayload(values));
      setSucceeded(true);
      // Leave isSubmitting set: the caller navigates away on success.
    } catch (err) {
      const { fieldErrors, message } = describeProductError(err);
      setErrors(fieldErrors);
      setFormError(message);
      setIsSubmitting(false);
    }
  };

  return { values, errors, formError, isSubmitting, succeeded, setField, handleChange, handleSubmit };
}
