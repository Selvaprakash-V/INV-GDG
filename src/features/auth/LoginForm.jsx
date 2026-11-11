'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_HOME } from '@/shared/constants';
import AuthCard, { AuthMessage } from './AuthCard';
import AuthField from './AuthField';
import { loginErrorMessage, safeCallbackUrl } from './authRules';

/** Email/password sign-in. The role comes from the account, not from the form. */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => loginErrorMessage(searchParams.get('error')));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const result = await signIn('credentials', { email: email.trim(), password, redirect: false });
      if (!result || result.error) {
        setError(loginErrorMessage(result?.error ?? 'UNKNOWN'));
        setIsSubmitting(false);
        return;
      }
      const session = await getSession();
      const destination = callbackUrl ?? ROLE_HOME[session?.user?.role] ?? '/';
      router.replace(destination);
      // Keep the button disabled while the next page loads.
    } catch {
      setError('Sign-in failed. Check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      icon={LogIn}
      title="Welcome Back"
      description="Sign in to your account"
      footer={
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/role" className="text-purple-600 font-medium hover:text-purple-700 hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {justRegistered && <AuthMessage type="success">Account created. Please sign in.</AuthMessage>}

        <AuthField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <AuthMessage type="error">{error}</AuthMessage>}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </motion.div>
      </form>
    </AuthCard>
  );
}
