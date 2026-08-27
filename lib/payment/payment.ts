import Decimal from "decimal.js";
import type {
  OvertimeTier,
  PaymentConfig,
  PaymentPeriodResult,
  PaymentResult,
  PaymentTierResult,
  PaymentValidationError,
  WorkPeriod,
} from "./types.ts";
import { hoursToWholeMinutes } from "./parsing.ts";
import { validatePaymentConfig } from "./validation.ts";

export class InvalidPaymentConfigError extends Error {
  readonly validationErrors: PaymentValidationError[];

  constructor(validationErrors: PaymentValidationError[]) {
    super("Payment configuration is invalid");
    this.name = "InvalidPaymentConfigError";
    this.validationErrors = validationErrors;
  }
}

interface NormalizedOvertimeTier extends OvertimeTier {
  afterMinutes: number;
}

const roundMoney = (value: Decimal): Decimal =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

const moneyToNumber = (value: Decimal): number => roundMoney(value).toNumber();

const sumMoney = (values: number[]): number =>
  moneyToNumber(values.reduce((sum, value) => sum.plus(value), new Decimal(0)));

const normalizeAndSortTiers = (tiers: OvertimeTier[]): NormalizedOvertimeTier[] =>
  tiers
    .map((tier) => ({ ...tier, afterMinutes: hoursToWholeMinutes(tier.afterHours) }))
    .sort((left, right) => left.afterMinutes - right.afterMinutes);

const calculatePeriod = (
  periodId: string,
  totalMinutes: number,
  hourlyRate: Decimal,
  tiers: NormalizedOvertimeTier[],
): PaymentPeriodResult => {
  if (tiers.length === 0) {
    const regularPay = moneyToNumber(hourlyRate.mul(totalMinutes).div(60));
    return {
      periodId,
      totalMinutes,
      regularMinutes: totalMinutes,
      overtimeMinutes: 0,
      regularPay,
      overtimePay: 0,
      totalPay: regularPay,
      tiers: [],
    };
  }

  const regularMinutes = Math.min(totalMinutes, tiers[0].afterMinutes);
  const tierResults = tiers.map<PaymentTierResult>((tier, index) => {
    const nextTier = tiers[index + 1];
    const segmentEndMinutes = nextTier?.afterMinutes ?? Number.POSITIVE_INFINITY;
    const minutes = Math.max(
      Math.min(totalMinutes, segmentEndMinutes) - tier.afterMinutes,
      0,
    );
    const effectiveRate = tier.rateType === "multiplier"
      ? hourlyRate.mul(new Decimal(tier.rateValue))
      : new Decimal(tier.rateValue);

    return {
      id: tier.id,
      afterHours: tier.afterHours,
      rateType: tier.rateType,
      rateValue: tier.rateValue,
      segmentStartMinutes: tier.afterMinutes,
      segmentEndMinutes: Number.isFinite(segmentEndMinutes) ? segmentEndMinutes : null,
      minutes,
      effectiveRate: effectiveRate.toNumber(),
      pay: moneyToNumber(effectiveRate.mul(minutes).div(60)),
    };
  });

  const overtimeMinutes = tierResults.reduce((sum, tier) => sum + tier.minutes, 0);
  const regularPay = moneyToNumber(hourlyRate.mul(regularMinutes).div(60));
  const overtimePay = sumMoney(tierResults.map((tier) => tier.pay));
  const totalPay = sumMoney([regularPay, overtimePay]);

  return {
    periodId,
    totalMinutes,
    regularMinutes,
    overtimeMinutes,
    regularPay,
    overtimePay,
    totalPay,
    tiers: tierResults,
  };
};

const groupWorkPeriods = (
  config: PaymentConfig,
  workPeriods: WorkPeriod[],
): Map<string, number> => {
  const groups = new Map<string, number>();

  workPeriods.forEach((period) => {
    if (!Number.isSafeInteger(period.workedMinutes) || period.workedMinutes < 0) {
      throw new RangeError("Worked minutes must be a non-negative integer");
    }

    const periodId = config.overtime.basis === "daily"
      ? `${period.weekId}:${period.dayId}`
      : period.weekId;
    groups.set(periodId, (groups.get(periodId) ?? 0) + period.workedMinutes);
  });

  return groups;
};

const combineTierResults = (
  tiers: NormalizedOvertimeTier[],
  periods: PaymentPeriodResult[],
  hourlyRate: Decimal,
): PaymentTierResult[] => tiers.map((tier, index) => {
  const nextTier = tiers[index + 1];
  const periodTiers = periods.map((period) => period.tiers[index]);
  const effectiveRate = periodTiers[0]?.effectiveRate
    ?? (tier.rateType === "fixed"
      ? tier.rateValue
      : hourlyRate.mul(new Decimal(tier.rateValue)).toNumber());

  return {
    id: tier.id,
    afterHours: tier.afterHours,
    rateType: tier.rateType,
    rateValue: tier.rateValue,
    segmentStartMinutes: tier.afterMinutes,
    segmentEndMinutes: nextTier?.afterMinutes ?? null,
    minutes: periodTiers.reduce((sum, result) => sum + (result?.minutes ?? 0), 0),
    effectiveRate,
    pay: sumMoney(periodTiers.map((result) => result?.pay ?? 0)),
  };
});

export const calculatePayment = (
  config: PaymentConfig,
  workPeriods: WorkPeriod[],
): PaymentResult => {
  const validationErrors = validatePaymentConfig(config);
  if (validationErrors.length > 0) {
    throw new InvalidPaymentConfigError(validationErrors);
  }

  const hourlyRateNumber = config.enabled ? (config.hourlyRate ?? 0) : 0;
  const hourlyRate = new Decimal(hourlyRateNumber);
  const tiers = config.enabled && config.overtime.enabled
    ? normalizeAndSortTiers(config.overtime.tiers)
    : [];
  const groupedMinutes = groupWorkPeriods(config, workPeriods);
  const periods = [...groupedMinutes.entries()].map(([periodId, minutes]) =>
    calculatePeriod(periodId, minutes, hourlyRate, tiers));

  const totalMinutes = periods.reduce((sum, period) => sum + period.totalMinutes, 0);
  const regularMinutes = periods.reduce((sum, period) => sum + period.regularMinutes, 0);
  const overtimeMinutes = periods.reduce((sum, period) => sum + period.overtimeMinutes, 0);
  const regularPay = sumMoney(periods.map((period) => period.regularPay));
  const overtimePay = sumMoney(periods.map((period) => period.overtimePay));
  const totalPay = sumMoney([regularPay, overtimePay]);

  return {
    currency: config.currency,
    hourlyRate: hourlyRate.toNumber(),
    totalMinutes,
    regularMinutes,
    overtimeMinutes,
    regularPay,
    overtimePay,
    totalPay,
    tiers: combineTierResults(tiers, periods, hourlyRate),
    periods,
  };
};
