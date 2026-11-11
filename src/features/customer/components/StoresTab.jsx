'use client';

import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AsyncSection, EmptyState, TabFrame } from './SectionState';
import { formatCurrency, formatDate } from '../format';
import { TABS } from '../tabs';

const STAGGER_SECONDS = 0.1;

function StoreStat({ label, value }) {
  return (
    <div className="flex justify-between text-base">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/** Stores the customer has bought from (from spending analytics `byStore`). */
export default function StoresTab({ spending, onViewStorePurchases }) {
  const stores = spending.data?.byStore ?? [];
  return (
    <TabFrame tabKey={TABS.STORES} title="My Stores" subtitle="Your favorite shopping destinations">
      <AsyncSection
        loading={spending.loading}
        error={spending.error}
        onRetry={spending.refetch}
        errorMessage="Could not load your stores."
      >
        {stores.length === 0 ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent>
              <EmptyState icon={Store} title="No stores yet" description="Stores you shop at will appear here." />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store, index) => (
              <motion.div
                key={store.storeId ?? store.storeName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * STAGGER_SECONDS }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-white border-0 shadow-lg h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <Store className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-xl">{store.storeName ?? 'Unknown store'}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <StoreStat label="Total Visits" value={store.visitCount} />
                      <StoreStat label="Last Visit" value={formatDate(store.lastVisit, { day: 'numeric', month: 'short' })} />
                      <StoreStat label="Total Spent" value={formatCurrency(store.totalSpent)} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full text-lg h-12"
                      onClick={() => onViewStorePurchases({ id: store.storeId, name: store.storeName })}
                    >
                      View Purchases
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AsyncSection>
    </TabFrame>
  );
}
