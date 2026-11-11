'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api, useApi } from '@/lib/api-client';
import ProductForm from '@/features/products/ProductForm';
import ProductPageShell, { FormMessage, INVENTORY_URL } from '@/features/products/ProductPageShell';
import DeleteProductDialog from '@/features/products/DeleteProductDialog';
import { useProductForm } from '@/features/products/useProductForm';
import { toFormValues } from '@/features/products/productFormModel';

const NOT_FOUND_STATUS = 404;

function EditProductForm({ id, product }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const form = useProductForm({
    initialValues: toFormValues(product),
    onSubmit: async (payload) => {
      await api.put(`/api/products/${id}`, payload);
      router.push(INVENTORY_URL);
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.del(`/api/products/${id}`);
      router.push(INVENTORY_URL);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete the product. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <ProductPageShell
      title="Edit Product"
      description="Update product information"
      actions={
        <DeleteProductDialog
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          error={deleteError}
          disabled={form.isSubmitting}
        />
      }
    >
      <ProductForm
        form={form}
        submitLabel="Update Product"
        submittingLabel="Updating Product..."
        successMessage="Product updated. Redirecting..."
      />
    </ProductPageShell>
  );
}

export default function ClientEditProductPage() {
  const { id } = useParams();
  const { data, error, loading, refetch } = useApi(id ? `/api/products/${id}` : null);

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading product"
        className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error || !data?.product) {
    const notFound = error?.status === NOT_FOUND_STATUS;
    return (
      <ProductPageShell title="Edit Product" description="Update product information">
        <div className="space-y-4">
          <FormMessage type="error">
            {notFound ? 'This product was not found. It may have been deleted.' : error?.message || 'Could not load the product.'}
          </FormMessage>
          {!notFound && (
            <Button variant="outline" onClick={refetch}>
              Try again
            </Button>
          )}
        </div>
      </ProductPageShell>
    );
  }

  return <EditProductForm key={data.product.id} id={id} product={data.product} />;
}