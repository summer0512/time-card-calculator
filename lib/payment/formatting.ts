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

export const formatPaymentHours = (hours: number, locale: string): string =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(hours)} h`;
