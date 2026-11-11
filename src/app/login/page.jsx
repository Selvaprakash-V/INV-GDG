import { Suspense } from 'react';
import LoginForm from '@/features/auth/LoginForm';

export const metadata = { title: 'Log in | TrackIt' };

// LoginForm reads ?callbackUrl / ?registered via useSearchParams, which needs a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
