'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi, useDebounced } from '@/lib/api-client';
import { ALL_CATEGORIES, INVENTORY_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../constants';

const FIRST_PAGE = 1;

/**
 * Paginated, server-filtered product list for the inventory tab.
 * Changing search / category / sort resets to the first page.
 */
export function useProductsPage() {
  const [search, setSearchRaw] = useState('');
  const [category, setCategoryRaw] = useState(ALL_CATEGORIES);
  const [sort, setSortRaw] = useState('newest');
  const [page, setPage] = useState(FIRST_PAGE);
  const debouncedSearch = useDebounced(search.trim(), SEARCH_DEBOUNCE_MS);

  const params = useMemo(
    () => ({
      page,
      limit: INVENTORY_PAGE_SIZE,
      search: debouncedSearch || undefined,
      category: category === ALL_CATEGORIES ? undefined : category,
      sort,
    }),
    [page, debouncedSearch, category, sort]
  );

  const { data, error, loading, refetch } = useApi('/api/products', params);

  const resetting = (setter) => (value) => {
    setter(value);
    setPage(FIRST_PAGE);
  };

  const pagination = data?.pagination;

  // e.g. deleting the last item on the last page: step back to a page that exists
  useEffect(() => {
    if (pagination && page > FIRST_PAGE && page > pagination.totalPages) {
      setPage(Math.max(FIRST_PAGE, pagination.totalPages));
    }
  }, [pagination, page]);
  const nextPage = useCallback(() => {
    if (pagination?.hasNext) setPage((p) => p + 1);
  }, [pagination?.hasNext]);
  const prevPage = useCallback(() => {
    if (pagination?.hasPrev) setPage((p) => Math.max(FIRST_PAGE, p - 1));
  }, [pagination?.hasPrev]);

  return {
    products: data?.products ?? null,
    pagination,
    error,
    loading,
    refetch,
    filters: { search, category, sort },
    isFiltered: Boolean(debouncedSearch) || category !== ALL_CATEGORIES,
    setSearch: resetting(setSearchRaw),
    setCategory: resetting(setCategoryRaw),
    setSort: resetting(setSortRaw),
    nextPage,
    prevPage,
  };
}
