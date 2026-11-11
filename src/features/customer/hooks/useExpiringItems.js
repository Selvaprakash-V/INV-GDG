'use client';

import { useMemo } from 'react';
import { useApi } from '@/lib/api-client';
import { ANALYTICS_TYPES } from '@/shared/constants';

const EXPIRY_PARAMS = { type: ANALYTICS_TYPES.EXPIRY };

/** Items from the customer's purchases that expire within the analytics window, soonest first. */
export function useExpiringItems() {
  const { data, error, loading, refetch } = useApi('/api/analytics', EXPIRY_PARAMS);
  const items = useMemo(
    () => [...(data?.expiringItems ?? [])].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    [data]
  );
  return { items, total: data?.totalExpiringItems ?? items.length, error, loading, refetch };
}
