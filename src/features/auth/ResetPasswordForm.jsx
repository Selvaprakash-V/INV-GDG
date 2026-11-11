'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api-client';
import AuthCard, { AuthMessage } from './AuthCard';
import AuthField from './AuthField';
import { PASSWORD_HINT, validateNewPassword } from './authRules';

/** Step 2 of password reset: the emailed link lands here with ?token=. */
export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get('token') || '');
  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep the single-use token out of browser history.
  useEffect(() => {
    if (searchParams.get('token')) window.history.replaceState(null, '', '/reset-password');
  }, [searchParams]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validateNewPassword(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/account/password/reset', { token, ...values });
      router.replace('/login?reset=1');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details) {
        const { token: tokenError, ...rest } = err.details;
        setFieldErrors(rest);
        if (tokenError) setError('This link is invalid or has expired. Request a new one.');
      } else {
        setError(err.message || 'Could not reset the password. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const footer = (
    <Link href="/forgot-password" className="text-sm text-purple-700 font-medium hover:text-purple-800 hover:underline">
      Request a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthCard icon={ShieldCheck} title="Reset link missing" description="Open the link from your email, or request a new one." footer={footer}>
        <AuthMessage type="error">This page needs the link from your reset email.</AuthMessage>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={ShieldCheck} title="Choose a new password" description="Other devices signed in to this account will be signed out." footer={footer}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="password"
          label="New password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={set('password')}
          error={fieldErrors.password}
          hint={PASSWORD_HINT}
          required
        />
        <AuthField
          id="confirmPassword"
          label="Confirm new password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={set('confirmPassword')}
          error={fieldErrors.confirmPassword}
          required
        />
        {error && <AuthMessage type="error">{error}</AuthMessage>}
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    </AuthCard>
  );
}
