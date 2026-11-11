'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DASHBOARD_TABS, DEFAULT_TAB, TAB_ALIASES } from '../constants';

const VALID_TABS = new Set(Object.values(DASHBOARD_TABS));

export function normalizeTab(value) {
  if (!value) return DEFAULT_TAB;
  const tab = TAB_ALIASES[value] ?? value;
  return VALID_TABS.has(tab) ? tab : DEFAULT_TAB;
}

/**
 * Active dashboard tab backed by the `?tab=` query param so links like
 * `/admin/dashboard?tab=inventory` deep-link. Must render inside <Suspense>.
 */
export function useDashboardTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = normalizeTab(searchParams.get('tab'));

  const setTab = useCallback(
    (tab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_TAB) params.delete('tab');
      else params.set('tab', tab);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return [activeTab, setTab];
}
