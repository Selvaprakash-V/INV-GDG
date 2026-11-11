'use client';

import { useState } from 'react';
import { AlertCircle, DollarSign, Package } from 'lucide-react';
import { DEFAULT_SALES_PERIOD } from '../../constants';
import { formatCurrency, formatNumber } from '../../format';
import { useSalesTrend } from '../../hooks/useAnalytics';
import { ErrorState } from '../DataState';
import StatCard from '../StatCard';
import { CategoryStockChart, SalesTrendChart, StockLevelDistributionChart, TopProductsChart } from '../charts';
import LowStockCard from './LowStockCard';
import QuickActionsCard from './QuickActionsCard';

const STAT_CARDS = [
  { key: 'totalItems', title: 'Total Products', Icon: Package, color: 'text-purple-600' },
  { key: 'availableItems', title: 'Available Products', Icon: Package, color: 'text-green-600' },
  { key: 'outOfStock', title: 'Out of Stock', Icon: AlertCircle, color: 'text-red-600' },
  { key: 'expiringSoon', title: 'Expiring Soon', Icon: AlertCircle, color: 'text-yellow-600' },
];

/**
 * @param {{data, error, loading, refetch}} summary result of useInventorySummary()
 */
export default function OverviewTab({ summary, onTabChange }) {
  const [period, setPeriod] = useState(DEFAULT_SALES_PERIOD);
  const sales = useSalesTrend(period);
  const inv = summary.data;
  const stats = inv?.stats;
  const chartState = { loading: summary.loading, error: summary.error, onRetry: summary.refetch };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-gray-600">Welcome to your inventory management dashboard</p>
        </div>
        {stats && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-purple-600" aria-hidden="true" />
            Inventory value <strong>{formatCurrency(stats.inventoryValue)}</strong> · {formatNumber(stats.totalUnits)} units
          </p>
        )}
      </div>

      {summary.error && !inv ? (
        <ErrorState error={summary.error} title="Could not load inventory summary" onRetry={summary.refetch} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ key, title, Icon, color }) => (
            <StatCard
              key={key}
              title={title}
              value={formatNumber(stats?.[key])}
              icon={<Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />}
              textColor={color}
              loading={!stats}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart
          data={sales.data?.salesTrend}
          loading={sales.loading}
          error={sales.error}
          onRetry={sales.refetch}
          period={period}
          onPeriodChange={setPeriod}
        />
        <StockLevelDistributionChart data={inv?.stockLevels} {...chartState} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryStockChart data={inv?.byCategory} {...chartState} />
        <TopProductsChart data={inv?.topByStock} {...chartState} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockCard items={inv?.lowStock} {...chartState} />
        <QuickActionsCard onTabChange={onTabChange} />
      </div>
    </div>
  );
}
