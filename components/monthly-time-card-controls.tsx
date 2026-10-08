"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { averageMonthlyHours } from "@/lib/time-cards/monthly";

export default function MonthlyTimeCardControls({ year, month, onMonthChange, onFill }: {
  year: number; month: number;
  onMonthChange: (year: number, month: number) => void;
  onFill: (weekdays: number[], start: string, end: string, breakMinutes: number) => void;
}) {
  const t = useTranslations("MonthlyCalculator");
  const locale = useLocale();
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breakMinutes, setBreakMinutes] = useState("30");
  const [weeklyHours, setWeeklyHours] = useState("35");
  const weekly = Number(weeklyHours.replace(",", "."));
  return <div className="space-y-4 rounded-lg border border-blue-200 bg-white p-4">
    <label className="flex flex-wrap items-center gap-3 font-semibold">{t("month")}<Input type="month" min="1900-01" max="9999-12" value={`${year}-${String(month).padStart(2, "0")}`} className="w-48" onChange={event => {
      const [nextYear, nextMonth] = event.target.value.split("-").map(Number);
      if (nextYear >= 1900 && nextYear <= 9999 && nextMonth >= 1 && nextMonth <= 12) onMonthChange(nextYear, nextMonth);
    }} /></label>
    <fieldset className="space-y-3"><legend className="font-semibold">{t("fillTitle")}</legend>
      <div className="flex flex-wrap gap-3">{[1, 2, 3, 4, 5, 6, 0].map(day => <label key={day} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={weekdays.includes(day)} onChange={event => setWeekdays(previous => event.target.checked ? [...previous, day] : previous.filter(value => value !== day))} />{new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + day)))}</label>)}</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">{t("start")}<Input type="time" value={start} onChange={event => setStart(event.target.value)} className="w-36" /></label>
        <label className="text-sm">{t("end")}<Input type="time" value={end} onChange={event => setEnd(event.target.value)} className="w-36" /></label>
        <label className="text-sm">{t("breakMinutes")}<Input type="number" min="0" max="1440" value={breakMinutes} onChange={event => setBreakMinutes(event.target.value)} className="w-28" /></label>
        <Button type="button" disabled={!weekdays.length || !start || !end || breakMinutes === "" || !Number.isInteger(Number(breakMinutes)) || Number(breakMinutes) < 0 || Number(breakMinutes) > 1440} onClick={() => onFill(weekdays, start, end, Number(breakMinutes))}>{t("fill")}</Button>
      </div><p className="text-xs text-slate-500">{t("fillHint")}</p>
    </fieldset>
    <p className="text-sm text-slate-600">{t("calendarHint")}</p>
    <details className="border-t pt-3"><summary className="cursor-pointer font-medium">{t("averageTitle")}</summary><div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-sm">{t("weeklyHours")}<Input inputMode="decimal" value={weeklyHours} onChange={event => setWeeklyHours(event.target.value)} className="w-28" /></label><output className="font-semibold">{weeklyHours.trim() && Number.isFinite(weekly) && weekly >= 0 ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(averageMonthlyHours(weekly)) : "—"} {t("hoursPerMonth")}</output></div><p className="mt-2 text-xs text-slate-500">{t("averageHint")}</p></details>
  </div>;
}
