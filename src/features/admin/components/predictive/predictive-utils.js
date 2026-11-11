import { format } from 'date-fns';
import { addDays } from '@/shared/expiry';
import { RISK_THRESHOLDS } from '../../constants';

export function riskTone(score) {
  if (score >= RISK_THRESHOLDS.HIGH) return 'danger';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'warning';
  return 'neutral';
}

export const CONFIDENCE_TONES = Object.freeze({ high: 'success', medium: 'warning', low: 'neutral' });

export const PRIORITY_TONES = Object.freeze({ high: 'danger', medium: 'warning', low: 'info' });

export const PRIORITY_CARD_CLASSES = Object.freeze({
  high: 'border-red-200 bg-red-50',
  medium: 'border-yellow-200 bg-yellow-50',
  low: 'border-blue-200 bg-blue-50',
});

/**
 * Joins the observed daily sales trend with the projected days so both render
 * on one chart; the last observed point is duplicated into the forecast line
 * so the two segments connect.
 */
export function buildForecastSeries(salesTrend = [], forecast = [], now = new Date()) {
  const observed = salesTrend.map((p) => ({ label: p.label, actual: p.totalSales, forecast: null }));
  if (observed.length && forecast.length) observed[observed.length - 1].forecast = observed[observed.length - 1].actual;
  const projected = forecast.map((value, i) => ({
    label: format(addDays(now, i + 1), 'MMM d'),
    actual: null,
    forecast: value,
  }));
  return observed.concat(projected);
}
