import Decimal from "decimal.js";

export const formatPaymentAmount = (
  amount: number,
  currency: string,
  locale: string,
): string => new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(amount);

export const formatPaymentHoursFromMinutes = (
  minutes: number,
  locale: string,
): string => {
  const safeMinutes = Number.isFinite(minutes) ? Math.round(minutes) : 0;
  const hours = new Decimal(safeMinutes)
    .div(60)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(hours)} h`;
};

/** @deprecated Prefer formatPaymentHoursFromMinutes with integer minute inputs. */
export const formatPaymentHours = (hours: number, locale: string): string =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(hours)} h`;
