import { format } from 'date-fns';
import { DATE_FORMAT } from './constants';
import { formatMoney } from '@/shared/format';

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatCurrency(value) {
  return formatMoney(value);
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

/** Formats an ISO date / Date as yyyy-MM-dd; returns an em dash for missing values. */
export function formatDate(value, pattern = DATE_FORMAT) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, pattern);
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Human-readable message for an ApiError (or any thrown value). */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.message || fallback;
}
