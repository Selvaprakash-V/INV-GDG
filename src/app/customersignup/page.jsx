import SignupForm from '@/features/auth/SignupForm';
import { ROLES } from '@/shared/constants';

export const metadata = { title: 'Customer sign up | TrackIt' };

export default function CustomerSignupPage() {
  return <SignupForm role={ROLES.CUSTOMER} />;
}
