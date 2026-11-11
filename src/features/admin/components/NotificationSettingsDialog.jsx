'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXPIRY } from '@/shared/constants';
import { useNotificationSettings } from '../hooks/useSettings';
import { ErrorState, LoadingState } from './DataState';

function ToggleRow({ id, label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Button
        id={id}
        type="button"
        variant={value ? 'default' : 'outline'}
        size="sm"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        {value ? 'Enabled' : 'Disabled'}
      </Button>
    </div>
  );
}

/**
 * Expiry notification settings persisted via /api/me/settings.
 * @param {React.ReactElement} trigger element that opens the dialog
 * @param {() => void} [onSaved] e.g. refetch the inventory summary (threshold changed)
 */
export default function NotificationSettingsDialog({ trigger, onSaved }) {
  const [open, setOpen] = useState(false);
  const s = useNotificationSettings(open, onSaved);
  const thresholdError = s.fieldErrors?.['notificationSettings.expiryThresholdDays'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>Configure when and how you want to receive expiry notifications</DialogDescription>
        </DialogHeader>

        {s.loading && !s.loadError ? (
          <LoadingState label="Loading settings…" className="py-8" />
        ) : s.loadError ? (
          <ErrorState error={s.loadError} title="Could not load settings" onRetry={s.refetch} className="py-6" />
        ) : (
          <form
            className="space-y-4 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              s.save();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="expiry-threshold" className="text-sm font-medium">
                Notify me when products are expiring in:
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="expiry-threshold"
                  type="number"
                  min={EXPIRY.MIN_THRESHOLD_DAYS}
                  max={EXPIRY.MAX_THRESHOLD_DAYS}
                  value={s.form.expiryThresholdDays}
                  onChange={(e) => s.setField('expiryThresholdDays', e.target.value)}
                  className="w-24"
                  aria-invalid={Boolean(thresholdError)}
                />
                <span>days</span>
              </div>
              <p className="text-xs text-gray-500">
                Between {EXPIRY.MIN_THRESHOLD_DAYS} and {EXPIRY.MAX_THRESHOLD_DAYS} days.
              </p>
              {thresholdError && <p className="text-sm text-red-600">{thresholdError}</p>}
            </div>

            <ToggleRow
              id="email-enabled"
              label="Email Notifications"
              value={Boolean(s.form.emailEnabled)}
              onChange={(v) => s.setField('emailEnabled', v)}
            />
            <ToggleRow
              id="daily-digest"
              label="Daily Digest"
              description="One email per day summarising expiring products"
              value={Boolean(s.form.dailyDigest)}
              onChange={(v) => s.setField('dailyDigest', v)}
            />

            <div aria-live="polite" className="min-h-5">
              {s.message && (
                <p className="flex items-center gap-1 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {s.message}
                </p>
              )}
              {s.error && <p className="text-sm text-red-600" role="alert">{s.error}</p>}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={s.saving}>
                {s.saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
