import { Suspense } from 'react';
import VerifyEmailStatus from '@/features/auth/VerifyEmailStatus';

export const metadata = { title: 'Confirm email | TrackIt', referrer: 'no-referrer' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailStatus />
    </Suspense>
  );
}
