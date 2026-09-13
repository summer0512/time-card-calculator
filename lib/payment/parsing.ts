import Decimal from "decimal.js";

export const parseLocalizedDecimal = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new Decimal(trimmed.replace(",", "."));
    return parsed.isFinite() ? parsed.toNumber() : Number.NaN;
  } catch {
    return Number.NaN;
  }
};

export const hoursToWholeMinutes = (hours: number): number => {
  if (!Number.isFinite(hours)) return Number.NaN;

  return new Decimal(hours)
    .mul(60)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
};
