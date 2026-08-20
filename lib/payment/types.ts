export type OvertimeBasis = "weekly" | "daily";

export type OvertimeRateType = "multiplier" | "fixed";

export interface OvertimeTier {
  id: string;
  afterHours: number;
  rateType: OvertimeRateType;
  rateValue: number;
}

export interface PaymentConfig {
  enabled: boolean;
  currency: string;
  hourlyRate: number | null;
  overtime: {
    enabled: boolean;
    basis: OvertimeBasis;
    tiers: OvertimeTier[];
  };
}

export interface WorkPeriod {
  dayId: string;
  weekId: string;
  workedHours: number;
}

export interface PaymentTierResult extends OvertimeTier {
  segmentStart: number;
  segmentEnd: number | null;
  hours: number;
  effectiveRate: number;
  pay: number;
}

export interface PaymentPeriodResult {
  periodId: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  tiers: PaymentTierResult[];
}

export interface PaymentResult {
  currency: string;
  hourlyRate: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  tiers: PaymentTierResult[];
  periods: PaymentPeriodResult[];
}

export type PaymentValidationCode =
  | "HOURLY_RATE_REQUIRED"
  | "INVALID_HOURLY_RATE"
  | "OVERTIME_TIERS_REQUIRED"
  | "TIER_ID_REQUIRED"
  | "DUPLICATE_TIER_ID"
  | "INVALID_THRESHOLD"
  | "DUPLICATE_THRESHOLD"
  | "INVALID_MULTIPLIER"
  | "INVALID_FIXED_RATE";

export interface PaymentValidationError {
  code: PaymentValidationCode;
  path: string;
  tierId?: string;
}
