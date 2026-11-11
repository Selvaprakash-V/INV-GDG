'use client';

import { useApi } from '@/lib/api-client';
import { ANALYTICS_TYPES } from '@/shared/constants';

const ANALYTICS_PATH = '/api/analytics';

/** Server-computed inventory stats, chart series and alert lists (type=inventory). */
export function useInventorySummary() {
  return useApi(ANALYTICS_PATH, { type: ANALYTICS_TYPES.INVENTORY });
}

/** Revenue / order trend for the chosen period (type=sales). */
export function useSalesTrend(period) {
  return useApi(ANALYTICS_PATH, { type: ANALYTICS_TYPES.SALES, period });
}

/** Products expiring within the analytics window, grouped by week (type=expiry). */
export function useExpiryGroups() {
  return useApi(ANALYTICS_PATH, { type: ANALYTICS_TYPES.EXPIRY });
}

/** Moving-average demand forecast and expiry-risk scoring (type=predictive). */
export function usePredictiveAnalysis() {
  return useApi(ANALYTICS_PATH, { type: ANALYTICS_TYPES.PREDICTIVE });
}
