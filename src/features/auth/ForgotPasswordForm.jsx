'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api-client';
import AuthCard, { AuthMessage } from './AuthCard';
import AuthField from './AuthField';
import { isValidEmail } from './authRules';

/** Step 1 of password reset. The response never says whether the account exists. */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isValidEmail(email)) {
      setFieldError('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    setFieldError('');
    setError('');
    try {
      await api.post('/api/account/password/forgot', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'RATE_LIMITED'
          ? 'Too many requests. Please try again later.'
          : 'Could not send the link. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      icon={KeyRound}
      title="Forgot your password?"
      description="Enter your account email and we will send you a link to choose a new one."
      footer={
        <Link href="/login" className="text-sm text-purple-700 font-medium hover:text-purple-800 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <AuthMessage type="success">
          If an account exists for {email.trim()}, a reset link is on its way. It works once and expires in 30 minutes. Check your spam folder if it
          does not arrive.
        </AuthMessage>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError || undefined}
            required
          />
          {error && <AuthMessage type="error">{error}</AuthMessage>}
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
