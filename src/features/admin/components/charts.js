'use client';

import dynamic from 'next/dynamic';
import { createElement } from 'react';
import { LoadingState } from './DataState';

// recharts measures the DOM, so charts are client-only (no SSR).
const loading = () => createElement(LoadingState, { label: 'Loading chart…' });
const load = (name) =>
  dynamic(() => import('@/components/admin/DashboardCharts').then((mod) => mod[name]), { ssr: false, loading });

export const SalesTrendChart = load('SalesTrendChart');
export const StockLevelDistributionChart = load('StockLevelDistributionChart');
export const CategoryStockChart = load('CategoryStockChart');
export const TopProductsChart = load('TopProductsChart');
