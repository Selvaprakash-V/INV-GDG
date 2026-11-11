'use client';

import { useCallback, useMemo, useState } from 'react';
import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { useApiAll } from '@/lib/api-client';
import { CALENDAR_FETCH_LIMIT, CALENDAR_MAX_PAGES } from '../constants';

/**
 * Visible calendar month plus the products expiring and purchases made in it.
 * Follows pagination so busy months show every row (was capped at the first 100),
 * up to CALENDAR_FETCH_LIMIT x CALENDAR_MAX_PAGES rows per list.
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

  const products = useApiAll('/api/products', productParams, { itemsKey: 'products', maxPages: CALENDAR_MAX_PAGES });
  const purchases = useApiAll('/api/purchases', purchaseParams, { itemsKey: 'purchases', maxPages: CALENDAR_MAX_PAGES });

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
    products: products.items,
    purchases: purchases.items,
    /** true only when a month exceeds the safety cap */
    truncated: products.truncated || purchases.truncated,
    loading: products.loading || purchases.loading,
    error: products.error || purchases.error,
    refetch,
  };
}
