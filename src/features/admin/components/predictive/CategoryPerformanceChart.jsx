'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { CHART_COLORS } from '../../constants';
import { EmptyState } from '../DataState';

/** Units sold per category over the lookback window. */
export default function CategoryPerformanceChart({ data }) {
  const rows = data?.filter((c) => c.unitsSold > 0);
  if (!rows?.length) {
    return (
      <EmptyState tone="neutral" icon={BarChart2} title="No category sales yet" description="Category totals appear after the first sales." className="h-72" />
    );
  }
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} fontSize={12} />
          <YAxis dataKey="name" type="category" width={100} fontSize={12} />
          <Tooltip formatter={(value) => [`${value} units`, 'Sold']} />
          <Bar dataKey="unitsSold" name="Units sold" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
