// Calendar calculations use UTC date-only values to avoid DST and timezone shifts.
export const dateFromISO = (date: string) => new Date(`${date}T12:00:00Z`);
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export function monthDates(year: number, month: number): string[] {
  if (!Number.isInteger(year) || year < 1900 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12) throw new Error("Invalid month");
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length }, (_, index) => isoDate(new Date(Date.UTC(year, month - 1, index + 1))));
}
export function calendarWeekId(date: string): string {
  const value = dateFromISO(date);
  value.setUTCDate(value.getUTCDate() - (value.getUTCDay() + 6) % 7);
  return isoDate(value);
}
export function calendarWeekTotals(rows: Array<{ workDate?: string | null }>, minutes: number[]) {
  const groups = new Map<string, { start: string; end: string; minutes: number; partial: boolean }>();
  rows.forEach((row, index) => {
    if (!row.workDate) return;
    const key = calendarWeekId(row.workDate);
    const group = groups.get(key) ?? { start: row.workDate, end: row.workDate, minutes: 0, partial: false };
    group.end = row.workDate;
    group.minutes += minutes[index] ?? 0;
    groups.set(key, group);
  });
  return [...groups.values()].map(group => ({ ...group, partial: dateFromISO(group.start).getUTCDay() !== 1 || dateFromISO(group.end).getUTCDay() !== 0 }));
}
export function formatWorkDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(dateFromISO(date));
}
export const averageMonthlyHours = (weeklyHours: number) => weeklyHours * 52 / 12;
