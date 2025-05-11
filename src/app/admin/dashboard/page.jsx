import ClientAdminDashboard from './client-page';
import SessionWrapper from '@/components/SessionWrapper';
import AuthenticatedLayout from '@/app/AuthenticatedLayout';

export default function AdminDashboard() {
  return (
    <SessionWrapper>
      <AuthenticatedLayout>
        <ClientAdminDashboard />
      </AuthenticatedLayout>
    </SessionWrapper>
  );
}
