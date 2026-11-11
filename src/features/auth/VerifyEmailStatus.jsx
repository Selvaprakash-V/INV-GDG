'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import AuthCard, { AuthMessage } from './AuthCard';

/** Landing page for the confirmation link (?token=). Redeems it once on load. */
export default function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const [state, setState] = useState({ status: 'pending', message: '' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // effects can run twice in dev; tokens are single-use
    started.current = true;
    const token = searchParams.get('token');
    if (!token) {
      setState({ status: 'error', message: 'This page needs the link from your confirmation email.' });
      return;
    }
    window.history.replaceState(null, '', '/verify-email');
    api
      .post('/api/account/verify-email', { token })
      .then(() => setState({ status: 'ok', message: 'Your email is confirmed. Expiry and stock alerts will reach you.' }))
      .catch((err) => setState({ status: 'error', message: err.message || 'This link is invalid or has expired.' }));
  }, [searchParams]);

  return (
    <AuthCard
      icon={MailCheck}
      title="Confirm your email"
      description={state.status === 'pending' ? 'Checking your link…' : 'Email confirmation'}
      footer={
        <Link href="/login" className="text-sm text-purple-700 font-medium hover:text-purple-800 hover:underline">
          Go to sign in
        </Link>
      }
    >
      {state.status === 'pending' && (
        <p role="status" className="text-center text-gray-600">
          Please wait…
        </p>
      )}
      {state.status === 'ok' && <AuthMessage type="success">{state.message}</AuthMessage>}
      {state.status === 'error' && (
        <div className="space-y-2">
          <AuthMessage type="error">{state.message}</AuthMessage>
          <p className="text-sm text-gray-600">Already signed in? Request a new link from your Account page.</p>
        </div>
      )}
    </AuthCard>
  );
}
