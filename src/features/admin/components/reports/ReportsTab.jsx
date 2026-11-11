'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEFAULT_SALES_PERIOD, ROUTES, SALES_PERIODS } from '../../constants';
import { formatCurrency, formatNumber } from '../../format';
import { useSalesTrend } from '../../hooks/useAnalytics';
import { DataBlock, EmptyState } from '../DataState';
import StatCard from '../StatCard';
import { SalesTrendChart } from '../charts';

const HEAD_CLASS = 'text-blue-800';

function TopProductsCard({ products, state, periodLabel }) {
  return (
    <Card className="border border-gray-200 gap-0 py-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
        <CardTitle className="flex items-center text-blue-800">
          <Trophy className="mr-2 h-5 w-5 text-blue-600" aria-hidden="true" />
          Best Sellers
        </CardTitle>
        <CardDescription>Top products by units sold ({periodLabel.toLowerCase()} view)</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataBlock
          {...state}
          data={products}
          isEmpty={!products?.length}
          empty={
            <EmptyState
              tone="neutral"
              icon={ShoppingCart}
              title="No sales in this period"
              description="Recorded sales will appear here."
              action={
                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Link href={ROUTES.RECORD_SALE}>Record a sale</Link>
                </Button>
              }
            />
          }
        >
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className={HEAD_CLASS}>Product</TableHead>
                <TableHead className={`text-right ${HEAD_CLASS}`}>Units sold</TableHead>
                <TableHead className={`text-right ${HEAD_CLASS}`}>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell className="font-medium">{p.productName}</TableCell>
                  <TableCell className="text-right">{formatNumber(p.totalQuantity)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.totalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataBlock>
      </CardContent>
    </Card>
  );
}

export default function ReportsTab() {
  const [period, setPeriod] = useState(DEFAULT_SALES_PERIOD);
  const sales = useSalesTrend(period);
  const data = sales.data;
  const state = { loading: sales.loading, error: sales.error, onRetry: sales.refetch };
  const periodLabel = SALES_PERIODS.find((p) => p.value === period)?.label ?? period;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sales Reports</h2>
        <p className="text-gray-600">Revenue, orders and best sellers from recorded sales</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={`Revenue (${periodLabel.toLowerCase()} window)`}
          value={formatCurrency(data?.totalRevenue)}
          icon={<DollarSign className="h-5 w-5 text-purple-600" aria-hidden="true" />}
          textColor="text-purple-600"
          loading={!data && !sales.error}
        />
        <StatCard
          title={`Orders (${periodLabel.toLowerCase()} window)`}
          value={formatNumber(data?.totalOrders)}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" aria-hidden="true" />}
          textColor="text-blue-600"
          loading={!data && !sales.error}
        />
      </div>

      <SalesTrendChart data={data?.salesTrend} {...state} period={period} onPeriodChange={setPeriod} />
      <TopProductsCard products={data?.topProducts} state={state} periodLabel={periodLabel} />
    </div>
  );
}
