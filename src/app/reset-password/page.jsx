import { Suspense } from 'react';
import ResetPasswordForm from '@/features/auth/ResetPasswordForm';

export const metadata = { title: 'Reset password | TrackIt', referrer: 'no-referrer' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
