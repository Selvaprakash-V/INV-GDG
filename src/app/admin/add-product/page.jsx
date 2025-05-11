import ClientAddProductPage from './client-page';
import SessionWrapper from '@/components/SessionWrapper';
import AuthenticatedLayout from '@/app/AuthenticatedLayout';

export default function AddProductPage() {
  return (
    <SessionWrapper>
      <AuthenticatedLayout>
        <ClientAddProductPage />
      </AuthenticatedLayout>
    </SessionWrapper>
  );
}
