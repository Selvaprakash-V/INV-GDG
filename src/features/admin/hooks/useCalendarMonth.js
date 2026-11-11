'use client';

import { useCallback, useMemo, useState } from 'react';
import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { useApi } from '@/lib/api-client';
import { CALENDAR_FETCH_LIMIT } from '../constants';

/**
 * Visible calendar month plus the products expiring and purchases made in it.
 * Both requests are keyed on the month range, so navigating refetches.
 */
export function useCalendarMonth(initialDate = new Date()) {
  const [month, setMonth] = useState(() => startOfMonth(initialDate));

  const range = useMemo(
    () => ({ from: startOfMonth(month).toISOString(), to: endOfMonth(month).toISOString() }),
    [month]
  );

  const productParams = useMemo(
    () => ({ expiresFrom: range.from, expiresTo: range.to, sort: 'expiry', limit: CALENDAR_FETCH_LIMIT }),
    [range]
  );
  const purchaseParams = useMemo(
    () => ({ from: range.from, to: range.to, limit: CALENDAR_FETCH_LIMIT }),
    [range]
  );

  const products = useApi('/api/products', productParams);
  const purchases = useApi('/api/purchases', purchaseParams);

  const goToPreviousMonth = useCallback(() => setMonth((m) => subMonths(m, 1)), []);
  const goToNextMonth = useCallback(() => setMonth((m) => addMonths(m, 1)), []);
  const { refetch: refetchProducts } = products;
  const { refetch: refetchPurchases } = purchases;
  const refetch = useCallback(() => {
    refetchProducts();
    refetchPurchases();
  }, [refetchProducts, refetchPurchases]);

  return {
    month,
    goToPreviousMonth,
    goToNextMonth,
    products: products.data?.products ?? null,
    purchases: purchases.data?.purchases ?? null,
    /** true when the month has more rows than one request returns */
    truncated: Boolean(products.data?.pagination?.hasNext || purchases.data?.pagination?.hasNext),
    loading: products.loading || purchases.loading,
    error: products.error || purchases.error,
    refetch,
  };
}
