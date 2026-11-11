'use client';

import { useCallback, useState } from 'react';
import { api, useApi } from '@/lib/api-client';
import { DEFAULT_BUDGET } from '@/shared/constants';

const SETTINGS_PATH = '/api/me/settings';

/** Loads the user's persisted settings and saves budget changes via PATCH /api/me/settings. */
export function useCustomerSettings() {
  const { data, error, loading, refetch } = useApi(SETTINGS_PATH);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  const settings = saved ?? data?.settings ?? null;
  const budget = {
    monthly: settings?.budget?.monthly ?? DEFAULT_BUDGET.monthly,
    weekly: settings?.budget?.weekly ?? DEFAULT_BUDGET.weekly,
  };

  /** Resolves with the saved settings; rejects with ApiError (caller shows the message). */
  const saveBudget = useCallback(async (nextBudget) => {
    setSaving(true);
    try {
      const res = await api.patch(SETTINGS_PATH, { budget: nextBudget });
      setSaved(res.settings);
      return res.settings;
    } finally {
      setSaving(false);
    }
  }, []);

  return { budget, settings, error, loading, refetch, saveBudget, saving };
}
