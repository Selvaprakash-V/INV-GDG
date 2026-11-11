import { MS_PER_DAY } from '@/shared/constants';

const MS_PER_WEEK = 7 * MS_PER_DAY;

/** Lookup table replaces the old switch(period) blocks duplicated across helpers. */
export const PERIODS = Object.freeze({
  daily: { unit: 'day', buckets: 7 },
  weekly: { unit: 'week', buckets: 12 },
  monthly: { unit: 'month', buckets: 6 },
});

const fmt = (tz, opts) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, ...opts });

const UNIT_BUILDERS = {
  day(now, n, tz) {
    const keyFmt = fmt(tz, { year: 'numeric', month: '2-digit', day: '2-digit' });
    const labelFmt = fmt(tz, { day: '2-digit', month: 'short' });
    const labels = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * MS_PER_DAY);
      labels.push({ key: keyFmt.format(d), label: labelFmt.format(d) });
    }
    return {
      since: new Date(now.getTime() - n * MS_PER_DAY),
      bucketExpr: { $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate', timezone: tz } },
      labels,
    };
  },
  week(now, n, tz) {
    const labelFmt = fmt(tz, { day: '2-digit', month: 'short' });
    const labels = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const start = new Date(now.getTime() - (i + 1) * MS_PER_WEEK);
      labels.push({ key: i, label: i === 0 ? 'This week' : `Wk of ${labelFmt.format(start)}` });
    }
    return {
      since: new Date(now.getTime() - n * MS_PER_WEEK),
      // weeks-ago bucket: rolling 7-day windows ending now (no ISO-week edge cases)
      bucketExpr: { $floor: { $divide: [{ $subtract: [now, '$purchaseDate'] }, MS_PER_WEEK] } },
      labels,
    };
  },
  month(now, n, tz) {
    const keyFmt = fmt(tz, { year: 'numeric', month: '2-digit' });
    const labelFmt = fmt(tz, { month: 'short', year: '2-digit' });
    const labels = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
      labels.push({ key: keyFmt.format(d).slice(0, 7), label: labelFmt.format(d) });
    }
    return {
      since: new Date(now.getFullYear(), now.getMonth() - (n - 1), 1),
      bucketExpr: { $dateToString: { format: '%Y-%m', date: '$purchaseDate', timezone: tz } },
      labels,
    };
  },
};

export function periodWindow(period, { now = new Date(), timezone = 'UTC', buckets } = {}) {
  const spec = PERIODS[period] || PERIODS.weekly;
  return UNIT_BUILDERS[spec.unit](now, buckets ?? spec.buckets, timezone);
}

/** Left-join aggregation rows onto the full label range (no gaps in charts). */
export function fillSeries(labels, rows, zero) {
  const byKey = new Map(rows.map((r) => [String(r.key), r]));
  return labels.map(({ key, label }) => {
    const { key: _k, ...row } = byKey.get(String(key)) || {};
    return { label, ...zero, ...row };
  });
}
