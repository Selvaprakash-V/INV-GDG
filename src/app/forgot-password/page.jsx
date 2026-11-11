import { Suspense } from 'react';
import ForgotPasswordForm from '@/features/auth/ForgotPasswordForm';

export const metadata = { title: 'Forgot password | TrackIt', referrer: 'no-referrer' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
