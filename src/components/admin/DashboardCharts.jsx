'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart2, PieChart as PieChartIcon, Package, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';
import { DataBlock, EmptyState } from '@/features/admin/components/DataState';
import { CHART_COLORS, SALES_PERIODS, STOCK_LEVEL_COLORS } from '@/features/admin/constants';
import { formatCurrency, formatNumber } from '@/features/admin/format';

const TOOLTIP_STYLE = { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const AXIS_PROPS = { stroke: '#888', fontSize: 12 };

/** Card shell shared by every dashboard chart: header + loading/error/empty handling. */
function ChartCard({ title, description, Icon, headerClass, titleClass, iconClass, action, state, emptyText, children, srSummary }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className={`border-b ${headerClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className={`flex items-center ${titleClass}`}>
              <Icon className={`mr-2 h-5 w-5 ${iconClass}`} aria-hidden="true" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <DataBlock
          {...state}
          loadingLabel="Loading chart…"
          errorTitle="Could not load chart"
          empty={<EmptyState title="No data yet" description={emptyText} tone="neutral" icon={Icon} className="h-full" />}
        >
          {srSummary && <p className="sr-only">{srSummary}</p>}
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </DataBlock>
      </CardContent>
    </Card>
  );
}

const chartState = ({ data, loading, error, onRetry }, isEmpty) => ({
  data,
  loading,
  error,
  onRetry,
  isEmpty: !data || isEmpty(data),
});

/** Revenue per bucket from GET /api/analytics?type=sales. */
export function SalesTrendChart({ data, loading, error, onRetry, period, onPeriodChange }) {
  const trend = data ?? [];
  const periodSelect = onPeriodChange && (
    <Select value={period} onValueChange={onPeriodChange}>
      <SelectTrigger className="w-[120px] bg-white" aria-label="Sales trend period">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SALES_PERIODS.map((p) => (
          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <ChartCard
      title="Sales Trend"
      description="Revenue from recorded sales"
      Icon={TrendingUp}
      headerClass="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
      titleClass="text-blue-800"
      iconClass="text-blue-600"
      action={periodSelect}
      state={chartState({ data, loading, error, onRetry }, (d) => d.every((p) => !p.totalSales))}
      emptyText="Record a sale to see revenue over time."
    >
      <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, _name, item) => [
            `${formatCurrency(value)} (${formatNumber(item?.payload?.orders)} orders)`,
            'Revenue',
          ]}
        />
        <Area
          type="monotone"
          dataKey="totalSales"
          stroke={CHART_COLORS.primary}
          fillOpacity={1}
          fill="url(#salesGradient)"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ChartCard>
  );
}

export function StockLevelDistributionChart({ data, loading, error, onRetry }) {
  const series = (data ?? []).map((d, i) => ({ ...d, color: STOCK_LEVEL_COLORS[i % STOCK_LEVEL_COLORS.length] }));
  // Only non-empty levels become slices (an empty slice still renders an unlabeled <text>);
  // the legend lists every level so the scale stays readable.
  const slices = series.filter((d) => d.value > 0);
  const legend = series.map((d) => ({ id: d.name, value: d.name, type: 'circle', color: d.color }));
  return (
    <ChartCard
      title="Stock Level Distribution"
      description="Products by stock level categories"
      Icon={PieChartIcon}
      headerClass="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
      titleClass="text-purple-800"
      iconClass="text-purple-600"
      state={chartState({ data, loading, error, onRetry }, (d) => d.every((s) => !s.value))}
      emptyText="Add products to see how stock is distributed."
      srSummary={series.map((d) => `${d.name}: ${d.value} products`).join('; ')}
    >
      <PieChart>
        <Pie
          data={slices}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {slices.map((entry) => (
            // Each slice is an SVG image to assistive tech; give it a name (axe: svg-img-alt).
            <Cell key={entry.name} fill={entry.color} aria-label={`${entry.name}: ${entry.value} products`} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} products`, 'Count']} contentStyle={TOOLTIP_STYLE} />
        <Legend verticalAlign="bottom" height={36} payload={legend} />
      </PieChart>
    </ChartCard>
  );
}

export function CategoryStockChart({ data, loading, error, onRetry }) {
  return (
    <ChartCard
      title="Stock by Category"
      description="Total stock units per product category"
      Icon={BarChart2}
      headerClass="bg-gradient-to-r from-green-50 to-teal-50 border-green-100"
      titleClass="text-green-800"
      iconClass="text-green-600"
      state={chartState({ data, loading, error, onRetry }, (d) => d.length === 0)}
      emptyText="Add products to see stock per category."
    >
      <BarChart data={data ?? []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, _name, item) => [`${value} units (${item?.payload?.items} products)`, 'Stock']}
        />
        <Bar dataKey="stock" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]}>
          {(data ?? []).map((entry, index) => (
            <Cell key={entry.name} fill={`hsl(${index * 30 + 150}, 70%, 50%)`} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

export function TopProductsChart({ data, loading, error, onRetry }) {
  return (
    <ChartCard
      title="Top Products by Stock"
      description="Products with highest inventory levels"
      Icon={Package}
      headerClass="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100"
      titleClass="text-amber-800"
      iconClass="text-amber-600"
      state={chartState({ data, loading, error, onRetry }, (d) => d.length === 0)}
      emptyText="Add products to see your best-stocked items."
    >
      <BarChart data={data ?? []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" {...AXIS_PROPS} />
        <YAxis dataKey="name" type="category" {...AXIS_PROPS} width={100} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} units`, 'Stock']} />
        <Bar dataKey="stock" fill={CHART_COLORS.warning} radius={[0, 4, 4, 0]}>
          {(data ?? []).map((entry, index) => (
            <Cell key={entry.id ?? entry.name} fill={`hsl(${40 + index * 5}, 90%, ${60 - index * 5}%)`} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
