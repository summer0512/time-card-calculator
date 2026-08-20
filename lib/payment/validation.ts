import type { PaymentConfig, PaymentValidationError } from "./types.ts";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const validatePaymentConfig = (config: PaymentConfig): PaymentValidationError[] => {
  const errors: PaymentValidationError[] = [];

  if (config.enabled) {
    if (config.hourlyRate === null) {
      errors.push({ code: "HOURLY_RATE_REQUIRED", path: "hourlyRate" });
    } else if (!isFiniteNumber(config.hourlyRate) || config.hourlyRate < 0) {
      errors.push({ code: "INVALID_HOURLY_RATE", path: "hourlyRate" });
    }
  }

  if (!config.enabled || !config.overtime.enabled) {
    return errors;
  }

  if (config.overtime.tiers.length === 0) {
    errors.push({ code: "OVERTIME_TIERS_REQUIRED", path: "overtime.tiers" });
    return errors;
  }

  const ids = new Set<string>();
  const thresholds = new Set<number>();

  config.overtime.tiers.forEach((tier, index) => {
    const path = `overtime.tiers.${index}`;

    if (!tier.id.trim()) {
      errors.push({ code: "TIER_ID_REQUIRED", path: `${path}.id` });
    } else if (ids.has(tier.id)) {
      errors.push({ code: "DUPLICATE_TIER_ID", path: `${path}.id`, tierId: tier.id });
    } else {
      ids.add(tier.id);
    }

    if (!isFiniteNumber(tier.afterHours) || tier.afterHours < 0) {
      errors.push({ code: "INVALID_THRESHOLD", path: `${path}.afterHours`, tierId: tier.id });
    } else if (thresholds.has(tier.afterHours)) {
      errors.push({ code: "DUPLICATE_THRESHOLD", path: `${path}.afterHours`, tierId: tier.id });
    } else {
      thresholds.add(tier.afterHours);
    }

    if (tier.rateType === "multiplier") {
      if (!isFiniteNumber(tier.rateValue) || tier.rateValue <= 0) {
        errors.push({ code: "INVALID_MULTIPLIER", path: `${path}.rateValue`, tierId: tier.id });
      }
    } else if (!isFiniteNumber(tier.rateValue) || tier.rateValue < 0) {
      errors.push({ code: "INVALID_FIXED_RATE", path: `${path}.rateValue`, tierId: tier.id });
    }
  });

  return errors;
};
