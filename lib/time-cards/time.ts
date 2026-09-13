import Decimal from "decimal.js";

const decimalMinutes = (value: string): number | null => {
  try {
    const parsed = new Decimal(value.replace(",", "."));
    if (!parsed.isFinite() || parsed.isNegative()) return null;
    return parsed.mul(60).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
  } catch {
    return null;
  }
};

export const parseTimeToMinutes = (value: string): number | null => {
  const input = value.trim().toLowerCase();
  if (!input) return null;

  const amPmMatch = input.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/);
  if (amPmMatch) {
    const hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2] ?? "0");
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

    const normalizedHours = (hours % 12) + (amPmMatch[3] === "pm" ? 12 : 0);
    return normalizedHours * 60 + minutes;
  }

  const clockMatch = input.match(/^(\d{1,2}):(\d{1,2})$/);
  if (clockMatch) {
    const hours = Number(clockMatch[1]);
    const minutes = Number(clockMatch[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  if (/^\d+(?:[.,]\d+)?$/.test(input)) {
    const minutes = decimalMinutes(input);
    return minutes !== null && minutes < 24 * 60 ? minutes : null;
  }

  return null;
};

export const parseDurationToMinutes = (value: string): number | null => {
  const input = value.trim();
  if (!input) return null;

  const durationMatch = input.match(/^(\d+):(\d{1,2})$/);
  if (durationMatch) {
    const hours = Number(durationMatch[1]);
    const minutes = Number(durationMatch[2]);
    if (!Number.isSafeInteger(hours) || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  if (/^\d+(?:[.,]\d+)?$/.test(input)) {
    return decimalMinutes(input);
  }

  return null;
};

export const calculateClockSpanMinutes = (start: string, end: string): number | null => {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  if (startMinutes === null || endMinutes === null) return null;

  return endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : endMinutes + 24 * 60 - startMinutes;
};

export const formatDurationMinutes = (minutes: number): string => {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return `${hours}:${remainingMinutes.toString().padStart(2, "0")}`;
};

export const formatDecimalHoursFromMinutes = (
  minutes: number,
  locale: string,
  minimumFractionDigits = 2,
): string => {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  const hours = new Decimal(safeMinutes)
    .div(60)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(hours);
};

export const normalizeTimeTo24Hour = (value: string): string => {
  if (!value.trim()) return "";
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
};
