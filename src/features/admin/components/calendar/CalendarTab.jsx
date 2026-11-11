'use client';

import dynamic from 'next/dynamic';
import { AlertCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EXPIRY } from '@/shared/constants';
import { formatDate, pluralize } from '../../format';
import { useExpiryGroups } from '../../hooks/useAnalytics';
import { DataBlock, EmptyState, LoadingState } from '../DataState';
import ToneBadge from '../ToneBadge';

const EnhancedCalendar = dynamic(() => import('@/components/admin/EnhancedCalendar'), {
  ssr: false,
  loading: () => <LoadingState label="Loading calendar…" />,
});

const HEAD_CLASS = 'text-orange-800';

function UpcomingExpiryCard() {
  const { data, error, loading, refetch } = useExpiryGroups();
  const groups = data?.expiryGroups;
  const items = groups ? [...groups.thisWeek, ...groups.nextWeek, ...groups.thisMonth] : null;

  return (
    <Card className="border border-gray-200 gap-0 py-0 overflow-hidden">
      <CardHeader className="bg-orange-50 border-b border-orange-100 py-4">
        <CardTitle className="flex items-center text-orange-800">
          <AlertCircle className="mr-2 h-5 w-5 text-orange-600" aria-hidden="true" />
          Upcoming Expiry Summary
        </CardTitle>
        <CardDescription>Products expiring in the next {EXPIRY.ANALYTICS_WINDOW_DAYS} days</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataBlock
          data={items}
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!items?.length}
          empty={
            <EmptyState
              icon={Package}
              title="No products expiring soon"
              description="All your products are fresh! You'll be notified here when products are about to expire."
            />
          }
        >
          <Table>
            <TableHeader className="bg-orange-50">
              <TableRow>
                <TableHead className={HEAD_CLASS}>Product</TableHead>
                <TableHead className={HEAD_CLASS}>Category</TableHead>
                <TableHead className={HEAD_CLASS}>Expiry Date</TableHead>
                <TableHead className={HEAD_CLASS}>Days Left</TableHead>
                <TableHead className={HEAD_CLASS}>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{formatDate(item.expiryDate)}</TableCell>
                  <TableCell>
                    <ToneBadge tone={item.daysUntilExpiry <= EXPIRY.SOON_DAYS ? 'danger' : 'warning'}>
                      {pluralize(item.daysUntilExpiry, 'day')}
                    </ToneBadge>
                  </TableCell>
                  <TableCell>{item.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataBlock>
      </CardContent>
    </Card>
  );
}

export default function CalendarTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inventory Calendar</h2>
        <p className="text-gray-600">View recorded sales and expiry dates at a glance</p>
      </div>
      <EnhancedCalendar />
      <UpcomingExpiryCard />
    </div>
  );
}
