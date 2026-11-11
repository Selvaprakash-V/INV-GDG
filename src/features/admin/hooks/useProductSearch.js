'use client';

import { useMemo } from 'react';
import { useApi, useDebounced } from '@/lib/api-client';
import { PRODUCT_PICKER_LIMIT, SEARCH_DEBOUNCE_MS } from '../constants';

/** Debounced product lookup for the sale product picker; idle until the user types. */
export function useProductSearch(query) {
  const term = useDebounced(query.trim(), SEARCH_DEBOUNCE_MS);
  const params = useMemo(() => ({ search: term, limit: PRODUCT_PICKER_LIMIT, sort: 'name' }), [term]);
  const { data, error, loading, refetch } = useApi(term ? '/api/products' : null, params);
  return {
    term,
    results: term ? data?.products ?? null : null,
    error: term ? error : null,
    loading: Boolean(term) && loading,
    pending: query.trim() !== term,
    refetch,
  };
}
