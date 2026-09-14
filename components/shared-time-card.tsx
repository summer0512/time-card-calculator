import { CalendarDays, Clock3, LockKeyhole, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TimeCardResults, { type TimeCardResultsLabels } from "@/components/time-card-results";
import type { SharedTimeCard } from "@/lib/time-cards/types";
import { calculateClockSpanMinutes, formatDurationMinutes } from "@/lib/time-cards/time";
import { calculatePayment, formatPaymentAmount, formatPaymentHoursFromMinutes, type WorkPeriod } from "@/lib/payment";

type Labels = TimeCardResultsLabels & {
  readOnly: string; start: string; end: string; breaks: string; dailyTotal: string;
  totalHours: string; totalPay: string; reportHeader: string; notes: string;
};

export default function SharedTimeCardView({ card, locale, labels }: { card: SharedTimeCard; locale: string; labels: Labels }) {
  const dailyMinutes = card.rows.map((row) => Math.max(0,
    row.punches.reduce((sum, punch) => sum + (calculateClockSpanMinutes(punch.start, punch.end) ?? 0), 0)
      - row.breaks.reduce((sum, item) => sum + item.minutes, 0),
  ));
  const breakMinutes = card.rows.reduce((sum, row) => sum + row.breaks.reduce((rowSum, item) => rowSum + item.minutes, 0), 0);
  const workedDays = card.settings.mode === "split-shift" ? (card.cachedTotalMinutes > 0 ? 1 : 0) : dailyMinutes.filter((value) => value > 0).length;
  const averageDayMinutes = workedDays > 0 ? Math.round(card.cachedTotalMinutes / workedDays) : 0;
  const weeklyMinuteTotals: number[] = [];
  if (card.settings.mode === "hours" || card.settings.mode === "split-shift") weeklyMinuteTotals.push(card.cachedTotalMinutes);
  else for (let index = 0; index < dailyMinutes.length; index += 7) weeklyMinuteTotals.push(dailyMinutes.slice(index, index + 7).reduce((sum, value) => sum + value, 0));
  const workPeriods: WorkPeriod[] = dailyMinutes.map((workedMinutes, index) => ({
    dayId: card.settings.mode === "split-shift" ? "split-day" : String(index % 7),
    weekId: card.settings.mode === "hours" ? "shift" : card.settings.mode === "split-shift" ? "week-1" : String(Math.floor(index / 7)),
    workedMinutes,
  }));
  const paymentResult = calculatePayment({ enabled: card.paymentEnabled, currency: card.currency ?? "USD",
    hourlyRate: card.hourlyRate === null ? null : Number(card.hourlyRate), overtime: card.settings.overtime }, workPeriods);
  const formatAmount = (amount: number) => formatPaymentAmount(amount, card.currency ?? "USD", locale);
  const formatPaymentMinutes = (minutes: number) => formatPaymentHoursFromMinutes(minutes, locale);
  const pay = card.paymentEnabled && card.cachedTotalPay !== null
    ? new Intl.NumberFormat(locale, { style: "currency", currency: card.currency ?? "USD" }).format(Number(card.cachedTotalPay))
    : null;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-emerald-50 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
              <LockKeyhole className="h-3.5 w-3.5" />{labels.readOnly}
            </span>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{card.title}</h2>
          </div>
          <div className="flex gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{formatDurationMinutes(card.cachedTotalMinutes)}</span>
            {pay && <span className="inline-flex items-center gap-1"><WalletCards className="h-4 w-4" />{pay}</span>}
          </div>
        </div>
        {(card.reportHeader || card.notes) && <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {card.reportHeader && <div><dt className="text-xs font-medium text-slate-500">{labels.reportHeader}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{card.reportHeader}</dd></div>}
          {card.notes && <div><dt className="text-xs font-medium text-slate-500">{labels.notes}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{card.notes}</dd></div>}
        </dl>}
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="border-b p-3"><CalendarDays className="mr-1 inline h-4 w-4" />Date</th><th className="border-b p-3">{labels.start}</th><th className="border-b p-3">{labels.end}</th><th className="border-b p-3">{labels.breaks}</th><th className="border-b p-3 text-right">{labels.dailyTotal}</th></tr>
            </thead>
            <tbody>{card.rows.map((row, index) => <tr key={row.position} className="border-b last:border-0">
              <td className="p-3 font-medium text-slate-800">{row.dayLabel}</td>
              <td className="p-3 text-slate-700">{row.punches.map((p) => p.start || "—").join(", ")}</td>
              <td className="p-3 text-slate-700">{row.punches.map((p) => p.end || "—").join(", ")}</td>
              <td className="p-3 text-slate-700">{row.breaks.length ? row.breaks.map((item) => formatDurationMinutes(item.minutes)).join(" + ") : "—"}</td>
              <td className="p-3 text-right font-semibold text-slate-900">{formatDurationMinutes(dailyMinutes[index])}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <TimeCardResults breakMinutes={breakMinutes} averageDayMinutes={averageDayMinutes} weeklyMinuteTotals={weeklyMinuteTotals}
          showOvertime overtimeEnabled={card.settings.overtime.enabled} includePayment={card.paymentEnabled} paymentValid
          paymentResult={paymentResult} formatDuration={formatDurationMinutes} formatAmount={formatAmount}
          formatPaymentMinutes={formatPaymentMinutes} labels={labels} />
      </CardContent>
    </Card>
  );
}
