'use client';

import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../format';
import { EmptyState } from '../DataState';
import { buildForecastSeries } from './predictive-utils';

/** Last 30 days of revenue plus the 7-day projection from the API. */
export default function SalesForecastChart({ salesTrend, forecast, height = 'h-72' }) {
  const series = useMemo(() => buildForecastSeries(salesTrend, forecast), [salesTrend, forecast]);
  const hasSales = salesTrend?.some((p) => p.totalSales > 0);

  if (!hasSales) {
    return (
      <EmptyState
        tone="neutral"
        title="Not enough sales yet"
        description="Record sales to build a trend; the projection appears once there is history."
        className={height}
      />
    );
  }

  return (
    <div className={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" fontSize={12} interval="preserveStartEnd" />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={CHART_COLORS.primary}
            name="Actual sales"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={CHART_COLORS.secondary}
            name="Projected sales"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
