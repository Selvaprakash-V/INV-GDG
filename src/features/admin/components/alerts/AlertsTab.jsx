'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXPIRY } from '@/shared/constants';
import { ROUTES } from '../../constants';
import { useDeleteProduct } from '../../hooks/useDeleteProduct';
import DeleteProductDialog from '../DeleteProductDialog';
import NotificationSettingsDialog from '../NotificationSettingsDialog';
import ExpiryListCard from './ExpiryListCard';

/**
 * @param {{data, error, loading, refetch}} summary result of useInventorySummary()
 */
export default function AlertsTab({ summary }) {
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  const { refetch } = summary;
  const afterDelete = useCallback(() => {
    refetch();
    setRefreshToken((t) => t + 1);
  }, [refetch]);
  const del = useDeleteProduct(afterDelete);
  const inv = summary.data;
  const threshold = inv?.thresholdDays ?? EXPIRY.DEFAULT_THRESHOLD_DAYS;
  const state = { loading: summary.loading, error: summary.error, onRetry: summary.refetch };
  const onEdit = (item) => router.push(ROUTES.editProduct(item.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Expiry Alerts</h2>
          <p className="text-gray-600">Monitor products that are about to expire</p>
        </div>
        <NotificationSettingsDialog
          onSaved={summary.refetch}
          trigger={
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Notification Settings
            </Button>
          }
        />
      </div>

      <ExpiryListCard
        variant="expiring"
        title="Expiry Timeline"
        description={`Products expiring within ${threshold} days`}
        items={inv?.expiringSoonItems}
        total={inv?.stats?.expiringSoon ?? 0}
        thresholdDays={threshold}
        emptyTitle="No products expiring soon"
        emptyDescription="All your products are fresh! You'll be notified here when products are about to expire."
        state={state}
        onEdit={onEdit}
      />

      <ExpiryListCard
        variant="expired"
        title="Expired Products"
        description="Products that have already expired and need attention"
        items={inv?.expiredItems}
        total={inv?.stats?.expired ?? 0}
        refreshToken={refreshToken}
        emptyTitle="No expired products"
        emptyDescription="You don't have any expired products in your inventory."
        state={state}
        onEdit={onEdit}
        onDelete={del.requestDelete}
      />

      <DeleteProductDialog {...del} />
    </div>
  );
}
