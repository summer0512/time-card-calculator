import { CalendarDays, Clock3, LockKeyhole, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SharedTimeCard } from "@/lib/time-cards/types";
import { calculateClockSpanMinutes, formatDurationMinutes } from "@/lib/time-cards/time";

type Labels = {
  readOnly: string; start: string; end: string; breaks: string; dailyTotal: string;
  totalHours: string; totalPay: string; reportHeader: string; notes: string;
};

export default function SharedTimeCardView({ card, locale, labels }: { card: SharedTimeCard; locale: string; labels: Labels }) {
  const dailyMinutes = card.rows.map((row) => Math.max(0,
    row.punches.reduce((sum, punch) => sum + (calculateClockSpanMinutes(punch.start, punch.end) ?? 0), 0)
      - row.breaks.reduce((sum, item) => sum + item.minutes, 0),
  ));
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
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-4"><dt className="text-xs font-medium text-blue-700">{labels.totalHours}</dt><dd className="mt-1 text-2xl font-semibold text-slate-900">{formatDurationMinutes(card.cachedTotalMinutes)}</dd></div>
          {pay && <div className="rounded-lg bg-emerald-50 p-4"><dt className="text-xs font-medium text-emerald-700">{labels.totalPay}</dt><dd className="mt-1 text-2xl font-semibold text-slate-900">{pay}</dd></div>}
        </dl>
      </CardContent>
    </Card>
  );
}
