'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ROLES } from '@/shared/constants';
import { describeRegisterError, validateSignup } from './authRules';

const EMPTY_VALUES = { fullName: '', shopName: '', email: '', password: '', confirmPassword: '' };

function toPayload(values, role) {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    password: values.password,
    confirmPassword: values.confirmPassword,
    role,
    ...(role === ROLES.ADMIN ? { shopName: values.shopName.trim() } : {}),
  };
}

/** State + submit logic shared by the customer and administrator sign-up pages. */
export function useSignupForm(role) {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setValues((v) => ({ ...v, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const clientErrors = validateSignup(values, role);
    setErrors(clientErrors);
    setFormError('');
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await api.post('/api/register', toPayload(values, role));
      router.push('/login?registered=1');
      // Stay in the submitting state while navigating away.
    } catch (err) {
      const { fieldErrors, message } = describeRegisterError(err);
      setErrors(fieldErrors);
      setFormError(message);
      setIsSubmitting(false);
    }
  };

  return { values, errors, formError, isSubmitting, handleChange, handleSubmit };
}
