import assert from "node:assert/strict";
import test from "node:test";
import { monthDates, calendarWeekId, calendarWeekTotals, formatWorkDate, averageMonthlyHours } from "../lib/time-cards/monthly.ts";
import { timeCardInputSchema } from "../lib/time-cards/types.ts";
import { calculateClockSpanMinutes } from "../lib/time-cards/time.ts";

const monthly = (year: number, month: number) => {
  const dates = monthDates(year, month);
  return { title: "Monthly", reportHeader: "", notes: "", calculatorType: "monthly-time-card-calculator", sourcePath: "/de/stundenrechner-monat", periodType: "monthly", periodStart: dates[0], periodEnd: dates.at(-1), paymentEnabled: false, currency: null, hourlyRate: null, cachedTotalMinutes: 0, cachedTotalPay: null,
    settings: { mode: "time-card", timeFormat: "24h", showLunchColumn: false, breakColumnCount: 1, showBreakDeduction: true, isBiweekly: false, copyVariant: "time-card", overtime: { enabled: false, basis: "weekly", tiers: [] } },
    rows: dates.map((workDate, position) => ({ workDate, position, dayLabel: formatWorkDate(workDate, "de"), punches: [{ start: "", end: "" }], breaks: [] })) };
};

test("calendar months have their real length, including leap-year and century rules", () => {
  assert.equal(monthDates(2024, 2).length, 29);
  assert.equal(monthDates(2025, 2).length, 28);
  assert.equal(monthDates(2100, 2).length, 28);
  assert.equal(monthDates(2000, 2).length, 29);
  assert.equal(monthDates(2026, 4).length, 30);
  assert.equal(monthDates(2026, 10).length, 31);
  assert.throws(() => monthDates(2026, 13));
});
test("calendar weeks use Monday boundaries and remain unique across year changes", () => {
  assert.equal(calendarWeekId("2027-01-01"), "2026-12-28");
  assert.equal(calendarWeekId("2027-01-03"), "2026-12-28");
  assert.equal(calendarWeekId("2027-01-04"), "2027-01-04");
});
test("weekly subtotals include only the month and identify partial weeks", () => {
  const rows = monthDates(2026, 10).map(workDate => ({ workDate }));
  const groups = calendarWeekTotals(rows, rows.map(() => 60));
  assert.deepEqual(groups.map(group => group.minutes), [240, 420, 420, 420, 360]);
  assert.deepEqual(groups.map(group => group.partial), [true, false, false, false, true]);
  assert.equal(groups.reduce((sum, group) => sum + group.minutes, 0), 31 * 60);
});
test("monthly schema round-trips real dates and rejects missing, duplicate and wrong-month rows", () => {
  const card = monthly(2024, 2);
  assert.equal(timeCardInputSchema.parse(card).rows[28].workDate, "2024-02-29");
  assert.equal(timeCardInputSchema.safeParse({ ...card, rows: card.rows.slice(0, 28) }).success, false);
  assert.equal(timeCardInputSchema.safeParse({ ...card, rows: card.rows.map((row, index) => index === 1 ? { ...row, workDate: card.rows[0].workDate } : row) }).success, false);
  assert.equal(timeCardInputSchema.safeParse({ ...card, periodEnd: "2024-03-01" }).success, false);
});
test("overnight shift duration and monthly average are independent", () => {
  assert.equal(calculateClockSpanMinutes("22:00", "06:00"), 480);
  assert.ok(Math.abs(averageMonthlyHours(35) - 151.6666666667) < 1e-8);
});
test("legacy weekly and biweekly records keep their original undated format", () => {
  const card = monthly(2026, 10);
  for (const periodType of ["weekly", "biweekly"]) {
    const rows = card.rows.slice(0, periodType === "weekly" ? 7 : 14).map(row => ({ ...row, workDate: null }));
    const result = timeCardInputSchema.parse({ ...card, calculatorType: "biweekly-time-card-calculator", periodType, periodStart: null, periodEnd: null, rows });
    assert.equal(result.periodType, periodType);
    assert.equal(result.rows[0].workDate, null);
  }
});
