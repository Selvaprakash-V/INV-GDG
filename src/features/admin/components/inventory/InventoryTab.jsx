'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '../../constants';
import { useDeleteProduct } from '../../hooks/useDeleteProduct';
import { useProductsPage } from '../../hooks/useProductsPage';
import { DataBlock, EmptyState } from '../DataState';
import DeleteProductDialog from '../DeleteProductDialog';
import PaginationControls from '../PaginationControls';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';

/**
 * @param {() => void} onInventoryChanged refresh dashboard-wide data (summary counts) after a delete
 */
export default function InventoryTab({ onInventoryChanged }) {
  const router = useRouter();
  const list = useProductsPage();
  const { refetch } = list;

  const handleDeleted = useCallback(() => {
    refetch();
    onInventoryChanged?.();
  }, [refetch, onInventoryChanged]);
  const del = useDeleteProduct(handleDeleted);

  const addButton = (
    <Button
      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
      onClick={() => router.push(ROUTES.ADD_PRODUCT)}
    >
      Add New Item
    </Button>
  );

  const empty = list.isFiltered ? (
    <EmptyState
      tone="neutral"
      title="No matching products"
      description="Try a different search term or category."
    />
  ) : (
    <EmptyState tone="neutral" title="No products found" description="Add your first product to get started" action={addButton} />
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <p className="text-gray-600">View and manage all your inventory items</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <InventoryFilters
          filters={list.filters}
          setSearch={list.setSearch}
          setCategory={list.setCategory}
          setSort={list.setSort}
        />
        {addButton}
      </div>

      <Card className="border border-gray-200 gap-0 py-0 overflow-hidden">
        <DataBlock
          data={list.products}
          loading={list.loading}
          error={list.error}
          onRetry={refetch}
          isEmpty={!list.products?.length}
          loadingLabel="Loading products…"
          errorTitle="Error Loading Products"
          empty={empty}
        >
          <div className={list.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={list.loading}>
            <InventoryTable
              products={list.products ?? []}
              onEdit={(p) => router.push(ROUTES.editProduct(p.id))}
              onDelete={del.requestDelete}
            />
          </div>
          <PaginationControls
            pagination={list.pagination}
            onPrev={list.prevPage}
            onNext={list.nextPage}
            disabled={list.loading}
          />
        </DataBlock>
        {list.error && list.products && (
          <p className="px-4 py-2 text-sm text-red-600 border-t border-red-100" role="alert">
            Could not refresh products: {list.error.message}
          </p>
        )}
      </Card>

      <DeleteProductDialog {...del} />
    </div>
  );
}
