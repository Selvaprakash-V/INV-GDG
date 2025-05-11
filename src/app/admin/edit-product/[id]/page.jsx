import ClientEditProductPage from './client-page';
import SessionWrapper from '@/components/SessionWrapper';
import AuthenticatedLayout from '@/app/AuthenticatedLayout';

export default function EditProductPage() {
  return (
    <SessionWrapper>
      <AuthenticatedLayout>
        <ClientEditProductPage />
      </AuthenticatedLayout>
    </SessionWrapper>
  );
}
