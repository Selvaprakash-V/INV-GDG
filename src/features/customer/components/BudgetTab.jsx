'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { LIMITS } from '@/shared/constants';
import { AsyncSection, TabFrame } from './SectionState';
import { CURRENCY_SYMBOL, formatCurrency, percentOf } from '../format';
import { TABS } from '../tabs';

const BUDGET_FIELDS = [
  { key: 'monthly', label: 'Monthly Budget', spentKey: 'currentMonth' },
  { key: 'weekly', label: 'Weekly Budget', spentKey: 'currentWeek' },
];

function validateBudget(draft) {
  const errors = {};
  for (const { key, label } of BUDGET_FIELDS) {
    const raw = String(draft[key]).trim();
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value)) errors[key] = `${label} must be a number`;
    else if (value < 0) errors[key] = `${label} cannot be negative`;
    else if (value > LIMITS.MAX_PRICE) errors[key] = `${label} cannot exceed ${formatCurrency(LIMITS.MAX_PRICE)}`;
  }
  return errors;
}

function BudgetRow({ field, budget, spent, editing, draftValue, error, onDraftChange }) {
  const id = `${field.key}Budget`;
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-4">
        {editing ? (
          <label htmlFor={id} className="text-lg font-medium">
            {field.label}
          </label>
        ) : (
          <span className="text-lg font-medium">{field.label}</span>
        )}
        {editing ? (
          <div className="relative">
            <span className="absolute left-3 top-2 text-lg" aria-hidden="true">{CURRENCY_SYMBOL}</span>
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              min="0"
              max={LIMITS.MAX_PRICE}
              value={draftValue}
              onChange={(e) => onDraftChange(field.key, e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="pl-8 text-lg h-12"
            />
          </div>
        ) : (
          <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <Progress
        value={percentOf(spent, budget)}
        className="h-3"
        aria-label={`${field.label}: ${formatCurrency(spent)} spent of ${formatCurrency(budget)}`}
      />
      <div className="flex justify-between mt-2">
        <p className="text-sm text-gray-500">{formatCurrency(spent)} spent</p>
        <p className="text-sm text-gray-500">{formatCurrency(budget)}</p>
      </div>
    </div>
  );
}

/** Budget settings persisted via PATCH /api/me/settings. */
export default function BudgetTab({ settings, spending }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(settings.budget);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }

  const startEditing = () => {
    setDraft({ monthly: String(settings.budget.monthly), weekly: String(settings.budget.weekly) });
    setErrors({});
    setStatus(null);
    setEditing(true);
  };

  const onDraftChange = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors = validateBudget(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await settings.saveBudget({ monthly: Number(draft.monthly), weekly: Number(draft.weekly) });
      setEditing(false);
      setStatus({ type: 'success', message: 'Budget saved.' });
    } catch (error) {
      if (error.details) {
        setErrors({ monthly: error.details['budget.monthly'], weekly: error.details['budget.weekly'] });
      }
      setStatus({ type: 'error', message: error.message || 'Could not save your budget.' });
    }
  };

  return (
    <TabFrame
      tabKey={TABS.BUDGET}
      title="Set Your Budget"
      subtitle="Manage your monthly and weekly spending limits"
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Budget Settings</CardTitle>
          <CardDescription className="text-lg">Set limits to help manage your grocery spending</CardDescription>
        </CardHeader>
        <AsyncSection
          loading={settings.loading}
          error={settings.error}
          onRetry={settings.refetch}
          errorMessage="Could not load your budget."
        >
          <CardContent className="space-y-6">
            {BUDGET_FIELDS.map((field) => (
              <BudgetRow
                key={field.key}
                field={field}
                budget={settings.budget[field.key]}
                spent={spending.data?.[field.spentKey]?.amount ?? 0}
                editing={editing}
                draftValue={draft[field.key]}
                error={errors[field.key]}
                onDraftChange={onDraftChange}
              />
            ))}
            {status && (
              <div
                role={status.type === 'error' ? 'alert' : 'status'}
                className={`flex items-center gap-2 p-3 rounded-md ${
                  status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                }`}
              >
                {status.type === 'error' ? (
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                )}
                <span>{status.message}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-4">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  className="text-lg h-12 px-6"
                  onClick={() => setEditing(false)}
                  disabled={settings.saving}
                >
                  Cancel
                </Button>
                <Button className="text-lg h-12 px-6" onClick={handleSave} disabled={settings.saving}>
                  {settings.saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button className="text-lg h-12 px-6" onClick={startEditing}>
                <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
                Edit Budget
              </Button>
            )}
          </CardFooter>
        </AsyncSection>
      </Card>
    </TabFrame>
  );
}
