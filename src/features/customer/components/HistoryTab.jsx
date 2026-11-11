'use client';

import { Loader2, PackageOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AsyncSection, EmptyState, TabFrame } from './SectionState';
import PurchaseCard from './PurchaseCard';
import { TABS } from '../tabs';

/**
 * All purchases, newest first, with "Load more" (keyset pagination).
 * When `storeFilter` ({ id, name }) is set, the parent passes a list that the
 * server already filtered to that store (GET /api/purchases?storeId=).
 */
export default function HistoryTab({ purchases, storeFilter, onClearStoreFilter }) {
  const visible = purchases.purchases;

  return (
    <TabFrame tabKey={TABS.HISTORY} title="Purchase History" subtitle="All your recent transactions">
      {storeFilter && (
        <div className="mb-6 flex flex-wrap items-center gap-3 text-base text-gray-700">
          <span>
            Showing purchases from <strong>{storeFilter.name}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={onClearStoreFilter}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filter
          </Button>
        </div>
      )}

      <AsyncSection
        loading={purchases.loading}
        error={purchases.error}
        onRetry={purchases.refetch}
        errorMessage="Could not load your purchases."
      >
        {visible.length === 0 && !purchases.hasNext ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent>
              <EmptyState
                icon={PackageOpen}
                title="No purchases found"
                description={storeFilter ? 'No purchases from this store yet.' : 'Purchases recorded by a store will appear here.'}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {visible.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} showExpiry className="bg-white" />
            ))}
          </div>
        )}

        {purchases.loadMoreError && (
          <p role="alert" className="mt-6 text-center text-red-600">
            Could not load more purchases: {purchases.loadMoreError.message}
          </p>
        )}

        {purchases.hasNext && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              className="text-lg h-12 px-6"
              onClick={purchases.loadMore}
              disabled={purchases.loadingMore}
            >
              {purchases.loadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {purchases.loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </AsyncSection>
    </TabFrame>
  );
}
