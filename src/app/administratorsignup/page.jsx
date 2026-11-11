import SignupForm from '@/features/auth/SignupForm';
import { ROLES } from '@/shared/constants';

export const metadata = { title: 'Administrator sign up | TrackIt' };

export default function AdminSignupPage() {
  return <SignupForm role={ROLES.ADMIN} />;
}
