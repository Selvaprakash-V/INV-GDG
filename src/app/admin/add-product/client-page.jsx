'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import ProductForm from '@/features/products/ProductForm';
import ProductPageShell, { INVENTORY_URL } from '@/features/products/ProductPageShell';
import { useProductForm } from '@/features/products/useProductForm';
import { EMPTY_PRODUCT_VALUES, earliestNewExpiry } from '@/features/products/productFormModel';

export default function ClientAddProductPage() {
  const router = useRouter();
  const [minExpiryDate] = useState(() => earliestNewExpiry());

  const form = useProductForm({
    initialValues: EMPTY_PRODUCT_VALUES,
    requireFutureExpiry: true,
    onSubmit: async (payload) => {
      await api.post('/api/products', payload);
      router.push(INVENTORY_URL);
    },
  });

  return (
    <ProductPageShell title="Add New Product" description="Add a new product to your inventory">
      <ProductForm
        form={form}
        minExpiryDate={minExpiryDate}
        submitLabel="Add Product"
        submittingLabel="Adding Product..."
        successMessage="Product added. Redirecting..."
      />
    </ProductPageShell>
  );
}
