import ClientCustomerDashboard from './client-page';
import SessionWrapper from '@/components/SessionWrapper';
import AuthenticatedLayout from '@/app/AuthenticatedLayout';

export default function CustomerDashboard() {
  return (
    <SessionWrapper>
      <AuthenticatedLayout>
        <ClientCustomerDashboard />
      </AuthenticatedLayout>
    </SessionWrapper>
  );

}