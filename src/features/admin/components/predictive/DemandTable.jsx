'use client';

import { TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '../DataState';
import ToneBadge from '../ToneBadge';
import { CONFIDENCE_TONES } from './predictive-utils';

/** predictedDemand rows: products with recent sales, highest daily demand first. */
export default function DemandTable({ rows, limit }) {
  const visible = limit ? rows?.slice(0, limit) : rows;
  if (!visible?.length) {
    return (
      <EmptyState
        tone="neutral"
        icon={TrendingUp}
        title="No demand data yet"
        description="Products appear here once they have sales in the lookback window."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Sold</TableHead>
            <TableHead className="text-right">Per day</TableHead>
            <TableHead className="text-right">Per week</TableHead>
            <TableHead className="text-right">Per month</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Cover</TableHead>
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => (
            <TableRow key={r.productId}>
              <TableCell>
                <p className="font-medium">{r.productName}</p>
                <p className="text-xs text-gray-500">{r.category}</p>
              </TableCell>
              <TableCell className="text-right">{r.unitsSold}</TableCell>
              <TableCell className="text-right">{r.predictedDailyDemand}</TableCell>
              <TableCell className="text-right">{r.predictedWeeklyDemand}</TableCell>
              <TableCell className="text-right">{r.predictedMonthlyDemand}</TableCell>
              <TableCell className="text-right">{r.stock}</TableCell>
              <TableCell className="text-right">{r.coverDays === null ? '—' : `${r.coverDays} d`}</TableCell>
              <TableCell>
                <ToneBadge tone={CONFIDENCE_TONES[r.confidence]} className="capitalize">
                  {r.confidence}
                </ToneBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
