"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Copy, RotateCcw, CreditCard, Printer, Plus, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslations } from "next-intl";

interface DayEntry {
  date: string;
  from: string;
  to: string;
  breakDeduction: string;
  lunch?: string;
  breaks: string[];
}

export interface CalculatorLabels {
  start: string;
  end: string;
  break: string;
  lunch: string;
  day: string;
}

interface TimeCardCalculatorProps {
  mode?: "time-card" | "hours";
  defaultBreakMinutes?: number;
  showLunchBreak?: boolean;
  showMultipleBreaks?: boolean;
  showBiweekly?: boolean;
  showOvertime?: boolean;
  showPrintableTimesheet?: boolean;
  timeFormat?: "auto" | "12h" | "24h" | "military";
  copyVariant?: "time-card" | "timesheet" | "time-clock" | "punch";
  labels?: CalculatorLabels;
  defaultCurrency?: string;
  defaultHourlyRate?: string;
  hourlyRateUnitLabel?: string;
  uiText?: Partial<CalculatorUiText>;
}

export interface CalculatorUiText {
  weekDays: string[];
  shiftLabel: string;
  weekLabel: string;
  clearAll: string;
  print: string;
  copyFirstRow: string;
  withLunch: string;
  withBreak: string;
  payment: string;
  includePaymentInformation: string;
  hourlyPayRate: string;
  settings: string;
  biweeklyToggle: string;
  reportHeaderPlaceholder: string;
  notesPlaceholder: string;
  removeColumnTitle: string;
  dailyTotal: string;
  action: string;
  clearRowTitle: string;
  totalPaidHours: string;
  totalBreakTime: string;
  averageDailyPaidTime: string;
  weeklyTotals: string;
  overtimeSummary: string;
  hidden: string;
  printReportTitles: {
    "time-card": string;
    timesheet: string;
    "time-clock": string;
    punch: string;
  };
  generatedOn: string;
  header: string;
  total: string;
  totalHours: string;
  overtime: string;
  totalPay: string;
  notes: string;
  defaultCurrency: string;
  defaultHourlyRate: string;
  hourlyRateUnitLabel: string;
}

const DEFAULT_LABELS: CalculatorLabels = {
  start: "From",
  end: "To",
  break: "Break",
  lunch: "Lunch",
  day: "Date"
};

const DEFAULT_UI_TEXT: CalculatorUiText = {
  weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  shiftLabel: "Shift",
  weekLabel: "Week",
  clearAll: "Clear All",
  print: "Print",
  copyFirstRow: "Copy First Row",
  withLunch: "With Lunch",
  withBreak: "With Break",
  payment: "Payment",
  includePaymentInformation: "Include payment information",
  hourlyPayRate: "Hourly Pay Rate",
  settings: "Settings",
  biweeklyToggle: "Biweekly (14 days)",
  reportHeaderPlaceholder: "Report header (employee name / date range)",
  notesPlaceholder: "Notes or signature details",
  removeColumnTitle: "Remove column",
  dailyTotal: "Daily Total",
  action: "Action",
  clearRowTitle: "Clear row",
  totalPaidHours: "Total Paid Hours",
  totalBreakTime: "Total Break Time",
  averageDailyPaidTime: "Average Daily Paid Time",
  weeklyTotals: "Weekly Total(s)",
  overtimeSummary: "Overtime Summary",
  hidden: "Hidden",
  printReportTitles: {
    "time-card": "Time Card Report",
    timesheet: "Timesheet Report",
    "time-clock": "Time Clock Report",
    punch: "Time Punch Report"
  },
  generatedOn: "Generated on",
  header: "Header",
  total: "Total",
  totalHours: "Total Hours",
  overtime: "Overtime",
  totalPay: "Total Pay",
  notes: "Notes",
  defaultCurrency: "$",
  defaultHourlyRate: "35",
  hourlyRateUnitLabel: "/hr"
};

const toBreakString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.max(0, minutes % 60);
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

const minutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.max(0, minutes % 60);
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr.trim()) return 0;

  const cleanTime = timeStr.trim().toLowerCase();
  let hours = 0;
  let minutes = 0;

  if (cleanTime.includes("am") || cleanTime.includes("pm")) {
    const isPM = cleanTime.includes("pm");
    const timeOnly = cleanTime.replace(/[ap]m/g, "").trim();

    if (timeOnly.includes(":")) {
      const [h, m] = timeOnly.split(":");
      hours = parseInt(h, 10) || 0;
      minutes = parseInt(m, 10) || 0;
    } else {
      hours = parseInt(timeOnly, 10) || 0;
    }

    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  if (cleanTime.includes(":")) {
    const [h, m] = cleanTime.split(":");
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
    return hours * 60 + minutes;
  }

  if (cleanTime.includes(".")) {
    const value = Number(cleanTime);
    if (!Number.isNaN(value)) {
      const whole = Math.floor(value);
      const fractional = value - whole;
      return whole * 60 + Math.round(fractional * 60);
    }
  }

  return (parseInt(cleanTime, 10) || 0) * 60;
};

const calculateDayTotal = (day: DayEntry, showLunch: boolean, breakColumns: number): number => {
  const fromMinutes = parseTimeToMinutes(day.from);
  const toMinutes = parseTimeToMinutes(day.to);

  if (fromMinutes === 0 || toMinutes === 0) return 0;

  let totalMinutes = toMinutes - fromMinutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60;

  const baseBreak = breakColumns > 0 ? parseTimeToMinutes(day.breakDeduction) : 0;
  const lunchMinutes = showLunch ? parseTimeToMinutes(day.lunch ?? "") : 0;
  const extraBreakMinutes = day.breaks
    .slice(1, breakColumns)
    .reduce((sum, value) => sum + parseTimeToMinutes(value), 0);

  return Math.max(0, totalMinutes - baseBreak - lunchMinutes - extraBreakMinutes);
};

const calculateRawShiftMinutes = (day: DayEntry): number => {
  const fromMinutes = parseTimeToMinutes(day.from);
  const toMinutes = parseTimeToMinutes(day.to);
  if (fromMinutes === 0 || toMinutes === 0) return 0;

  let totalMinutes = toMinutes - fromMinutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  return totalMinutes;
};

const getFirstDay = (
  timeFormat: TimeCardCalculatorProps["timeFormat"],
  breakDefault: string,
  includeLunch: boolean,
  firstDayLabel: string
): DayEntry => {
  if (timeFormat === "24h" || timeFormat === "military") {
    return {
      date: firstDayLabel,
      from: "08:00",
      to: "17:00",
      breakDeduction: breakDefault,
      lunch: includeLunch ? breakDefault : undefined,
      breaks: [breakDefault]
    };
  }

  return {
    date: firstDayLabel,
    from: "8:00AM",
    to: "5:00PM",
    breakDeduction: breakDefault,
    lunch: includeLunch ? breakDefault : undefined,
    breaks: [breakDefault]
  };
};

const createDays = (
  mode: "time-card" | "hours",
  biweekly: boolean,
  breakColumns: number,
  includeLunch: boolean,
  breakDefault: string,
  timeFormat: TimeCardCalculatorProps["timeFormat"],
  weekDays: string[],
  weekLabel: string,
  shiftLabel: string
): DayEntry[] => {
  if (mode === "hours") {
    const first = getFirstDay(timeFormat, breakDefault, includeLunch, weekDays[0] || "Monday");
    return [{ ...first, date: shiftLabel }];
  }

  if (biweekly) {
    const days: DayEntry[] = [];
    for (let week = 1; week <= 2; week += 1) {
      weekDays.forEach((day, index) => {
        const first = getFirstDay(timeFormat, breakDefault, includeLunch, weekDays[0] || "Monday");
        days.push({
          date: `${weekLabel} ${week} - ${day}`,
          from: week === 1 && index === 0 ? first.from : "",
          to: week === 1 && index === 0 ? first.to : "",
          breakDeduction: week === 1 && index === 0 ? first.breakDeduction : "",
          lunch: includeLunch ? (week === 1 && index === 0 ? first.lunch : "") : undefined,
          breaks: Array.from({ length: breakColumns }, (_, breakIndex) =>
            week === 1 && index === 0 && breakIndex === 0 ? breakDefault : ""
          )
        });
      });
    }
    return days;
  }

  const first = getFirstDay(timeFormat, breakDefault, includeLunch, weekDays[0] || "Monday");
  return weekDays.map((day, index) => ({
    date: day,
    from: index === 0 ? first.from : "",
    to: index === 0 ? first.to : "",
    breakDeduction: index === 0 ? first.breakDeduction : "",
    lunch: includeLunch ? (index === 0 ? first.lunch : "") : undefined,
    breaks: Array.from({ length: breakColumns }, (_, breakIndex) =>
      index === 0 && breakIndex === 0 ? breakDefault : ""
    )
  }));
};

export default function TimeCardCalculator({
  mode = "time-card",
  defaultBreakMinutes = 30,
  showLunchBreak = false,
  showMultipleBreaks = false,
  showBiweekly = false,
  showOvertime = true,
  showPrintableTimesheet = true,
  timeFormat = "auto",
  copyVariant = "time-card",
  labels = DEFAULT_LABELS,
  defaultCurrency,
  defaultHourlyRate,
  hourlyRateUnitLabel,
  uiText,
}: TimeCardCalculatorProps) {
  const tCalculator = useTranslations("Calculator");
  const localizedUiText: Partial<CalculatorUiText> = {
    weekDays: (tCalculator.raw("weekDays") as string[]) || DEFAULT_UI_TEXT.weekDays,
    shiftLabel: tCalculator("shiftLabel"),
    weekLabel: tCalculator("weekLabel"),
    clearAll: tCalculator("clearAll"),
    print: tCalculator("print"),
    copyFirstRow: tCalculator("copyFirstRow"),
    withLunch: tCalculator("withLunch"),
    withBreak: tCalculator("withBreak"),
    payment: tCalculator("payment"),
    includePaymentInformation: tCalculator("includePaymentInformation"),
    hourlyPayRate: tCalculator("hourlyPayRate"),
    settings: tCalculator("settings"),
    biweeklyToggle: tCalculator("biweeklyToggle"),
    reportHeaderPlaceholder: tCalculator("reportHeaderPlaceholder"),
    notesPlaceholder: tCalculator("notesPlaceholder"),
    removeColumnTitle: tCalculator("removeColumnTitle"),
    dailyTotal: tCalculator("dailyTotal"),
    action: tCalculator("action"),
    clearRowTitle: tCalculator("clearRowTitle"),
    totalPaidHours: tCalculator("totalPaidHours"),
    totalBreakTime: tCalculator("totalBreakTime"),
    averageDailyPaidTime: tCalculator("averageDailyPaidTime"),
    weeklyTotals: tCalculator("weeklyTotals"),
    overtimeSummary: tCalculator("overtimeSummary"),
    hidden: tCalculator("hidden"),
    generatedOn: tCalculator("generatedOn"),
    header: tCalculator("header"),
    total: tCalculator("total"),
    totalHours: tCalculator("totalHours"),
    overtime: tCalculator("overtime"),
    totalPay: tCalculator("totalPay"),
    notes: tCalculator("notes"),
    defaultCurrency: tCalculator("defaultCurrency"),
    defaultHourlyRate: tCalculator("defaultHourlyRate"),
    hourlyRateUnitLabel: tCalculator("hourlyRateUnitLabel"),
    printReportTitles: {
      "time-card": tCalculator("printReportTitles.time-card"),
      timesheet: tCalculator("printReportTitles.timesheet"),
      "time-clock": tCalculator("printReportTitles.time-clock"),
      punch: tCalculator("printReportTitles.punch"),
    }
  };
  const t: CalculatorUiText = {
    ...DEFAULT_UI_TEXT,
    ...localizedUiText,
    ...uiText,
    printReportTitles: {
      ...DEFAULT_UI_TEXT.printReportTitles,
      ...(uiText?.printReportTitles || {})
    }
  };
  const baseLabels: CalculatorLabels = {
    start: tCalculator("labels.start"),
    end: tCalculator("labels.end"),
    break: tCalculator("labels.break"),
    lunch: tCalculator("labels.lunch"),
    day: tCalculator("labels.day")
  };
  const mergedLabels: CalculatorLabels = labels ? { ...labels, ...baseLabels } : baseLabels;
  const breakDefault = toBreakString(defaultBreakMinutes);
  const initialBreakColumns = showMultipleBreaks ? 2 : 1;

  const [showLunchColumn, setShowLunchColumn] = useState(showLunchBreak);
  const [breakColumns, setBreakColumns] = useState(initialBreakColumns);
  const [isBiweekly, setIsBiweekly] = useState(mode === "time-card" && showBiweekly);

  const [reportHeader, setReportHeader] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [includePayment, setIncludePayment] = useState(true);
  const [basePay, setBasePay] = useState(defaultHourlyRate ?? t.defaultHourlyRate);
  const [currency, setCurrency] = useState(defaultCurrency ?? t.defaultCurrency);

  const [days, setDays] = useState<DayEntry[]>(
    createDays(mode, mode === "time-card" && showBiweekly, initialBreakColumns, showLunchBreak, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel)
  );

  useEffect(() => {
    setShowLunchColumn(showLunchBreak);
    setBreakColumns(initialBreakColumns);
    setIsBiweekly(mode === "time-card" && showBiweekly);
    setDays(createDays(mode, mode === "time-card" && showBiweekly, initialBreakColumns, showLunchBreak, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel));
  }, [mode, showLunchBreak, showBiweekly, showMultipleBreaks, defaultBreakMinutes, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel]);

  useEffect(() => {
    setBasePay(defaultHourlyRate ?? t.defaultHourlyRate);
    setCurrency(defaultCurrency ?? t.defaultCurrency);
  }, [defaultHourlyRate, defaultCurrency, t.defaultHourlyRate, t.defaultCurrency]);

  useEffect(() => {
    setDays(createDays(mode, isBiweekly, breakColumns, showLunchColumn, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel));
  }, [isBiweekly, mode, breakColumns, showLunchColumn, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel]);

  const totals = useMemo(() => {
    const dayTotals = days.map((day) => calculateDayTotal(day, showLunchColumn, breakColumns));
    const rawMinutes = days.map((day) => calculateRawShiftMinutes(day));
    const totalMinutes = dayTotals.reduce((sum, value) => sum + value, 0);
    const totalRawMinutes = rawMinutes.reduce((sum, value) => sum + value, 0);
    const breakMinutes = Math.max(0, totalRawMinutes - totalMinutes);
    const workedDays = dayTotals.filter((value) => value > 0).length;

    const weeklyMinuteTotals: number[] = [];
    if (mode === "hours") {
      weeklyMinuteTotals.push(totalMinutes);
    } else {
      for (let i = 0; i < dayTotals.length; i += 7) {
        weeklyMinuteTotals.push(dayTotals.slice(i, i + 7).reduce((sum, value) => sum + value, 0));
      }
    }

    const weeklyOvertimeMinutes = weeklyMinuteTotals.map((value) => Math.max(0, value - 40 * 60));
    const totalOvertimeMinutes = weeklyOvertimeMinutes.reduce((sum, value) => sum + value, 0);

    return {
      dayTotals,
      totalMinutes,
      totalHours: totalMinutes / 60,
      totalRawMinutes,
      breakMinutes,
      workedDays,
      averageDayMinutes: workedDays > 0 ? Math.round(totalMinutes / workedDays) : 0,
      weeklyMinuteTotals,
      weeklyOvertimeMinutes,
      totalOvertimeMinutes
    };
  }, [days, breakColumns, showLunchColumn, mode]);

  const totalPay = (totals.totalHours || 0) * (Number(basePay) || 0);

  const updateDay = (index: number, field: keyof DayEntry, value: string) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateDayLunch = (index: number, value: string) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], lunch: value };
      return next;
    });
  };

  const updateDayBreak = (dayIndex: number, breakIndex: number, value: string) => {
    setDays((prev) => {
      const next = [...prev];
      const row = { ...next[dayIndex], breaks: [...next[dayIndex].breaks] };
      row.breaks[breakIndex] = value;
      next[dayIndex] = row;
      return next;
    });
  };

  const removeDayData = (index: number) => {
    setDays((prev) => {
      const next = [...prev];
      const existing = next[index];
      next[index] = {
        ...existing,
        from: "",
        to: "",
        breakDeduction: "",
        lunch: showLunchColumn ? "" : undefined,
        breaks: Array.from({ length: breakColumns }, () => "")
      };
      return next;
    });
  };

  const copyFirstRowDown = () => {
    if (mode === "hours") return;

    setDays((prev) => {
      if (prev.length <= 1) return prev;
      const firstRow = prev[0];
      return prev.map((day, index) =>
        index === 0
          ? day
          : {
              ...day,
              from: firstRow.from,
              to: firstRow.to,
              breakDeduction: firstRow.breakDeduction,
              lunch: showLunchColumn ? firstRow.lunch : undefined,
              breaks: [...firstRow.breaks]
            }
      );
    });
  };

  const clearAll = () => {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        from: "",
        to: "",
        breakDeduction: "",
        lunch: showLunchColumn ? "" : undefined,
        breaks: Array.from({ length: breakColumns }, () => "")
      }))
    );
    setReportHeader("");
    setReportNotes("");
  };

  const addLunchColumn = () => {
    setShowLunchColumn(true);
    setDays((prev) => prev.map((day) => ({ ...day, lunch: day.lunch ?? breakDefault })));
  };

  const removeLunchColumn = () => {
    setShowLunchColumn(false);
    setDays((prev) => prev.map((day) => ({ ...day, lunch: undefined })));
  };

  const addBreakColumn = () => {
    if (breakColumns >= 3) return;

    const nextColumns = breakColumns + 1;
    setBreakColumns(nextColumns);
    setDays((prev) => prev.map((day) => ({ ...day, breaks: [...day.breaks, ""] })));
  };

  const removeBreakColumn = (index: number) => {
    if (breakColumns <= 1) return;

    const nextColumns = breakColumns - 1;
    setBreakColumns(nextColumns);
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        breaks: day.breaks.filter((_, i) => i !== index)
      }))
    );
  };

  const printReport = () => {
    if (typeof window === "undefined") return;

    const reportTitle = t.printReportTitles[copyVariant] ?? t.printReportTitles["time-card"];
    const totalColumns = 4 + (showLunchColumn ? 1 : 0) + Math.max(0, breakColumns - 1);

    const rowsHtml = days
      .map((day, index) => {
        const dayTotal = totals.dayTotals[index];
        const extraCells = Array.from({ length: breakColumns - 1 }, (_, i) => `<td>${day.breaks[i + 1] || "-"}</td>`).join("");
        return `<tr>
          <td>${day.date}</td>
          <td>${day.from || "-"}</td>
          <td>${day.to || "-"}</td>
          <td>${day.breakDeduction || "-"}</td>
          ${showLunchColumn ? `<td>${day.lunch || "-"}</td>` : ""}
          ${extraCells}
          <td>${dayTotal > 0 ? minutesToHours(dayTotal) : "-"}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { margin-bottom: 6px; }
          .sub { margin-bottom: 16px; color: #444; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f4f6f8; }
          .total { margin-top: 16px; font-weight: 700; }
          .notes { margin-top: 16px; border: 1px solid #ddd; padding: 10px; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="sub">${t.generatedOn} ${new Date().toLocaleDateString()}</div>
        ${reportHeader ? `<div><strong>${t.header}:</strong> ${reportHeader}</div>` : ""}
        <table>
          <thead>
            <tr>
              <th>${mergedLabels.day}</th>
              <th>${mergedLabels.start}</th>
              <th>${mergedLabels.end}</th>
              <th>${mergedLabels.break}</th>
              ${showLunchColumn ? `<th>${mergedLabels.lunch}</th>` : ""}
              ${Array.from({ length: breakColumns - 1 }, (_, i) => `<th>${mergedLabels.break} ${i + 2}</th>`).join("")}
              <th>${t.total}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="total">${t.totalHours}: ${totals.totalHours.toFixed(2)} (${minutesToHours(totals.totalMinutes)})</div>
        <div class="total">${t.totalBreakTime}: ${minutesToHours(totals.breakMinutes)}</div>
        ${showOvertime ? `<div class="total">${t.overtime}: ${minutesToHours(totals.totalOvertimeMinutes)}</div>` : ""}
        ${includePayment ? `<div class="total">${t.totalPay}: ${currency}${totalPay.toFixed(2)}</div>` : ""}
        ${reportNotes ? `<div class="notes"><strong>${t.notes}:</strong><br/>${reportNotes.replace(/\n/g, "<br/>")}</div>` : ""}
      </body>
      </html>
    `;

    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);

    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    frame.onload = () => {
      frame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(frame)) {
          document.body.removeChild(frame);
        }
      }, 1200);
    };
  };

  const timePlaceholder =
    timeFormat === "24h" || timeFormat === "military"
      ? "08:00"
      : timeFormat === "12h"
      ? "8:00AM"
      : "8:00AM or 08:00";

  return (
    <div className="w-full mx-auto py-2 xl:py-6" id="calculator">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={clearAll} size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                {t.clearAll}
              </Button>

              {showPrintableTimesheet && (
                <Button variant="outline" onClick={printReport} size="sm">
                  <Printer className="h-4 w-4 mr-1" />
                  {t.print}
                </Button>
              )}

              {mode !== "hours" && (
                <Button variant="outline" onClick={copyFirstRowDown} size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  {t.copyFirstRow}
                </Button>
              )}

              {!showLunchColumn && (
                <Button variant="outline" onClick={addLunchColumn} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.withLunch}
                </Button>
              )}

              {mode !== "hours" && (
                <Button variant="outline" onClick={addBreakColumn} size="sm" disabled={breakColumns >= 3}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t.withBreak}
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-1" />
                    {t.payment} ({currency}{basePay}{hourlyRateUnitLabel ?? t.hourlyRateUnitLabel})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includePayment"
                        checked={includePayment}
                        onCheckedChange={(checked) => setIncludePayment(checked === true)}
                      />
                      <Label htmlFor="includePayment" className="text-blue-600 font-semibold">
                        {t.includePaymentInformation}
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="basePay">{t.hourlyPayRate}</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-12 h-8 text-center rounded-r-none"
                          placeholder="$"
                        />
                        <Input
                          id="basePay"
                          value={basePay}
                          onChange={(e) => setBasePay(e.target.value)}
                          className="rounded-l-none h-8"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {mode === "time-card" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {t.settings}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="biweekly"
                          checked={isBiweekly}
                          onCheckedChange={(checked) => setIsBiweekly(checked === true)}
                        />
                        <Label htmlFor="biweekly" className="text-blue-600 font-semibold">
                          {t.biweeklyToggle}
                        </Label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {showPrintableTimesheet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={reportHeader}
                  onChange={(e) => setReportHeader(e.target.value)}
                  placeholder={t.reportHeaderPlaceholder}
                />
                <Input
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[110px]">{mergedLabels.day}</th>
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[120px]">{mergedLabels.start}</th>
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[120px]">{mergedLabels.end}</th>

                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <span>{mergedLabels.break}</span>
                      {breakColumns > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreakColumn(0)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title={t.removeColumnTitle}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </th>

                  {showLunchColumn && (
                    <th className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <span>{mergedLabels.lunch}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeLunchColumn}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title={t.removeColumnTitle}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  )}

                  {Array.from({ length: breakColumns - 1 }, (_, i) => (
                    <th key={`break-${i + 1}`} className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <span>{mergedLabels.break} {i + 2}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreakColumn(i + 1)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title={t.removeColumnTitle}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}

                  <th className="border border-gray-300 p-1 text-center font-semibold min-w-[90px]">{t.dailyTotal}</th>
                  <th className="border border-gray-300 p-1 text-center font-semibold min-w-[70px]">{t.action}</th>
                </tr>
              </thead>

              <tbody>
                {days.map((day, index) => (
                  <tr key={`${day.date}-${index}`} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-1">
                      <Input value={day.date} onChange={(e) => updateDay(index, "date", e.target.value)} className="w-full h-9" />
                    </td>

                    <td className="border border-gray-300 p-1">
                      <Input
                        value={day.from}
                        onChange={(e) => updateDay(index, "from", e.target.value)}
                        placeholder={timePlaceholder}
                        className="w-full h-9"
                      />
                    </td>

                    <td className="border border-gray-300 p-1">
                      <Input
                        value={day.to}
                        onChange={(e) => updateDay(index, "to", e.target.value)}
                        placeholder={timePlaceholder}
                        className="w-full h-9"
                      />
                    </td>

                    <td className="border border-gray-300 p-1">
                      <Input
                        value={day.breakDeduction}
                        onChange={(e) => updateDay(index, "breakDeduction", e.target.value)}
                        placeholder={breakDefault}
                        className="w-full h-9"
                      />
                    </td>

                    {showLunchColumn && (
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={day.lunch || ""}
                          onChange={(e) => updateDayLunch(index, e.target.value)}
                          placeholder={breakDefault}
                          className="w-full h-9"
                        />
                      </td>
                    )}

                    {Array.from({ length: breakColumns - 1 }, (_, i) => (
                      <td key={`break-${index}-${i + 1}`} className="border border-gray-300 p-1">
                        <Input
                          value={day.breaks[i + 1] || ""}
                          onChange={(e) => updateDayBreak(index, i + 1, e.target.value)}
                          placeholder="0:15"
                          className="w-full h-9"
                        />
                      </td>
                    ))}

                    <td className="border border-gray-300 text-center font-mono text-blue-700 font-semibold">
                      {totals.dayTotals[index] > 0 ? `${(totals.dayTotals[index] / 60).toFixed(2)}h / ${minutesToHours(totals.dayTotals[index])}` : "-"}
                    </td>

                    <td className="border border-gray-300 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDayData(index)}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        title={t.clearRowTitle}
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}

                <tr className="bg-gradient-to-r from-blue-100 to-green-100 font-semibold">
                  <td className="border border-gray-300 p-2 text-right" colSpan={4 + (showLunchColumn ? 1 : 0) + (breakColumns - 1)}>
                    {t.totalPaidHours}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-mono text-green-700">
                    {totals.totalHours.toFixed(2)}h / {minutesToHours(totals.totalMinutes)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-green-700 font-semibold">
                    {includePayment ? `${currency}${totalPay.toFixed(2)}` : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">{t.totalBreakTime}</p>
              <p className="text-lg font-semibold text-gray-900">{minutesToHours(totals.breakMinutes)}</p>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">{t.averageDailyPaidTime}</p>
              <p className="text-lg font-semibold text-gray-900">{minutesToHours(totals.averageDayMinutes)}</p>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">{t.weeklyTotals}</p>
              <p className="text-lg font-semibold text-gray-900">
                {totals.weeklyMinuteTotals.map((value) => minutesToHours(value)).join(" / ")}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">{t.overtimeSummary}</p>
              <p className="text-lg font-semibold text-gray-900">
                {showOvertime ? `${minutesToHours(totals.totalOvertimeMinutes)} (${(totals.totalOvertimeMinutes / 60).toFixed(2)}h)` : t.hidden}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
