// Display helpers for the customer UI. Currency comes from the shared app-wide setting.
import { CURRENCY } from '@/shared/constants';
import { formatMoney, CURRENCY_SYMBOL } from '@/shared/format';

export { CURRENCY_SYMBOL };
export const LOCALE = CURRENCY.locale;

const PERCENT_MAX = 100;

export function formatCurrency(amount) {
  return formatMoney(amount);
}

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(LOCALE, options);
}

/** Share of `total` as a 0–100 percentage; 0 when the budget is 0/unset. */
export function percentOf(value, total) {
  if (!total || total <= 0) return 0;
  return Math.min(PERCENT_MAX, Math.max(0, (value / total) * PERCENT_MAX));
}

/** "3 days left" / "1 day left" / "Expires today" */
export function daysLeftLabel(days) {
  if (days <= 0) return 'Expires today';
  return `${days} day${days === 1 ? '' : 's'} left`;
}
