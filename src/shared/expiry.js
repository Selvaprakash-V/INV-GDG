import { EXPIRY, EXPIRY_STATUS, MS_PER_DAY } from './constants';

/**
 * Whole days from `now` until `date` (negative when already expired).
 * Replaces the old Product virtual, which used Math.abs and reported
 * expired items as having positive days left.
 */
export function daysUntil(date, now = new Date()) {
  const target = new Date(date);
  return Math.ceil((target.getTime() - now.getTime()) / MS_PER_DAY);
}

export function isExpired(date, now = new Date()) {
  return daysUntil(date, now) <= 0;
}

export function isExpiringWithin(date, days, now = new Date()) {
  const d = daysUntil(date, now);
  return d > 0 && d <= days;
}

/**
 * Status precedence: expired > expiring > out of stock > fresh.
 * (Guard clauses replace the old nested if/else chain.)
 */
export function expiryStatus({ expiryDate, stock }, now = new Date(), soonDays = EXPIRY.SOON_DAYS) {
  const days = daysUntil(expiryDate, now);
  if (days <= 0) return EXPIRY_STATUS.EXPIRED;
  if (days <= soonDays) return EXPIRY_STATUS.EXPIRING;
  if (stock === 0) return EXPIRY_STATUS.OUT_OF_STOCK;
  return EXPIRY_STATUS.FRESH;
}

export function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * MS_PER_DAY);
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
