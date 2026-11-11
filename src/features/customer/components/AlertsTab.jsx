'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EXPIRY } from '@/shared/constants';
import { formatMoney } from '@/shared/format';
import { AsyncSection, EmptyState, TabFrame } from './SectionState';
import ExpiryItemRow from './ExpiryItemRow';
import { TABS } from '../tabs';

export default function AlertsTab({ expiring }) {
  const valueAtRisk = expiring.items.reduce((sum, i) => sum + (typeof i.value === 'number' ? i.value : 0), 0);
  return (
    <TabFrame
      tabKey={TABS.ALERTS}
      title="Expiry Alerts"
      subtitle={`Products from your purchases expiring in the next ${EXPIRY.ANALYTICS_WINDOW_DAYS} days`}
    >
      <Card className="bg-white border-0 shadow-lg">
        <CardContent className="p-0">
          <AsyncSection
            loading={expiring.loading}
            error={expiring.error}
            onRetry={expiring.refetch}
            errorMessage="Could not load expiry alerts."
          >
            {expiring.items.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No expiring products"
                description="You currently have no products that are about to expire"
              />
            ) : (
              <ul className="divide-y divide-gray-100">
                {valueAtRisk > 0 && (
                  <li className="p-5 bg-amber-50 text-amber-900 font-medium">
                    {formatMoney(valueAtRisk)} of your groceries expire in the next {EXPIRY.ANALYTICS_WINDOW_DAYS} days. Use them first.
                  </li>
                )}
                {expiring.items.map((item, index) => (
                  <ExpiryItemRow key={`${item.purchaseId}-${item.productName}-${index}`} item={item} detailed />
                ))}
              </ul>
            )}
          </AsyncSection>
        </CardContent>
      </Card>
    </TabFrame>
  );
}
