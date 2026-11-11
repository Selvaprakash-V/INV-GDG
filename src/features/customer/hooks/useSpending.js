'use client';

import { useApi } from '@/lib/api-client';
import { ANALYTICS_TYPES } from '@/shared/constants';

const SPENDING_PARAMS = { type: ANALYTICS_TYPES.SPENDING };

/**
 * Customer spending analytics:
 * { monthly, weekly, byStore, currentMonth, currentWeek, totalSpent, totalVisits }
 */
export function useSpending() {
  return useApi('/api/analytics', SPENDING_PARAMS);
}
