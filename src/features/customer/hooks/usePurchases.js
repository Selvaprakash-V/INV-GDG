'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import { PAGINATION } from '@/shared/constants';

const PURCHASES_PATH = '/api/purchases';

const INITIAL_STATE = {
  purchases: [],
  hasNext: false,
  nextCursor: null,
  loading: true,
  loadingMore: false,
  error: null,
  loadMoreError: null,
};

/**
 * The signed-in customer's purchases with keyset ("Load more") pagination.
 * `storeId` narrows to one store server-side; `enabled: false` skips fetching.
 */
export function usePurchases({ limit = PAGINATION.DEFAULT_LIMIT, storeId, enabled = true } = {}) {
  const [state, setState] = useState(INITIAL_STATE);
  const [nonce, setNonce] = useState(0);
  const loadingMoreRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ ...INITIAL_STATE, loading: false });
      return undefined;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(PURCHASES_PATH, { limit, storeId }, { signal: controller.signal })
      .then((data) =>
        setState({
          ...INITIAL_STATE,
          loading: false,
          purchases: data.purchases ?? [],
          hasNext: Boolean(data.pagination?.hasNext),
          nextCursor: data.pagination?.nextCursor ?? null,
        })
      )
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error }));
      });
    return () => controller.abort();
  }, [limit, storeId, enabled, nonce]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !state.hasNext || !state.nextCursor) return;
    loadingMoreRef.current = true;
    setState((s) => ({ ...s, loadingMore: true, loadMoreError: null }));
    try {
      const data = await api.get(PURCHASES_PATH, { limit, storeId, cursor: state.nextCursor });
      if (!mountedRef.current) return;
      setState((s) => ({
        ...s,
        loadingMore: false,
        purchases: [...s.purchases, ...(data.purchases ?? [])],
        hasNext: Boolean(data.pagination?.hasNext),
        nextCursor: data.pagination?.nextCursor ?? null,
      }));
    } catch (error) {
      if (mountedRef.current) setState((s) => ({ ...s, loadingMore: false, loadMoreError: error }));
    } finally {
      loadingMoreRef.current = false;
    }
  }, [limit, storeId, state.hasNext, state.nextCursor]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { ...state, loadMore, refetch };
}
