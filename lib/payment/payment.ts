import type {
  OvertimeTier,
  PaymentConfig,
  PaymentPeriodResult,
  PaymentResult,
  PaymentTierResult,
  PaymentValidationError,
  WorkPeriod,
} from "./types.ts";
import { validatePaymentConfig } from "./validation.ts";

export class InvalidPaymentConfigError extends Error {
  readonly validationErrors: PaymentValidationError[];

  constructor(validationErrors: PaymentValidationError[]) {
    super("Payment configuration is invalid");
    this.name = "InvalidPaymentConfigError";
    this.validationErrors = validationErrors;
  }
}

const sortTiers = (tiers: OvertimeTier[]): OvertimeTier[] =>
  [...tiers].sort((left, right) => left.afterHours - right.afterHours);

const calculatePeriod = (
  periodId: string,
  totalHours: number,
  hourlyRate: number,
  tiers: OvertimeTier[],
): PaymentPeriodResult => {
  if (tiers.length === 0) {
    const regularPay = totalHours * hourlyRate;
    return {
      periodId,
      totalHours,
      regularHours: totalHours,
      overtimeHours: 0,
      regularPay,
      overtimePay: 0,
      totalPay: regularPay,
      tiers: [],
    };
  }

  const regularHours = Math.min(totalHours, tiers[0].afterHours);
  const tierResults = tiers.map<PaymentTierResult>((tier, index) => {
    const nextTier = tiers[index + 1];
    const segmentEnd = nextTier?.afterHours ?? Number.POSITIVE_INFINITY;
    const hours = Math.max(Math.min(totalHours, segmentEnd) - tier.afterHours, 0);
    const effectiveRate = tier.rateType === "multiplier"
      ? hourlyRate * tier.rateValue
      : tier.rateValue;

    return {
      ...tier,
      segmentStart: tier.afterHours,
      segmentEnd: Number.isFinite(segmentEnd) ? segmentEnd : null,
      hours,
      effectiveRate,
      pay: hours * effectiveRate,
    };
  });
  const overtimeHours = tierResults.reduce((sum, tier) => sum + tier.hours, 0);
  const regularPay = regularHours * hourlyRate;
  const overtimePay = tierResults.reduce((sum, tier) => sum + tier.pay, 0);

  return {
    periodId,
    totalHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay: regularPay + overtimePay,
    tiers: tierResults,
  };
};

const groupWorkPeriods = (config: PaymentConfig, workPeriods: WorkPeriod[]): Map<string, number> => {
  const groups = new Map<string, number>();

  workPeriods.forEach((period) => {
    if (!Number.isFinite(period.workedHours) || period.workedHours < 0) {
      throw new RangeError("Worked hours must be a finite, non-negative number");
    }

    const periodId = config.overtime.basis === "daily"
      ? `${period.weekId}:${period.dayId}`
      : period.weekId;
    groups.set(periodId, (groups.get(periodId) ?? 0) + period.workedHours);
  });

  return groups;
};

const combineTierResults = (
  tiers: OvertimeTier[],
  periods: PaymentPeriodResult[],
  hourlyRate: number,
): PaymentTierResult[] => tiers.map((tier, index) => {
  const nextTier = tiers[index + 1];
  const periodTiers = periods.map((period) => period.tiers[index]);
  const effectiveRate = periodTiers[0]?.effectiveRate
    ?? (tier.rateType === "fixed" ? tier.rateValue : hourlyRate * tier.rateValue);

  return {
    ...tier,
    segmentStart: tier.afterHours,
    segmentEnd: nextTier?.afterHours ?? null,
    hours: periodTiers.reduce((sum, result) => sum + (result?.hours ?? 0), 0),
    effectiveRate,
    pay: periodTiers.reduce((sum, result) => sum + (result?.pay ?? 0), 0),
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

  const hourlyRate = config.enabled ? (config.hourlyRate ?? 0) : 0;
  const tiers = config.enabled && config.overtime.enabled
    ? sortTiers(config.overtime.tiers)
    : [];
  const groupedHours = groupWorkPeriods(config, workPeriods);
  const periods = [...groupedHours.entries()].map(([periodId, hours]) =>
    calculatePeriod(periodId, hours, hourlyRate, tiers));
  const totalHours = periods.reduce((sum, period) => sum + period.totalHours, 0);
  const regularHours = periods.reduce((sum, period) => sum + period.regularHours, 0);
  const overtimeHours = periods.reduce((sum, period) => sum + period.overtimeHours, 0);
  const regularPay = periods.reduce((sum, period) => sum + period.regularPay, 0);
  const overtimePay = periods.reduce((sum, period) => sum + period.overtimePay, 0);

  return {
    currency: config.currency,
    hourlyRate,
    totalHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay: regularPay + overtimePay,
    tiers: combineTierResults(tiers, periods, hourlyRate),
    periods,
  };
};
