import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePayment,
  formatPaymentAmount,
  formatPaymentHours,
  InvalidPaymentConfigError,
  validatePaymentConfig,
  type OvertimeBasis,
  type OvertimeTier,
  type PaymentConfig,
  type WorkPeriod,
} from "../lib/payment/index.ts";

const config = (
  tiers: OvertimeTier[] = [],
  basis: OvertimeBasis = "weekly",
  hourlyRate = 20,
): PaymentConfig => ({
  enabled: true,
  currency: "USD",
  hourlyRate,
  overtime: {
    enabled: tiers.length > 0,
    basis,
    tiers,
  },
});

const week = (workedHours: number, weekId = "week-1"): WorkPeriod[] => [{
  dayId: "day-1",
  weekId,
  workedHours,
}];

test("calculates regular pay when overtime is disabled", () => {
  const result = calculatePayment(config(), week(40));

  assert.equal(result.regularHours, 40);
  assert.equal(result.overtimeHours, 0);
  assert.equal(result.totalPay, 800);
});

test("calculates one multiplier tier", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 },
  ]), week(46));

  assert.equal(result.regularPay, 800);
  assert.equal(result.overtimeHours, 6);
  assert.equal(result.overtimePay, 180);
  assert.equal(result.totalPay, 980);
});

test("derives ranges for multiple multiplier tiers", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 },
    { id: "tier-2", afterHours: 50, rateType: "multiplier", rateValue: 2 },
  ]), week(56));

  assert.deepEqual(result.tiers.map(({ hours, segmentStart, segmentEnd }) => ({
    hours,
    segmentStart,
    segmentEnd,
  })), [
    { hours: 10, segmentStart: 40, segmentEnd: 50 },
    { hours: 6, segmentStart: 50, segmentEnd: null },
  ]);
  assert.equal(result.totalPay, 1340);
});

test("uses a fixed hourly rate without applying the base rate", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 40, rateType: "fixed", rateValue: 35 },
  ]), week(46));

  assert.equal(result.tiers[0].effectiveRate, 35);
  assert.equal(result.overtimePay, 210);
  assert.equal(result.totalPay, 1010);
});

test("supports mixed multiplier and fixed tiers", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 },
    { id: "tier-2", afterHours: 50, rateType: "fixed", rateValue: 45 },
  ]), week(58));

  assert.deepEqual(result.tiers.map((tier) => tier.hours), [10, 8]);
  assert.deepEqual(result.tiers.map((tier) => tier.pay), [300, 360]);
  assert.equal(result.totalPay, 1460);
});

test("resets weekly tiers for each week in a biweekly period", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 },
  ]), [
    ...week(46, "week-1"),
    ...week(38, "week-2"),
  ]);

  assert.equal(result.regularHours, 78);
  assert.equal(result.overtimeHours, 6);
  assert.equal(result.periods.length, 2);
});

test("resets daily tiers for each day", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 8, rateType: "multiplier", rateValue: 1.5 },
    { id: "tier-2", afterHours: 12, rateType: "multiplier", rateValue: 2 },
  ], "daily"), [
    { dayId: "monday", weekId: "week-1", workedHours: 14 },
    { dayId: "tuesday", weekId: "week-1", workedHours: 7 },
  ]);

  assert.equal(result.regularHours, 15);
  assert.equal(result.overtimeHours, 6);
  assert.deepEqual(result.tiers.map((tier) => tier.hours), [4, 2]);
});

test("supports three mixed rate tiers", () => {
  const result = calculatePayment(config([
    { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 },
    { id: "tier-2", afterHours: 50, rateType: "fixed", rateValue: 40 },
    { id: "tier-3", afterHours: 60, rateType: "multiplier", rateValue: 2.5 },
  ]), week(65));

  assert.equal(result.regularHours, 40);
  assert.deepEqual(result.tiers.map((tier) => tier.hours), [10, 10, 5]);
  assert.deepEqual(result.tiers.map((tier) => tier.effectiveRate), [30, 40, 50]);
});

test("formats Spanish decimal hours and currency with Intl", () => {
  assert.equal(formatPaymentHours(8.5, "es-ES"), "8,5 h");
  assert.equal(formatPaymentAmount(12.5, "EUR", "es-ES").replace(/\u00a0/g, " "), "12,50 €");
});

test("sorts unsorted thresholds without mutating the input", () => {
  const tiers: OvertimeTier[] = [
    { id: "tier-3", afterHours: 60, rateType: "multiplier", rateValue: 2.5 },
    { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 },
    { id: "tier-2", afterHours: 50, rateType: "fixed", rateValue: 40 },
  ];
  const originalOrder = tiers.map((tier) => tier.id);
  const result = calculatePayment(config(tiers), week(65));

  assert.deepEqual(result.tiers.map((tier) => tier.afterHours), [40, 50, 60]);
  assert.deepEqual(tiers.map((tier) => tier.id), originalOrder);
});

test("uses precise worked hours instead of rounded display hours", () => {
  const preciseHours = 8 + 20 / 60;
  const result = calculatePayment(config([], "weekly", 12), week(preciseHours));

  assert.equal(result.totalPay, 100);
});

test("reports invalid and duplicate tiers before calculation", () => {
  const invalidConfig = config([
    { id: "tier", afterHours: 40, rateType: "multiplier", rateValue: 0 },
    { id: "tier", afterHours: 40, rateType: "fixed", rateValue: -1 },
  ]);
  const errors = validatePaymentConfig(invalidConfig);

  assert.deepEqual(errors.map((error) => error.code), [
    "INVALID_MULTIPLIER",
    "DUPLICATE_TIER_ID",
    "DUPLICATE_THRESHOLD",
    "INVALID_FIXED_RATE",
  ]);
  assert.throws(
    () => calculatePayment(invalidConfig, week(50)),
    (error) => error instanceof InvalidPaymentConfigError && error.validationErrors.length === 4,
  );
});

test("rejects invalid worked-hour values", () => {
  assert.throws(
    () => calculatePayment(config(), week(Number.NaN)),
    /Worked hours must be a finite, non-negative number/,
  );
});
