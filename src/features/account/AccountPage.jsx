'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import { ArrowLeft, CheckCircle2, Download, KeyRound, MailWarning, Trash2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, ApiError, useApi } from '@/lib/api-client';
import { ROLES, ROLE_HOME } from '@/shared/constants';
import { AuthMessage } from '@/features/auth/AuthCard';
import AuthField from '@/features/auth/AuthField';
import { PASSWORD_HINT, validateNewPassword } from '@/features/auth/authRules';

const DELETE_WORD = 'DELETE';

/** Self-service account management: profile, email confirmation, password, data export, deletion. */
export default function AccountPage() {
  const { data, error, loading } = useApi('/api/me');
  const account = data?.account;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 py-10 px-4">
      <main className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCircle className="h-7 w-7 text-purple-600" aria-hidden="true" />
            Your account
          </h1>
          {account && (
            <Button asChild variant="outline" size="sm">
              <Link href={ROLE_HOME[account.role] || '/'}>
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back to dashboard
              </Link>
            </Button>
          )}
        </div>

        {loading && !account && (
          <p role="status" className="text-gray-600">
            Loading your account…
          </p>
        )}
        {error && <AuthMessage type="error">Could not load your account. {error.message}</AuthMessage>}

        {account && (
          <>
            <ProfileCard account={account} />
            <ChangePasswordCard email={account.email} />
            <ExportCard role={account.role} />
            <DeleteAccountCard role={account.role} />
          </>
        )}
      </main>
    </div>
  );
}

function ProfileCard({ account }) {
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const resend = async () => {
    setSending(true);
    setNote('');
    try {
      await api.post('/api/account/verify-email/resend', { email: account.email });
      setNote('A new confirmation link is on its way. Check your inbox and spam folder.');
    } catch (err) {
      setNote(err.code === 'RATE_LIMITED' ? 'Too many requests. Try again later.' : 'Could not send the link. Try again later.');
    } finally {
      setSending(false);
    }
  };

  const rows = [
    ['Name', account.fullName],
    ['Email', account.email],
    ['Account type', account.role === ROLES.ADMIN ? 'Store administrator' : 'Customer'],
    ...(account.shopName ? [['Store', account.shopName]] : []),
    ['Member since', new Date(account.createdAt).toLocaleDateString()],
  ];

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-gray-600">{k}</dt>
              <dd className="text-gray-900 break-all">{v}</dd>
            </div>
          ))}
        </dl>
        {account.emailVerified ? (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Email confirmed
          </p>
        ) : (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 space-y-2">
            <p className="flex items-center gap-2 font-medium">
              <MailWarning className="h-4 w-4" aria-hidden="true" /> Your email is not confirmed yet
            </p>
            <p>Confirm it so expiry and stock alerts reach you. Use the link we emailed when you signed up.</p>
            <Button size="sm" variant="outline" onClick={resend} disabled={sending}>
              {sending ? 'Sending…' : 'Send a new link'}
            </Button>
            {note && <p role="status">{note}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard({ email }) {
  const empty = { currentPassword: '', password: '', confirmPassword: '' };
  const [values, setValues] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errors = validateNewPassword(values);
    if (!values.currentPassword) errors.currentPassword = 'Enter your current password';
    setFieldErrors(errors);
    setMessage(null);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      await api.post('/api/me/password', values);
      // Older sessions (including this one) are now revoked: sign straight back in with the new password.
      const result = await signIn('credentials', { email, password: values.password, redirect: false });
      setValues(empty);
      setMessage(
        result?.error
          ? { type: 'success', text: 'Password changed. Please sign in again.' }
          : { type: 'success', text: 'Password changed. Other devices have been signed out.' }
      );
      if (result?.error) signOut({ callbackUrl: '/login' });
    } catch (err) {
      if (err instanceof ApiError && err.details) setFieldErrors(err.details);
      setMessage({ type: 'error', text: err.message || 'Could not change the password.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-purple-600" aria-hidden="true" /> Change password
        </CardTitle>
        <CardDescription>Other devices signed in to this account will be signed out.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <AuthField
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={set('currentPassword')}
            error={fieldErrors.currentPassword}
          />
          <AuthField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={set('password')}
            error={fieldErrors.password}
            hint={PASSWORD_HINT}
          />
          <AuthField
            id="confirmNewPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={set('confirmPassword')}
            error={fieldErrors.confirmPassword}
          />
          {message && <AuthMessage type={message.type}>{message.text}</AuthMessage>}
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving} aria-busy={saving}>
            {saving ? 'Saving…' : 'Change password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ExportCard({ role }) {
  const what = role === ROLES.ADMIN ? 'your profile, settings, products and sales' : 'your profile, settings and purchase history';
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="h-5 w-5 text-purple-600" aria-hidden="true" /> Download your data
        </CardTitle>
        <CardDescription>A JSON file with {what}.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          {/* Plain link: the browser streams the download straight to disk. */}
          <a href="/api/me/export" download>
            Download my data
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function DeleteAccountCard({ role }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const isAdmin = role === ROLES.ADMIN;

  const consequences = isAdmin
    ? 'Your login and store profile are deleted and all your products are removed from TrackIt. Sales already recorded stay in customers’ purchase history, shown as from a closed store.'
    : 'Your login, name, email and settings are deleted. Stores keep their sales records, but they are no longer linked to you.';

  const remove = async (e) => {
    e.preventDefault();
    setError('');
    setDeleting(true);
    try {
      await api.del('/api/me', { password, confirmation });
      await signOut({ callbackUrl: '/login?deleted=1' });
    } catch (err) {
      setError(err.details?.password || err.details?.confirmation || err.message || 'Could not delete the account.');
      setDeleting(false);
    }
  };

  return (
    <Card className="bg-white border-red-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
          <Trash2 className="h-5 w-5" aria-hidden="true" /> Delete account
        </CardTitle>
        <CardDescription>{consequences} This cannot be undone. Download your data first if you want a copy.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={(o) => !deleting && setOpen(o)}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete my account</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={remove} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>{consequences}</DialogDescription>
              </DialogHeader>
              <AuthField
                id="deletePassword"
                label="Your password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <AuthField
                id="deleteConfirmation"
                label={`Type ${DELETE_WORD} to confirm`}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
              />
              {error && <AuthMessage type="error">{error}</AuthMessage>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={deleting || confirmation !== DELETE_WORD || !password} aria-busy={deleting}>
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
