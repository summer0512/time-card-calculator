import type { PaymentResult } from "@/lib/payment";

export interface PaymentBreakdownLabels {
  paymentBreakdown: string;
  totalHours: string;
  regularHours: string;
  overtimeHours: string;
  hourlyPayRate: string;
  regularPay: string;
  overtimeTier: string;
  totalOvertimePay: string;
  estimatedTotalPay: string;
  after: string;
  hours: string;
}

interface PaymentBreakdownProps {
  result: PaymentResult;
  formatAmount: (amount: number) => string;
  formatMinutes: (minutes: number) => string;
  labels: PaymentBreakdownLabels;
}

export default function PaymentBreakdown({
  result,
  formatAmount,
  formatMinutes,
  labels,
}: PaymentBreakdownProps) {
  return (
    <section className="mt-4 rounded-lg border border-blue-200 bg-blue-50/40 p-4" aria-labelledby="payment-breakdown-title">
      <h3 id="payment-breakdown-title" className="text-lg font-semibold text-gray-900">
        {labels.paymentBreakdown}
      </h3>

      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-gray-500">{labels.totalHours}</dt>
          <dd className="font-semibold">{formatMinutes(result.totalMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">{labels.regularHours}</dt>
          <dd className="font-semibold">{formatMinutes(result.regularMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">{labels.overtimeHours}</dt>
          <dd className="font-semibold">{formatMinutes(result.overtimeMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">{labels.hourlyPayRate}</dt>
          <dd className="font-semibold">{formatAmount(result.hourlyRate)}/h</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-3">
        <div className="rounded-md bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{labels.regularPay}</p>
              <p className="text-sm text-gray-600">
                {formatMinutes(result.regularMinutes)} × {formatAmount(result.hourlyRate)}/h
              </p>
            </div>
            <p className="font-semibold">{formatAmount(result.regularPay)}</p>
          </div>
        </div>

        {result.tiers.filter((tier) => tier.minutes > 0).map((tier, index) => {
          const nextTier = result.tiers[index + 1];
          return (
            <div key={tier.id} className="rounded-md bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{labels.overtimeTier} {index + 1}</p>
                  <p className="text-sm text-gray-600">
                    {nextTier
                      ? `${tier.afterHours}–${nextTier.afterHours} ${labels.hours}`
                      : `${labels.after} ${tier.afterHours} ${labels.hours}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatMinutes(tier.minutes)} × {formatAmount(tier.effectiveRate)}/h
                    {tier.rateType === "multiplier" ? ` (${tier.rateValue}×)` : ""}
                  </p>
                </div>
                <p className="font-semibold">{formatAmount(tier.pay)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {result.overtimeMinutes > 0 && (
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span>{labels.totalOvertimePay}</span>
          <strong>{formatAmount(result.overtimePay)}</strong>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-lg">
        <span className="font-semibold">{labels.estimatedTotalPay}</span>
        <strong className="text-green-700">{formatAmount(result.totalPay)}</strong>
      </div>
    </section>
  );
}
