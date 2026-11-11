'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { STOCK_LEVELS } from '@/shared/constants';
import { ROUTES } from '../../constants';
import { DataBlock, EmptyState } from '../DataState';
import ToneBadge from '../ToneBadge';

export default function LowStockCard({ items, loading, error, onRetry }) {
  const router = useRouter();
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
        <CardTitle className="flex items-center text-red-800">
          <AlertCircle className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />
          Low Stock Alert
        </CardTitle>
        <CardDescription>Products with fewer than {STOCK_LEVELS.LOW_STOCK_ALERT} units left</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataBlock
          data={items}
          loading={loading}
          error={error}
          onRetry={onRetry}
          isEmpty={!items?.length}
          empty={<EmptyState icon={Package} title="No low stock products" description="All your products have sufficient stock levels." />}
        >
          <ul className="divide-y divide-gray-100">
            {items?.map((item) => (
              <li key={item.id} className="p-4 hover:bg-red-50/30 transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.category} • Stock: {item.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <ToneBadge tone="danger" className="mb-1">Low Stock</ToneBadge>
                    <Progress
                      value={(item.stock / STOCK_LEVELS.LOW_STOCK_ALERT) * 100}
                      className="h-2 w-24 mt-1"
                      aria-label={`${item.stock} of ${STOCK_LEVELS.LOW_STOCK_ALERT} units`}
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => router.push(ROUTES.editProduct(item.id))}
                  >
                    Restock
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </DataBlock>
      </CardContent>
    </Card>
  );
}
