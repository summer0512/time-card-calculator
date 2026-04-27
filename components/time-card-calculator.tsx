"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Copy, RotateCcw, CreditCard, Printer, Plus, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DayEntry {
  date: string;
  from: string;
  to: string;
  breakDeduction: string;
  lunch?: string;
  breaks: string[];
}

interface CalculatorLabels {
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
}

const DEFAULT_LABELS: CalculatorLabels = {
  start: "From",
  end: "To",
  break: "Break",
  lunch: "Lunch",
  day: "Date"
};

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

const getFirstDay = (timeFormat: TimeCardCalculatorProps["timeFormat"], breakDefault: string, includeLunch: boolean): DayEntry => {
  if (timeFormat === "24h" || timeFormat === "military") {
    return {
      date: "Monday",
      from: "08:00",
      to: "17:00",
      breakDeduction: breakDefault,
      lunch: includeLunch ? breakDefault : undefined,
      breaks: [breakDefault]
    };
  }

  return {
    date: "Monday",
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
  timeFormat: TimeCardCalculatorProps["timeFormat"]
): DayEntry[] => {
  if (mode === "hours") {
    const first = getFirstDay(timeFormat, breakDefault, includeLunch);
    return [{ ...first, date: "Shift" }];
  }

  if (biweekly) {
    const days: DayEntry[] = [];
    for (let week = 1; week <= 2; week += 1) {
      WEEK_DAYS.forEach((day, index) => {
        const first = getFirstDay(timeFormat, breakDefault, includeLunch);
        days.push({
          date: `Week ${week} - ${day}`,
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

  const first = getFirstDay(timeFormat, breakDefault, includeLunch);
  return WEEK_DAYS.map((day, index) => ({
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
  labels = DEFAULT_LABELS
}: TimeCardCalculatorProps) {
  const breakDefault = toBreakString(defaultBreakMinutes);
  const initialBreakColumns = showMultipleBreaks ? 2 : 1;

  const [showLunchColumn, setShowLunchColumn] = useState(showLunchBreak);
  const [breakColumns, setBreakColumns] = useState(initialBreakColumns);
  const [isBiweekly, setIsBiweekly] = useState(mode === "time-card" && showBiweekly);

  const [reportHeader, setReportHeader] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [includePayment, setIncludePayment] = useState(true);
  const [basePay, setBasePay] = useState("35");
  const [currency, setCurrency] = useState("$");

  const [days, setDays] = useState<DayEntry[]>(
    createDays(mode, mode === "time-card" && showBiweekly, initialBreakColumns, showLunchBreak, breakDefault, timeFormat)
  );

  useEffect(() => {
    setShowLunchColumn(showLunchBreak);
    setBreakColumns(initialBreakColumns);
    setIsBiweekly(mode === "time-card" && showBiweekly);
    setDays(createDays(mode, mode === "time-card" && showBiweekly, initialBreakColumns, showLunchBreak, breakDefault, timeFormat));
  }, [mode, showLunchBreak, showBiweekly, showMultipleBreaks, defaultBreakMinutes, timeFormat]);

  useEffect(() => {
    setDays(createDays(mode, isBiweekly, breakColumns, showLunchColumn, breakDefault, timeFormat));
  }, [isBiweekly]);

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

    const titleByVariant: Record<string, string> = {
      "time-card": "Time Card Report",
      timesheet: "Timesheet Report",
      "time-clock": "Time Clock Report",
      punch: "Time Punch Report"
    };

    const reportTitle = titleByVariant[copyVariant] ?? "Time Card Report";
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
        <div class="sub">Generated on ${new Date().toLocaleDateString()}</div>
        ${reportHeader ? `<div><strong>Header:</strong> ${reportHeader}</div>` : ""}
        <table>
          <thead>
            <tr>
              <th>${labels.day}</th>
              <th>${labels.start}</th>
              <th>${labels.end}</th>
              <th>${labels.break}</th>
              ${showLunchColumn ? `<th>${labels.lunch}</th>` : ""}
              ${Array.from({ length: breakColumns - 1 }, (_, i) => `<th>${labels.break} ${i + 2}</th>`).join("")}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="total">Total Hours: ${totals.totalHours.toFixed(2)} (${minutesToHours(totals.totalMinutes)})</div>
        <div class="total">Total Break Time: ${minutesToHours(totals.breakMinutes)}</div>
        ${showOvertime ? `<div class="total">Overtime: ${minutesToHours(totals.totalOvertimeMinutes)}</div>` : ""}
        ${includePayment ? `<div class="total">Total Pay: ${currency}${totalPay.toFixed(2)}</div>` : ""}
        ${reportNotes ? `<div class="notes"><strong>Notes:</strong><br/>${reportNotes.replace(/\n/g, "<br/>")}</div>` : ""}
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
                Clear All
              </Button>

              {showPrintableTimesheet && (
                <Button variant="outline" onClick={printReport} size="sm">
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              )}

              {mode !== "hours" && (
                <Button variant="outline" onClick={copyFirstRowDown} size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy First Row
                </Button>
              )}

              {!showLunchColumn && (
                <Button variant="outline" onClick={addLunchColumn} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  With Lunch
                </Button>
              )}

              {mode !== "hours" && (
                <Button variant="outline" onClick={addBreakColumn} size="sm" disabled={breakColumns >= 3}>
                  <Plus className="h-4 w-4 mr-1" />
                  With Break
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Payment ({currency}{basePay}/hr)
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
                        Include payment information
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="basePay">Hourly Pay Rate</Label>
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
                      Settings
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
                          Biweekly (14 days)
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
                  placeholder="Report header (employee name / date range)"
                />
                <Input
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Notes or signature details"
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
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[110px]">{labels.day}</th>
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[120px]">{labels.start}</th>
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[120px]">{labels.end}</th>

                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <span>{labels.break}</span>
                      {breakColumns > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreakColumn(0)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </th>

                  {showLunchColumn && (
                    <th className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <span>{labels.lunch}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeLunchColumn}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  )}

                  {Array.from({ length: breakColumns - 1 }, (_, i) => (
                    <th key={`break-${i + 1}`} className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <span>{labels.break} {i + 2}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreakColumn(i + 1)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}

                  <th className="border border-gray-300 p-1 text-center font-semibold min-w-[90px]">Daily Total</th>
                  <th className="border border-gray-300 p-1 text-center font-semibold min-w-[70px]">Action</th>
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
                        title="Clear row"
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}

                <tr className="bg-gradient-to-r from-blue-100 to-green-100 font-semibold">
                  <td className="border border-gray-300 p-2 text-right" colSpan={4 + (showLunchColumn ? 1 : 0) + (breakColumns - 1)}>
                    Total Paid Hours
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
              <p className="text-xs text-gray-500">Total Break Time</p>
              <p className="text-lg font-semibold text-gray-900">{minutesToHours(totals.breakMinutes)}</p>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">Average Daily Paid Time</p>
              <p className="text-lg font-semibold text-gray-900">{minutesToHours(totals.averageDayMinutes)}</p>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">Weekly Total(s)</p>
              <p className="text-lg font-semibold text-gray-900">
                {totals.weeklyMinuteTotals.map((value) => minutesToHours(value)).join(" / ")}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-xs text-gray-500">Overtime Summary</p>
              <p className="text-lg font-semibold text-gray-900">
                {showOvertime ? `${minutesToHours(totals.totalOvertimeMinutes)} (${(totals.totalOvertimeMinutes / 60).toFixed(2)}h)` : "Hidden"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
