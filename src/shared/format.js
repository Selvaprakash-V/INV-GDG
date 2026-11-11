import { CURRENCY } from './constants';

const moneyFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency',
  currency: CURRENCY.code,
  maximumFractionDigits: 2,
});

/** Format an amount in the app currency, e.g. ₹1,250.50. */
export function formatMoney(amount) {
  return moneyFormatter.format(Number(amount) || 0);
}

/** The bare currency symbol, for input adornments. */
export const CURRENCY_SYMBOL = moneyFormatter.formatToParts(0).find((p) => p.type === 'currency')?.value ?? CURRENCY.code;
