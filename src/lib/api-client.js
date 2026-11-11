'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Error thrown for non-2xx API responses; carries the server's code and field details. */
export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function toQuery(params) {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    qs.set(k, v instanceof Date ? v.toISOString() : String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * Thin fetch wrapper used by every client component.
 * Response shape from the API: { success, ...data } or { success:false, code, message, details }.
 */
export async function apiFetch(path, { method = 'GET', body, params, signal } = {}) {
  const res = await fetch(`${path}${toQuery(params)}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'same-origin',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, {
      status: res.status,
      code: data?.code,
      details: data?.details,
    });
  }
  return data;
}

export const api = {
  get: (path, params, opts) => apiFetch(path, { ...opts, params }),
  post: (path, body) => apiFetch(path, { method: 'POST', body }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body }),
  del: (path) => apiFetch(path, { method: 'DELETE' }),
};

/**
 * Data-fetching hook with abort-on-change and manual refetch.
 * @param {string|null} path  null disables the request
 * @param {object} [params]
 */
export function useApi(path, params) {
  const key = path ? `${path}${toQuery(params)}` : null;
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [nonce, setNonce] = useState(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    if (!key) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch(path, { params: paramsRef.current, signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, error, loading: false }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, refetch };
}

/** Debounce a fast-changing value (e.g. search input) before it hits the API. */
export function useDebounced(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
