'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, useApi } from '@/lib/api-client';
import { EXPIRY } from '@/shared/constants';
import { errorMessage } from '../format';

const SETTINGS_PATH = '/api/me/settings';

const DEFAULT_NOTIFICATION_SETTINGS = Object.freeze({
  expiryThresholdDays: EXPIRY.DEFAULT_THRESHOLD_DAYS,
  emailEnabled: true,
  dailyDigest: true,
});

const clampThreshold = (n) =>
  Math.min(EXPIRY.MAX_THRESHOLD_DAYS, Math.max(EXPIRY.MIN_THRESHOLD_DAYS, Math.round(n)));

/**
 * Loads/saves the admin's notification settings via /api/me/settings.
 * @param {boolean} enabled  fetch only while the settings UI is open
 * @param {() => void} [onSaved]
 */
export function useNotificationSettings(enabled, onSaved) {
  const { data, error: loadError, loading, refetch } = useApi(enabled ? SETTINGS_PATH : null);
  const [form, setForm] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [status, setStatus] = useState({ saving: false, message: null, error: null, fieldErrors: null });

  useEffect(() => {
    const saved = data?.settings?.notificationSettings;
    if (saved) setForm({ ...DEFAULT_NOTIFICATION_SETTINGS, ...saved });
  }, [data]);

  useEffect(() => {
    if (enabled) setStatus({ saving: false, message: null, error: null, fieldErrors: null });
  }, [enabled]);

  const setField = useCallback((field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setStatus((s) => ({ ...s, message: null, error: null }));
  }, []);

  const save = useCallback(async () => {
    const threshold = Number(form.expiryThresholdDays);
    if (!Number.isFinite(threshold)) {
      setStatus({ saving: false, message: null, error: 'Enter a number of days', fieldErrors: null });
      return;
    }
    const notificationSettings = { ...form, expiryThresholdDays: clampThreshold(threshold) };
    setStatus({ saving: true, message: null, error: null, fieldErrors: null });
    try {
      const res = await api.patch(SETTINGS_PATH, { notificationSettings });
      const saved = res?.settings?.notificationSettings;
      if (saved) setForm({ ...DEFAULT_NOTIFICATION_SETTINGS, ...saved });
      setStatus({ saving: false, message: 'Settings saved', error: null, fieldErrors: null });
      onSaved?.();
    } catch (err) {
      setStatus({
        saving: false,
        message: null,
        error: errorMessage(err, 'Failed to save settings'),
        fieldErrors: err?.details ?? null,
      });
    }
  }, [form, onSaved]);

  return { form, setField, save, loading, loadError, refetch, ...status };
}
