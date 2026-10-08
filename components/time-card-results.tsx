import PaymentBreakdown, { type PaymentBreakdownLabels } from "@/components/payment/payment-breakdown";
import type { PaymentResult } from "@/lib/payment";

export type TimeCardResultsLabels = PaymentBreakdownLabels & {
  totalBreakTime: string;
  averageDailyPaidTime: string;
  weeklyTotals: string;
  overtimeSummary: string;
};

interface TimeCardResultsProps {
  breakMinutes: number;
  averageDayMinutes: number;
  weeklyMinuteTotals: number[];
  weeklyLabels?: string[];
  showOvertime: boolean;
  overtimeEnabled: boolean;
  includePayment: boolean;
  paymentValid: boolean;
  paymentResult: PaymentResult;
  formatDuration: (minutes: number) => string;
  formatAmount: (amount: number) => string;
  formatPaymentMinutes: (minutes: number) => string;
  labels: TimeCardResultsLabels;
}

export default function TimeCardResults({
  breakMinutes, averageDayMinutes, weeklyMinuteTotals, weeklyLabels, showOvertime,
  overtimeEnabled, includePayment, paymentValid, paymentResult,
  formatDuration, formatAmount, formatPaymentMinutes, labels,
}: TimeCardResultsProps) {
  return <>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border bg-gray-50 p-3"><p className="text-xs text-gray-500">{labels.totalBreakTime}</p><p className="text-lg font-semibold text-gray-900">{formatDuration(breakMinutes)}</p></div>
      <div className="rounded-lg border bg-gray-50 p-3"><p className="text-xs text-gray-500">{labels.averageDailyPaidTime}</p><p className="text-lg font-semibold text-gray-900">{formatDuration(averageDayMinutes)}</p></div>
      <div className="rounded-lg border bg-gray-50 p-3"><p className="text-xs text-gray-500">{labels.weeklyTotals}</p><p className="text-lg font-semibold text-gray-900">{weeklyLabels ? weeklyMinuteTotals.map((minutes, index) => <span key={weeklyLabels[index]} className="mt-1 block text-sm"><span className="font-normal">{weeklyLabels[index]}: </span>{formatDuration(minutes)}</span>) : weeklyMinuteTotals.map(formatDuration).join(" / ")}</p></div>
      <div className="rounded-lg border bg-gray-50 p-3"><p className="text-xs text-gray-500">{labels.overtimeSummary}</p><p className="text-lg font-semibold text-gray-900">{showOvertime && overtimeEnabled ? `${formatDuration(paymentResult.overtimeMinutes)} (${formatPaymentMinutes(paymentResult.overtimeMinutes)})` : "-"}</p></div>
    </div>
    {includePayment && paymentValid && <PaymentBreakdown result={paymentResult} formatAmount={formatAmount} formatMinutes={formatPaymentMinutes} labels={labels} />}
  </>;
}
