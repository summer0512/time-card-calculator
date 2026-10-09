"use client";

import { useId, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MonthlyTimePicker from "@/components/monthly-time-picker";
import { averageMonthlyHours, monthDates, dateFromISO } from "@/lib/time-cards/monthly";
import { normalizeTimeTo24Hour } from "@/lib/time-cards/time";

export default function MonthlyTimeCardControls({ year, month, onMonthChange, onFill }: {
  year: number; month: number;
  onMonthChange: (year: number, month: number) => void;
  onFill: (weekdays: number[], start: string, end: string, breakMinutes: number) => void;
}) {
  const t = useTranslations("MonthlyCalculator");
  const locale = useLocale();
  const id = useId();
  const [monthOpen, setMonthOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(String(year));
  const validYear = /^\d{4}$/.test(pickerYear) && Number(pickerYear) >= 1900 && Number(pickerYear) <= 9999;
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breakMinutes, setBreakMinutes] = useState("30");
  const [weeklyHours, setWeeklyHours] = useState("35");
  const weekly = Number(weeklyHours.replace(",", "."));
  const dates = monthDates(year, month);
  const selectedDate = dateFromISO(dates[0]);
  const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const normalizedStart = normalizeTimeTo24Hour(start);
  const normalizedEnd = normalizeTimeTo24Hour(end);

  return <div data-monthly-controls className="space-y-4 rounded-xl border border-blue-200 bg-white p-4 sm:p-5">
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-6">
      <div className="space-y-3 rounded-lg bg-blue-50/70 p-4">
        <h2 id={`${id}-month`} className="text-sm font-semibold text-slate-900">{t("month")}</h2>
        <Popover open={monthOpen} onOpenChange={open => { if (open) setPickerYear(String(year)); setMonthOpen(open); }}>
          <PopoverTrigger asChild><Button type="button" variant="outline" aria-labelledby={`${id}-month ${id}-selected`} className="h-11 w-full justify-start gap-2 border-blue-200 bg-white text-blue-800"><CalendarDays className="h-4 w-4 shrink-0" /><span id={`${id}-selected`} className="truncate">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(selectedDate)}</span></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-72 max-w-[calc(100vw-2rem)] space-y-4 rounded-xl border-blue-100 p-4" aria-label={t("month")}>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" disabled={!validYear || Number(pickerYear) <= 1900} aria-label={t("previousYear")} onClick={() => setPickerYear(String(Number(pickerYear) - 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Input type="number" min="1900" max="9999" aria-label={t("year")} aria-invalid={!validYear} className="h-9 min-w-0 text-center font-semibold" value={pickerYear} onChange={event => setPickerYear(event.target.value)} />
              <Button type="button" variant="ghost" size="icon" disabled={!validYear || Number(pickerYear) >= 9999} aria-label={t("nextYear")} onClick={() => setPickerYear(String(Number(pickerYear) + 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-3 gap-2">{Array.from({ length: 12 }, (_, index) => index + 1).map(option => <Button key={option} type="button" variant={Number(pickerYear) === year && option === month ? "default" : "ghost"} aria-pressed={Number(pickerYear) === year && option === month} disabled={!validYear} className="h-10 px-2" onClick={() => { onMonthChange(Number(pickerYear), option); setMonthOpen(false); }}>{new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, option - 1, 1)))}</Button>)}</div>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-slate-500">{dateFormat.format(selectedDate)} – {dateFormat.format(dateFromISO(dates.at(-1)!))}</p>
        <p className="text-xs leading-relaxed text-slate-600">{t("calendarHint")}</p>
      </div>
      <fieldset className="min-w-0 space-y-3"><legend className="mb-3 text-sm font-semibold text-slate-900">{t("fillTitle")}</legend>
        <div className="grid grid-cols-7 gap-1.5">{[1, 2, 3, 4, 5, 6, 0].map(day => <Button key={day} type="button" variant="outline" aria-pressed={weekdays.includes(day)} className={`h-9 min-w-0 px-1 text-xs ${weekdays.includes(day) ? "border-blue-500 bg-blue-50 text-blue-800 hover:bg-blue-100" : "border-slate-200 text-slate-500"}`} onClick={() => setWeekdays(previous => previous.includes(day) ? previous.filter(value => value !== day) : [...previous, day])}>{new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + day)))}</Button>)}</div>
        <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <MonthlyTimePicker label={t("start")} value={start} onChange={setStart} />
          <MonthlyTimePicker label={t("end")} value={end} onChange={setEnd} />
          <label className="space-y-1.5 text-sm font-medium text-slate-700">{t("breakMinutes")}<Input type="number" min="0" max="1440" value={breakMinutes} onChange={event => setBreakMinutes(event.target.value)} className="h-10" /></label>
          <Button type="button" className="h-10 w-full sm:col-span-3 xl:col-span-1" disabled={!weekdays.length || !normalizedStart || !normalizedEnd || breakMinutes === "" || !Number.isInteger(Number(breakMinutes)) || Number(breakMinutes) < 0 || Number(breakMinutes) > 1440} onClick={() => onFill(weekdays, normalizedStart, normalizedEnd, Number(breakMinutes))}>{t("fill")}</Button>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">{t("fillHint")}</p>
      </fieldset>
    </div>
    <details className="border-t border-slate-100 pt-3"><summary className="cursor-pointer text-sm font-medium">{t("averageTitle")}</summary><div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-sm">{t("weeklyHours")}<Input inputMode="decimal" value={weeklyHours} onChange={event => setWeeklyHours(event.target.value)} className="w-28" /></label><output className="font-semibold">{weeklyHours.trim() && Number.isFinite(weekly) && weekly >= 0 ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(averageMonthlyHours(weekly)) : "—"} {t("hoursPerMonth")}</output></div><p className="mt-2 text-xs text-slate-500">{t("averageHint")}</p></details>
  </div>;
}
