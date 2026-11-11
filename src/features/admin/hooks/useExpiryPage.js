'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '@/lib/api-client';
import { INVENTORY_PAGE_SIZE } from '../constants';

const MINUTE_MS = 60_000;

/** Server query for the complete expiring / expired list (the summary only has the most urgent few). */
export function expiryQuery(variant, thresholdDays, now = Date.now()) {
  // Rounded to the minute so repeated requests share the server-side cache key.
  const at = new Date(Math.floor(now / MINUTE_MS) * MINUTE_MS).toISOString();
  return variant === 'expired'
    ? { expiresTo: at, sort: 'expiry' }
    : { expiresFrom: at, expiringWithinDays: thresholdDays, sort: 'expiry' };
}

/**
 * Paginated full list behind an alert card. Disabled (no request) until `enabled`.
 * `refreshToken` changes (e.g. after a delete) trigger a refetch.
 */
export function useExpiryPage({ variant, thresholdDays, enabled, refreshToken }) {
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({ ...expiryQuery(variant, thresholdDays), page, limit: INVENTORY_PAGE_SIZE }),
    [variant, thresholdDays, page]
  );
  const { data, error, loading, refetch } = useApi(enabled ? '/api/products' : null, params);

  useEffect(() => {
    if (enabled && refreshToken) refetch();
  }, [enabled, refreshToken, refetch]);

  const pagination = data?.pagination;
  const nextPage = useCallback(() => pagination?.hasNext && setPage((p) => p + 1), [pagination?.hasNext]);
  const prevPage = useCallback(() => pagination?.hasPrev && setPage((p) => Math.max(1, p - 1)), [pagination?.hasPrev]);

  return { items: data?.products ?? null, pagination, error, loading, refetch, nextPage, prevPage };
}
