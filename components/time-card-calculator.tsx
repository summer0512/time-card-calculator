"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Trash2, Copy, RotateCcw, CreditCard, Printer, Plus, Eraser, ChevronDown, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentBreakdown from "@/components/payment/payment-breakdown";
import PaymentSettings, { type EditableOvertimeTier } from "@/components/payment/payment-settings";
import {
  calculatePayment,
  formatPaymentAmount,
  formatPaymentHoursFromMinutes,
  parseLocalizedDecimal,
  validatePaymentConfig,
  type OvertimeBasis,
  type OvertimeTier,
  type PaymentConfig,
  type PaymentValidationCode,
  type WorkPeriod,
} from "@/lib/payment";
import { useLocale, useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import type { SavedTimeCard } from "@/lib/time-cards/types";
import {
  calculateClockSpanMinutes,
  formatDecimalHoursFromMinutes,
  formatDurationMinutes,
  normalizeTimeTo24Hour,
  parseDurationToMinutes,
} from "@/lib/time-cards/time";

interface DayEntry {
  date: string;
  from: string;
  to: string;
  breakDeduction: string;
  lunch?: string;
  breaks: string[];
}

type SavedCardLoadState = "idle" | "loading" | "loaded" | "error";

export interface CalculatorLabels {
  start: string;
  end: string;
  break: string;
  lunch: string;
  day: string;
}

export interface PaymentDefaults {
  enabled?: boolean;
  currency?: string;
  hourlyRate?: string | number;
  overtime?: {
    enabled?: boolean;
    basis?: OvertimeBasis;
    tiers?: OvertimeTier[];
  };
}

interface TimeCardCalculatorProps {
  calculatorType?: string;
  mode?: "time-card" | "hours" | "split-shift";
  defaultBreakMinutes?: number;
  showLunchBreak?: boolean;
  showMultipleBreaks?: boolean;
  showBreakDeduction?: boolean;
  showBiweekly?: boolean;
  showOvertime?: boolean;
  showPrintableTimesheet?: boolean;
  timeFormat?: "auto" | "12h" | "24h" | "military";
  copyVariant?: "time-card" | "timesheet" | "time-clock" | "punch";
  labels?: CalculatorLabels;
  defaultCurrency?: string;
  defaultHourlyRate?: string;
  hourlyRateUnitLabel?: string;
  paymentDefaults?: PaymentDefaults;
  paymentPresentation?: "popover" | "prominent";
  paymentSettingsDefaultOpen?: boolean;
  uiText?: Partial<CalculatorUiText>;
}

export interface CalculatorUiText {
  saveTimeCard: string;
  saveChanges: string;
  saveTooltip: string;
  saveTitlePrompt: string;
  saveDialogDescription: string;
  saveTitleLabel: string;
  saveTitlePlaceholder: string;
  defaultWeeklyTimeCardTitle: string;
  defaultBiweeklyTimeCardTitle: string;
  cancel: string;
  saved: string;
  saveError: string;
  saving: string;
  loadingSavedTimeCard: string;
  editingSavedTimeCard: string;
  newTimeCard: string;
  loadTimeCardError: string;
  retry: string;
  weekDays: string[];
  shiftLabel: string;
  weekLabel: string;
  clearAll: string;
  print: string;
  copyFirstRow: string;
  withLunch: string;
  withBreak: string;
  addWorkSegment: string;
  payment: string;
  includePaymentInformation: string;
  hourlyPayRate: string;
  currency: string;
  calculationBasis: string;
  weekly: string;
  daily: string;
  overtimeTiers: string;
  tier: string;
  after: string;
  hours: string;
  rateType: string;
  multiplier: string;
  fixedHourlyRate: string;
  addOvertimeTier: string;
  removeOvertimeTier: string;
  paymentBreakdown: string;
  regularHours: string;
  overtimeHours: string;
  regularPay: string;
  overtimeTier: string;
  totalOvertimePay: string;
  estimatedTotalPay: string;
  paymentValidation: Record<PaymentValidationCode, string>;
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
  saveTimeCard: "Save Time Card",
  saveChanges: "Save Changes",
  saveTooltip: "Save this time card so you can open it and continue next time.",
  saveTitlePrompt: "Name this time card",
  saveDialogDescription: "Give this time card a name so you can easily find it later.",
  saveTitleLabel: "Time card name",
  saveTitlePlaceholder: "Weekly Time Card",
  defaultWeeklyTimeCardTitle: "Weekly Time Card",
  defaultBiweeklyTimeCardTitle: "Biweekly Time Card",
  cancel: "Cancel",
  saved: "Saved",
  saveError: "We couldn't save your time card. Please try again.",
  saving: "Saving…",
  loadingSavedTimeCard: "Loading your time card…",
  editingSavedTimeCard: "Editing saved time card",
  newTimeCard: "New Time Card",
  loadTimeCardError: "We couldn't load this time card. Please try again.",
  retry: "Try again",
  weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  shiftLabel: "Shift",
  weekLabel: "Week",
  clearAll: "Clear All",
  print: "Print",
  copyFirstRow: "Copy First Row",
  withLunch: "With Lunch",
  withBreak: "With Break",
  addWorkSegment: "Add work segment",
  payment: "Payment",
  includePaymentInformation: "Include payment information",
  hourlyPayRate: "Hourly Pay Rate",
  currency: "Currency",
  calculationBasis: "Calculation basis",
  weekly: "Weekly",
  daily: "Daily",
  overtimeTiers: "Overtime tiers",
  tier: "Tier",
  after: "After",
  hours: "hours",
  rateType: "Rate type",
  multiplier: "Multiplier",
  fixedHourlyRate: "Hourly rate",
  addOvertimeTier: "Add overtime tier",
  removeOvertimeTier: "Remove overtime tier",
  paymentBreakdown: "Payment breakdown",
  regularHours: "Regular Hours",
  overtimeHours: "Overtime Hours",
  regularPay: "Regular Pay",
  overtimeTier: "Overtime Tier",
  totalOvertimePay: "Total Overtime Pay",
  estimatedTotalPay: "Estimated Total Pay",
  paymentValidation: {
    HOURLY_RATE_REQUIRED: "Enter an hourly rate.",
    INVALID_HOURLY_RATE: "Enter a valid non-negative hourly rate.",
    OVERTIME_TIERS_REQUIRED: "Add at least one overtime tier.",
    TIER_ID_REQUIRED: "This overtime tier is incomplete.",
    DUPLICATE_TIER_ID: "Each overtime tier must be unique.",
    INVALID_THRESHOLD: "Enter a threshold of zero or more.",
    DUPLICATE_THRESHOLD: "Each threshold must be unique.",
    INVALID_MULTIPLIER: "Enter a multiplier greater than zero.",
    INVALID_FIXED_RATE: "Enter a fixed rate of zero or more.",
  },
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

const toBreakString = (minutes: number) => formatDurationMinutes(minutes);
const minutesToHours = (minutes: number) => formatDurationMinutes(minutes);

const normalizeCurrencyCode = (currency: string): string => {
  const currencyMap: Record<string, string> = {
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "R$": "BRL",
  };
  return currencyMap[currency] ?? currency.toUpperCase();
};

const toEditableTiers = (tiers?: OvertimeTier[]): EditableOvertimeTier[] =>
  (tiers?.length ? tiers : [{
    id: "tier-1",
    afterHours: 40,
    rateType: "multiplier" as const,
    rateValue: 1.5,
  }]).map((tier) => ({
    ...tier,
    afterHours: String(tier.afterHours),
    rateValue: String(tier.rateValue),
  }));

const calculateDayTotal = (day: DayEntry, showLunch: boolean, breakColumns: number): number => {
  const totalMinutes = calculateClockSpanMinutes(day.from, day.to);
  if (totalMinutes === null) return 0;

  const baseBreak = breakColumns > 0 ? (parseDurationToMinutes(day.breakDeduction) ?? 0) : 0;
  const lunchMinutes = showLunch ? (parseDurationToMinutes(day.lunch ?? "") ?? 0) : 0;
  const extraBreakMinutes = day.breaks
    .slice(1, breakColumns)
    .reduce((sum, value) => sum + (parseDurationToMinutes(value) ?? 0), 0);

  return Math.max(0, totalMinutes - baseBreak - lunchMinutes - extraBreakMinutes);
};

const calculateRawShiftMinutes = (day: DayEntry): number =>
  calculateClockSpanMinutes(day.from, day.to) ?? 0;

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
  mode: "time-card" | "hours" | "split-shift",
  biweekly: boolean,
  breakColumns: number,
  includeLunch: boolean,
  breakDefault: string,
  timeFormat: TimeCardCalculatorProps["timeFormat"],
  weekDays: string[],
  weekLabel: string,
  shiftLabel: string
): DayEntry[] => {
  if (mode === "split-shift") {
    return [
      { date: `${shiftLabel} 1`, from: "09:00", to: "14:00", breakDeduction: "", breaks: [] },
      { date: `${shiftLabel} 2`, from: "16:00", to: "19:00", breakDeduction: "", breaks: [] },
    ];
  }

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
  calculatorType = "time-card-calculator",
  mode = "time-card",
  defaultBreakMinutes = 30,
  showLunchBreak = false,
  showMultipleBreaks = false,
  showBreakDeduction = true,
  showBiweekly = false,
  showOvertime = true,
  showPrintableTimesheet = true,
  timeFormat = "auto",
  copyVariant = "time-card",
  labels = DEFAULT_LABELS,
  defaultCurrency,
  defaultHourlyRate,
  hourlyRateUnitLabel,
  paymentDefaults,
  paymentPresentation = "popover",
  paymentSettingsDefaultOpen = false,
  uiText,
}: TimeCardCalculatorProps) {
  const tCalculator = useTranslations("Calculator");
  const locale = useLocale();
  const localizedUiText: Partial<CalculatorUiText> = {
    saveTimeCard: tCalculator("saveTimeCard"),
    saveChanges: tCalculator("saveChanges"),
    saveTooltip: tCalculator("saveTooltip"),
    saveTitlePrompt: tCalculator("saveTitlePrompt"),
    saveDialogDescription: tCalculator("saveDialogDescription"),
    saveTitleLabel: tCalculator("saveTitleLabel"),
    saveTitlePlaceholder: tCalculator("saveTitlePlaceholder"),
    defaultWeeklyTimeCardTitle: tCalculator("defaultWeeklyTimeCardTitle"),
    defaultBiweeklyTimeCardTitle: tCalculator("defaultBiweeklyTimeCardTitle"),
    cancel: tCalculator("cancel"),
    saved: tCalculator("saved"),
    saveError: tCalculator("saveError"),
    saving: tCalculator("saving"),
    loadingSavedTimeCard: tCalculator("loadingSavedTimeCard"),
    editingSavedTimeCard: tCalculator("editingSavedTimeCard"),
    newTimeCard: tCalculator("newTimeCard"),
    loadTimeCardError: tCalculator("loadTimeCardError"),
    retry: tCalculator("retry"),
    weekDays: (tCalculator.raw("weekDays") as string[]) || DEFAULT_UI_TEXT.weekDays,
    shiftLabel: tCalculator("shiftLabel"),
    weekLabel: tCalculator("weekLabel"),
    clearAll: tCalculator("clearAll"),
    print: tCalculator("print"),
    copyFirstRow: tCalculator("copyFirstRow"),
    withLunch: tCalculator("withLunch"),
    withBreak: tCalculator("withBreak"),
    addWorkSegment: tCalculator("addWorkSegment"),
    payment: tCalculator("payment"),
    includePaymentInformation: tCalculator("includePaymentInformation"),
    hourlyPayRate: tCalculator("hourlyPayRate"),
    currency: tCalculator("currency"),
    calculationBasis: tCalculator("calculationBasis"),
    weekly: tCalculator("weekly"),
    daily: tCalculator("daily"),
    overtimeTiers: tCalculator("overtimeTiers"),
    tier: tCalculator("tier"),
    after: tCalculator("after"),
    hours: tCalculator("hours"),
    rateType: tCalculator("rateType"),
    multiplier: tCalculator("multiplier"),
    fixedHourlyRate: tCalculator("fixedHourlyRate"),
    addOvertimeTier: tCalculator("addOvertimeTier"),
    removeOvertimeTier: tCalculator("removeOvertimeTier"),
    paymentBreakdown: tCalculator("paymentBreakdown"),
    regularHours: tCalculator("regularHours"),
    overtimeHours: tCalculator("overtimeHours"),
    regularPay: tCalculator("regularPay"),
    overtimeTier: tCalculator("overtimeTier"),
    totalOvertimePay: tCalculator("totalOvertimePay"),
    estimatedTotalPay: tCalculator("estimatedTotalPay"),
    paymentValidation: {
      HOURLY_RATE_REQUIRED: tCalculator("paymentValidation.HOURLY_RATE_REQUIRED"),
      INVALID_HOURLY_RATE: tCalculator("paymentValidation.INVALID_HOURLY_RATE"),
      OVERTIME_TIERS_REQUIRED: tCalculator("paymentValidation.OVERTIME_TIERS_REQUIRED"),
      TIER_ID_REQUIRED: tCalculator("paymentValidation.TIER_ID_REQUIRED"),
      DUPLICATE_TIER_ID: tCalculator("paymentValidation.DUPLICATE_TIER_ID"),
      INVALID_THRESHOLD: tCalculator("paymentValidation.INVALID_THRESHOLD"),
      DUPLICATE_THRESHOLD: tCalculator("paymentValidation.DUPLICATE_THRESHOLD"),
      INVALID_MULTIPLIER: tCalculator("paymentValidation.INVALID_MULTIPLIER"),
      INVALID_FIXED_RATE: tCalculator("paymentValidation.INVALID_FIXED_RATE"),
    },
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
  const configuredHourlyRate = String(paymentDefaults?.hourlyRate ?? defaultHourlyRate ?? t.defaultHourlyRate);
  const configuredCurrency = normalizeCurrencyCode(paymentDefaults?.currency ?? defaultCurrency ?? t.defaultCurrency);
  const [includePayment, setIncludePayment] = useState(paymentDefaults?.enabled ?? true);
  const [basePay, setBasePay] = useState(configuredHourlyRate);
  const [currency, setCurrency] = useState(configuredCurrency);
  const [overtimeEnabled, setOvertimeEnabled] = useState(paymentDefaults?.overtime?.enabled ?? false);
  const [overtimeBasis, setOvertimeBasis] = useState<OvertimeBasis>(paymentDefaults?.overtime?.basis ?? "weekly");
  const [overtimeTiers, setOvertimeTiers] = useState<EditableOvertimeTier[]>(
    toEditableTiers(paymentDefaults?.overtime?.tiers),
  );

  const [days, setDays] = useState<DayEntry[]>(
    createDays(mode, mode === "time-card" && showBiweekly, initialBreakColumns, showLunchBreak, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel)
  );
  const { data: sessionData } = authClient.useSession();
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [resumeReady, setResumeReady] = useState(false);
  const [routeCardId, setRouteCardId] = useState<string | null>(null);
  const [savedCardLoadState, setSavedCardLoadState] = useState<SavedCardLoadState>("idle");
  const [savedCardReloadKey, setSavedCardReloadKey] = useState(0);
  const isRestoring = useRef(false);
  const skipNextCardLoadRef = useRef<string | null>(null);

  useEffect(() => {
    setShowLunchColumn(showLunchBreak);
    setBreakColumns(initialBreakColumns);
    setIsBiweekly(mode === "time-card" && showBiweekly);
    setDays(createDays(mode, mode === "time-card" && showBiweekly, initialBreakColumns, showLunchBreak, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel));
  }, [mode, showLunchBreak, showBiweekly, showMultipleBreaks, defaultBreakMinutes, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel]);

  useEffect(() => {
    setBasePay(configuredHourlyRate);
    setCurrency(configuredCurrency);
  }, [configuredHourlyRate, configuredCurrency]);

  useEffect(() => {
    if (isRestoring.current) { isRestoring.current = false; return; }
    setDays(createDays(mode, isBiweekly, breakColumns, showLunchColumn, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel));
  }, [isBiweekly, mode, breakColumns, showLunchColumn, breakDefault, timeFormat, t.weekDays, t.weekLabel, t.shiftLabel]);

  const totals = useMemo(() => {
    const dayTotals = days.map((day) => calculateDayTotal(
      day,
      showLunchColumn,
      showBreakDeduction ? breakColumns : 0,
    ));
    const rawMinutes = days.map((day) => calculateRawShiftMinutes(day));
    const totalMinutes = dayTotals.reduce((sum, value) => sum + value, 0);
    const totalRawMinutes = rawMinutes.reduce((sum, value) => sum + value, 0);
    const breakMinutes = Math.max(0, totalRawMinutes - totalMinutes);
    const workedDays = mode === "split-shift"
      ? (totalMinutes > 0 ? 1 : 0)
      : dayTotals.filter((value) => value > 0).length;

    const weeklyMinuteTotals: number[] = [];
    if (mode === "hours" || mode === "split-shift") {
      weeklyMinuteTotals.push(totalMinutes);
    } else {
      for (let i = 0; i < dayTotals.length; i += 7) {
        weeklyMinuteTotals.push(dayTotals.slice(i, i + 7).reduce((sum, value) => sum + value, 0));
      }
    }

    return {
      dayTotals,
      totalMinutes,
      totalRawMinutes,
      breakMinutes,
      workedDays,
      averageDayMinutes: workedDays > 0 ? Math.round(totalMinutes / workedDays) : 0,
      weeklyMinuteTotals
    };
  }, [days, breakColumns, showBreakDeduction, showLunchColumn, mode]);

  const workPeriods = useMemo<WorkPeriod[]>(() => totals.dayTotals.map((workedMinutes, index) => ({
    dayId: mode === "split-shift" ? "split-day" : String(index % 7),
    weekId: mode === "hours" ? "shift" : mode === "split-shift" ? "week-1" : String(Math.floor(index / 7)),
    workedMinutes,
  })), [mode, totals.dayTotals]);
  const paymentConfig = useMemo<PaymentConfig>(() => ({
    enabled: includePayment,
    currency,
    hourlyRate: parseLocalizedDecimal(basePay),
    overtime: {
      enabled: includePayment && showOvertime && overtimeEnabled,
      basis: overtimeBasis,
      tiers: overtimeTiers.map((tier) => ({
        id: tier.id,
        afterHours: parseLocalizedDecimal(tier.afterHours) ?? Number.NaN,
        rateType: tier.rateType,
        rateValue: parseLocalizedDecimal(tier.rateValue) ?? Number.NaN,
      })),
    },
  }), [basePay, currency, includePayment, overtimeBasis, overtimeEnabled, overtimeTiers, showOvertime]);
  const paymentValidationErrors = useMemo(
    () => validatePaymentConfig(paymentConfig),
    [paymentConfig],
  );
  const paymentResult = useMemo(() => {
    if (paymentValidationErrors.length === 0) {
      return calculatePayment(paymentConfig, workPeriods);
    }

    return calculatePayment({
      ...paymentConfig,
      hourlyRate: 0,
      overtime: { ...paymentConfig.overtime, enabled: false, tiers: [] },
    }, workPeriods);
  }, [paymentConfig, paymentValidationErrors.length, workPeriods]);
  const totalPay = paymentResult.totalPay;
  const formatAmount = (amount: number) => formatPaymentAmount(amount, currency, locale);
  const formatPaymentMinutes = (minutes: number) => formatPaymentHoursFromMinutes(minutes, locale);
  const paymentSettings = (
    <PaymentSettings
      enabled={includePayment}
      onEnabledChange={setIncludePayment}
      hourlyRate={basePay}
      onHourlyRateChange={setBasePay}
      currency={currency}
      onCurrencyChange={setCurrency}
      overtimeAvailable={showOvertime}
      overtimeEnabled={overtimeEnabled}
      onOvertimeEnabledChange={setOvertimeEnabled}
      basis={overtimeBasis}
      onBasisChange={setOvertimeBasis}
      tiers={overtimeTiers}
      onTiersChange={setOvertimeTiers}
      errors={paymentValidationErrors}
      labels={{
        includePaymentInformation: t.includePaymentInformation,
        hourlyPayRate: t.hourlyPayRate,
        currency: t.currency,
        overtime: t.overtime,
        calculationBasis: t.calculationBasis,
        weekly: t.weekly,
        daily: t.daily,
        overtimeTiers: t.overtimeTiers,
        tier: t.tier,
        after: t.after,
        hours: t.hours,
        rateType: t.rateType,
        multiplier: t.multiplier,
        fixedHourlyRate: t.fixedHourlyRate,
        addOvertimeTier: t.addOvertimeTier,
        removeOvertimeTier: t.removeOvertimeTier,
        validationMessages: t.paymentValidation,
      }}
    />
  );

  const normalizeTime = (value: string) => normalizeTimeTo24Hour(value);
  const snapshot = () => ({ days, showLunchColumn, breakColumns, isBiweekly, reportHeader, reportNotes, includePayment, basePay, currency, overtimeEnabled, overtimeBasis, overtimeTiers });
  const restoreSnapshot = (state: ReturnType<typeof snapshot>) => {
    isRestoring.current = true;
    setDays(state.days); setShowLunchColumn(state.showLunchColumn); setBreakColumns(state.breakColumns); setIsBiweekly(state.isBiweekly);
    setReportHeader(state.reportHeader); setReportNotes(state.reportNotes); setIncludePayment(state.includePayment); setBasePay(state.basePay); setCurrency(state.currency);
    setOvertimeEnabled(state.overtimeEnabled); setOvertimeBasis(state.overtimeBasis); setOvertimeTiers(state.overtimeTiers);
  };
  const resetToNewCalculator = () => {
    isRestoring.current = true;
    setSavedCardId(null);
    setSavedTitle("");
    setSaveDialogOpen(false);
    setSaveTitle("");
    setSaveMessage("");
    setShowLunchColumn(showLunchBreak);
    setBreakColumns(initialBreakColumns);
    setIsBiweekly(mode === "time-card" && showBiweekly);
    setReportHeader("");
    setReportNotes("");
    setIncludePayment(paymentDefaults?.enabled ?? true);
    setBasePay(configuredHourlyRate);
    setCurrency(configuredCurrency);
    setOvertimeEnabled(paymentDefaults?.overtime?.enabled ?? false);
    setOvertimeBasis(paymentDefaults?.overtime?.basis ?? "weekly");
    setOvertimeTiers(toEditableTiers(paymentDefaults?.overtime?.tiers));
    setDays(createDays(
      mode,
      mode === "time-card" && showBiweekly,
      initialBreakColumns,
      showLunchBreak,
      breakDefault,
      timeFormat,
      t.weekDays,
      t.weekLabel,
      t.shiftLabel,
    ));
  };
  const setCardLocation = (cardId: string | null, historyMode: "push" | "replace" = "push") => {
    const params = new URLSearchParams(window.location.search);
    params.delete("resumeSave");
    if (cardId) params.set("card", cardId);
    else params.delete("card");
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (historyMode === "replace") window.history.replaceState({}, "", nextUrl);
    else window.history.pushState({}, "", nextUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const startNewTimeCard = () => {
    resetToNewCalculator();
    setSavedCardLoadState("idle");
    setCardLocation(null, "push");
  };
  const restoreSavedCard = (card: SavedTimeCard) => {
    const settings = card.settings;
    isRestoring.current = true;
    setSavedCardId(card.id);
    setSavedTitle(card.title);
    setReportHeader(card.reportHeader ?? "");
    setReportNotes(card.notes ?? "");
    setShowLunchColumn(settings.showLunchColumn);
    setBreakColumns(settings.breakColumnCount);
    setIsBiweekly(settings.isBiweekly);
    setIncludePayment(card.paymentEnabled);
    setCurrency(card.currency ?? configuredCurrency);
    setBasePay(card.hourlyRate ?? configuredHourlyRate);
    setOvertimeEnabled(settings.overtime.enabled);
    setOvertimeBasis(settings.overtime.basis);
    setOvertimeTiers(settings.overtime.tiers.map((tier: OvertimeTier) => ({
      ...tier,
      afterHours: String(tier.afterHours),
      rateValue: String(tier.rateValue),
    })));
    setDays(card.rows.map((row: {
      dayLabel: string;
      punches: Array<{ start: string; end: string }>;
      breaks: Array<{ kind: "break" | "lunch"; position: number; minutes: number }>;
    }) => {
      const asDuration = (minutes: number) => minutesToHours(minutes);
      const lunch = row.breaks.find((item) => item.kind === "lunch");
      const regular = row.breaks
        .filter((item) => item.kind === "break")
        .sort((a, b) => a.position - b.position);
      return {
        date: row.dayLabel,
        from: row.punches[0]?.start ?? "",
        to: row.punches[0]?.end ?? "",
        breakDeduction: regular[0] ? asDuration(regular[0].minutes) : "",
        lunch: settings.showLunchColumn ? (lunch ? asDuration(lunch.minutes) : "") : undefined,
        breaks: Array.from(
          { length: settings.breakColumnCount },
          (_, index) => index === 0
            ? (regular[0] ? asDuration(regular[0].minutes) : "")
            : (regular[index] ? asDuration(regular[index].minutes) : ""),
        ),
      };
    }));
  };
  const buildPayload = (title: string) => ({
    title, reportHeader, notes: reportNotes, calculatorType, sourcePath: window.location.pathname,
    periodType: mode === "split-shift" ? "split_shift" : mode === "hours" ? "single" : isBiweekly ? "biweekly" : "weekly",
    periodStart: null, periodEnd: null, paymentEnabled: includePayment, currency: includePayment ? normalizeCurrencyCode(currency) : null,
    hourlyRate: includePayment && paymentConfig.hourlyRate !== null && Number.isFinite(paymentConfig.hourlyRate)
      ? paymentConfig.hourlyRate
      : null,
    settings: {
      mode, timeFormat, showLunchColumn, breakColumnCount: breakColumns, showBreakDeduction, isBiweekly, copyVariant,
      overtime: {
        enabled: includePayment && showOvertime && overtimeEnabled,
        basis: overtimeBasis,
        tiers: paymentConfig.overtime.tiers,
      },
    },
    cachedTotalMinutes: totals.totalMinutes, cachedTotalPay: includePayment && paymentValidationErrors.length === 0 ? totalPay : null,
    rows: days.map((day, position) => ({ position, workDate: null, dayLabel: day.date, punches: [{ start: normalizeTime(day.from), end: normalizeTime(day.to) }],
      breaks: [
        ...(showBreakDeduction && day.breakDeduction ? [{ kind: "break" as const, position: 0, minutes: parseDurationToMinutes(day.breakDeduction) ?? 0 }] : []),
        ...(showLunchColumn && day.lunch ? [{ kind: "lunch" as const, position: 1, minutes: parseDurationToMinutes(day.lunch) ?? 0 }] : []),
        ...day.breaks.slice(1, breakColumns).flatMap((value, index) => value ? [{ kind: "break" as const, position: index + 2, minutes: parseDurationToMinutes(value) ?? 0 }] : []),
      ] })),
  });
  const persistCard = async (title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaveMessage("");
    setIsSaving(true);

    try {
      const isNewCard = !savedCardId;
      const response = await fetch(savedCardId ? `/api/time-cards/${savedCardId}` : "/api/time-cards", {
        method: savedCardId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(trimmedTitle)),
      });

      if (!response.ok) throw new Error("save failed");

      const result = await response.json();
      if (result.id) {
        setSavedCardId(result.id);
        setSavedCardLoadState("loaded");
        if (isNewCard) {
          skipNextCardLoadRef.current = result.id;
          setCardLocation(result.id, "replace");
        }
      }
      setSavedTitle(trimmedTitle);
      setSaveDialogOpen(false);
      setSaveMessage("✓");
    } catch {
      setSaveMessage(t.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const saveCard = async () => {
    setSaveMessage("");

    if (!sessionData?.user) {
      sessionStorage.setItem(
        "pending-time-card-save",
        JSON.stringify({ path: window.location.pathname, state: snapshot() }),
      );
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.pathname}?resumeSave=1`,
      });
      return;
    }

    if (savedCardId) {
      await persistCard(savedTitle);
      return;
    }

    setSaveTitle(
      reportHeader.trim() || (isBiweekly ? t.defaultBiweeklyTimeCardTitle : t.defaultWeeklyTimeCardTitle),
    );
    setSaveDialogOpen(true);
  };

  useEffect(() => {
    const syncCardIdFromLocation = () => {
      const nextCardId = new URLSearchParams(window.location.search).get("card");
      setSavedCardLoadState(nextCardId ? "loading" : "idle");
      setRouteCardId(nextCardId);
    };

    syncCardIdFromLocation();
    window.addEventListener("popstate", syncCardIdFromLocation);
    return () => window.removeEventListener("popstate", syncCardIdFromLocation);
  }, []);

  useEffect(() => {
    if (!routeCardId) {
      resetToNewCalculator();
      setSavedCardLoadState("idle");
      return;
    }

    if (skipNextCardLoadRef.current === routeCardId) {
      skipNextCardLoadRef.current = null;
      setSavedCardLoadState("loaded");
      return;
    }

    const controller = new AbortController();
    setSavedCardLoadState("loading");
    setSavedCardId(null);
    setSavedTitle("");
    setSaveMessage("");

    void fetch(`/api/time-cards/${encodeURIComponent(routeCardId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`load failed: ${response.status}`);
        return response.json();
      })
      .then(({ card }) => {
        if (controller.signal.aborted) return;
        restoreSavedCard(card);
        setSavedCardLoadState("loaded");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
        setSavedCardLoadState("error");
      });

    return () => controller.abort();
  // The reset/restore helpers intentionally capture the current calculator defaults.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeCardId, savedCardReloadKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resumeSave") === "1" && sessionData?.user) {
      const raw = sessionStorage.getItem("pending-time-card-save");
      if (raw) {
        const pending = JSON.parse(raw);
        restoreSnapshot(pending.state);
        sessionStorage.removeItem("pending-time-card-save");
        window.history.replaceState({}, "", pending.path);
        setResumeReady(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.user?.id]);
  useEffect(() => { if (resumeReady) { setResumeReady(false); void saveCard(); } }, [resumeReady]);

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

  const addWorkSegment = () => {
    setDays((previous) => [
      ...previous,
      {
        date: `${t.shiftLabel} ${previous.length + 1}`,
        from: "",
        to: "",
        breakDeduction: "",
        breaks: [],
      },
    ]);
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
    const rowsHtml = days
      .map((day, index) => {
        const dayTotal = totals.dayTotals[index];
        const extraCells = showBreakDeduction
          ? Array.from({ length: breakColumns - 1 }, (_, i) => `<td>${day.breaks[i + 1] || "-"}</td>`).join("")
          : "";
        return `<tr>
          <td>${day.date}</td>
          <td>${day.from || "-"}</td>
          <td>${day.to || "-"}</td>
          ${showBreakDeduction ? `<td>${day.breakDeduction || "-"}</td>` : ""}
          ${showLunchColumn ? `<td>${day.lunch || "-"}</td>` : ""}
          ${extraCells}
          <td>${dayTotal > 0 ? minutesToHours(dayTotal) : "-"}</td>
        </tr>`;
      })
      .join("");
    const paymentHtml = includePayment && paymentValidationErrors.length === 0
      ? `
        <div class="payment-breakdown">
          <h2>${t.paymentBreakdown}</h2>
          <div>${t.regularPay}: ${formatPaymentMinutes(paymentResult.regularMinutes)} × ${formatAmount(paymentResult.hourlyRate)}/h = ${formatAmount(paymentResult.regularPay)}</div>
          ${paymentResult.tiers.filter((tier) => tier.minutes > 0).map((tier, index) => `
            <div>${t.overtimeTier} ${index + 1}: ${formatPaymentMinutes(tier.minutes)} × ${formatAmount(tier.effectiveRate)}/h = ${formatAmount(tier.pay)}</div>
          `).join("")}
          ${paymentResult.overtimeMinutes > 0 ? `<div>${t.totalOvertimePay}: ${formatAmount(paymentResult.overtimePay)}</div>` : ""}
          <div class="total">${t.estimatedTotalPay}: ${formatAmount(paymentResult.totalPay)}</div>
        </div>
      `
      : "";

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
          .payment-breakdown { margin-top: 18px; border-top: 1px solid #ddd; padding-top: 12px; }
          .payment-breakdown h2 { font-size: 18px; margin: 0 0 8px; }
          .payment-breakdown div { margin-top: 6px; }
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
              ${showBreakDeduction ? `<th>${mergedLabels.break}</th>` : ""}
              ${showLunchColumn ? `<th>${mergedLabels.lunch}</th>` : ""}
              ${showBreakDeduction ? Array.from({ length: breakColumns - 1 }, (_, i) => `<th>${mergedLabels.break} ${i + 2}</th>`).join("") : ""}
              <th>${t.total}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="total">${t.totalHours}: ${formatDecimalHoursFromMinutes(totals.totalMinutes, locale)} (${minutesToHours(totals.totalMinutes)})</div>
        <div class="total">${t.totalBreakTime}: ${minutesToHours(totals.breakMinutes)}</div>
        ${showOvertime && overtimeEnabled ? `<div class="total">${t.overtime}: ${minutesToHours(paymentResult.overtimeMinutes)}</div>` : ""}
        ${paymentHtml}
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

  if (routeCardId && savedCardLoadState === "loading") {
    return (
      <div className="w-full mx-auto py-2 xl:py-6" id="calculator">
        <Card className="min-h-[520px] overflow-hidden shadow-lg">
          <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-green-50 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600" role="status" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>{t.loadingSavedTimeCard}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-full max-w-xl animate-pulse rounded-md bg-slate-100" />
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-5 gap-px bg-slate-200">
                {Array.from({ length: 25 }, (_, index) => (
                  <div key={index} className={`bg-white p-2 ${index < 5 ? "bg-slate-50" : ""}`}>
                    <div className={`animate-pulse rounded bg-slate-100 ${index < 5 ? "h-4" : "h-8"}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-lg border border-slate-100 bg-slate-50" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (routeCardId && savedCardLoadState === "error") {
    return (
      <div className="w-full mx-auto py-2 xl:py-6" id="calculator">
        <Card className="min-h-[360px] shadow-lg">
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">{t.loadTimeCardError}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={() => setSavedCardReloadKey((value) => value + 1)}>{t.retry}</Button>
              <Button variant="outline" onClick={startNewTimeCard}>
                <Plus className="mr-1 h-4 w-4" />
                {t.newTimeCard}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEditingSavedCard = savedCardLoadState === "loaded" && Boolean(savedCardId);

  return (
    <div className="w-full mx-auto py-2 xl:py-6" id="calculator">
      <Dialog
        open={saveDialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) setSaveDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.saveTitlePrompt}</DialogTitle>
            <DialogDescription>{t.saveDialogDescription}</DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void persistCard(saveTitle);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="time-card-title">{t.saveTitleLabel}</Label>
              <Input
                id="time-card-title"
                value={saveTitle}
                onChange={(event) => setSaveTitle(event.target.value)}
                placeholder={t.saveTitlePlaceholder}
                autoFocus
                maxLength={120}
              />
            </div>

            {saveMessage && saveMessage !== "✓" && (
              <p className="text-sm text-red-700" role="alert">
                {saveMessage}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                disabled={isSaving}
              >
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isSaving || !saveTitle.trim()}>
                <Save className="mr-1 h-4 w-4" />
                {isSaving ? t.saving : t.saveTimeCard}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg py-4">
          <div className="flex flex-col gap-4">
            {isEditingSavedCard && (
              <div className="flex flex-col gap-3 rounded-lg border border-blue-200/80 bg-white/80 px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {t.editingSavedTimeCard}
                    </span>
                  </div>
                  <p className="truncate text-base font-semibold text-slate-900" title={savedTitle}>
                    {savedTitle}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={startNewTimeCard} className="shrink-0 bg-white">
                  <Plus className="mr-1 h-4 w-4" />
                  {t.newTimeCard}
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveCard} size="sm" disabled={isSaving} title={t.saveTooltip} aria-label={`${savedCardId ? t.saveChanges : t.saveTimeCard}. ${t.saveTooltip}`}>
                <Save className="h-4 w-4 mr-1" />{isSaving ? t.saving : savedCardId ? t.saveChanges : t.saveTimeCard}
              </Button>
              {saveMessage === "✓" ? (
                <span className="flex self-center items-center gap-1 text-sm font-medium text-green-700" role="status">
                  <Check className="h-4 w-4" />
                  {t.saved}
                </span>
              ) : saveMessage ? (
                <span className="self-center text-sm text-red-700" role="alert">{saveMessage}</span>
              ) : null}
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

              {mode === "time-card" && (
                <Button variant="outline" onClick={copyFirstRowDown} size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  {t.copyFirstRow}
                </Button>
              )}

              {mode !== "split-shift" && !showLunchColumn && (
                <Button variant="outline" onClick={addLunchColumn} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.withLunch}
                </Button>
              )}

              {mode === "time-card" && showBreakDeduction && (
                <Button variant="outline" onClick={addBreakColumn} size="sm" disabled={breakColumns >= 3}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t.withBreak}
                </Button>
              )}

              {mode === "split-shift" && (
                <Button variant="outline" onClick={addWorkSegment} size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  {t.addWorkSegment}
                </Button>
              )}

              {paymentPresentation === "popover" && (
                <Popover defaultOpen={paymentSettingsDefaultOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="data-[state=open]:border-blue-400 data-[state=open]:bg-blue-100 data-[state=open]:text-blue-700 data-[state=open]:shadow-sm"
                    >
                      <CreditCard className="mr-1 h-4 w-4" />
                      {t.payment} ({currency} {basePay || "—"}{hourlyRateUnitLabel ?? t.hourlyRateUnitLabel})
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[80vh] w-[22rem] overflow-y-auto" align="end">
                    {paymentSettings}
                  </PopoverContent>
                </Popover>
              )}

              {mode === "time-card" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="data-[state=open]:border-blue-400 data-[state=open]:bg-blue-100 data-[state=open]:text-blue-700 data-[state=open]:shadow-sm"
                    >
                      {t.settings}
                      <ChevronDown className="ml-1 h-4 w-4" />
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

            {paymentPresentation === "prominent" && (
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-700" />
                  <h2 className="font-semibold text-gray-900">{t.payment}</h2>
                </div>
                {paymentSettings}
              </div>
            )}

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

                  {showBreakDeduction && <th className="border border-gray-300 p-1 text-left font-semibold min-w-[100px]">
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
                  </th>}

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

                  {showBreakDeduction && Array.from({ length: breakColumns - 1 }, (_, i) => (
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

                    {showBreakDeduction && <td className="border border-gray-300 p-1">
                      <Input
                        value={day.breakDeduction}
                        onChange={(e) => updateDay(index, "breakDeduction", e.target.value)}
                        placeholder={breakDefault}
                        className="w-full h-9"
                      />
                    </td>}

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

                    {showBreakDeduction && Array.from({ length: breakColumns - 1 }, (_, i) => (
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
                      {totals.dayTotals[index] > 0 ? `${formatDecimalHoursFromMinutes(totals.dayTotals[index], locale)}h / ${minutesToHours(totals.dayTotals[index])}` : "-"}
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
                  <td
                    className="border border-gray-300 p-2 text-right"
                    colSpan={3 + (showBreakDeduction ? breakColumns : 0) + (showLunchColumn ? 1 : 0)}
                  >
                    {t.totalPaidHours}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-mono text-green-700">
                    {formatDecimalHoursFromMinutes(totals.totalMinutes, locale)}h / {minutesToHours(totals.totalMinutes)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-green-700 font-semibold">
                    {includePayment && paymentValidationErrors.length === 0 ? formatAmount(totalPay) : "-"}
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
                {showOvertime && overtimeEnabled
                  ? `${minutesToHours(paymentResult.overtimeMinutes)} (${formatPaymentMinutes(paymentResult.overtimeMinutes)})`
                  : '-'}
              </p>
            </div>
          </div>

          {includePayment && paymentValidationErrors.length === 0 && (
            <PaymentBreakdown
              result={paymentResult}
              formatAmount={formatAmount}
              formatMinutes={formatPaymentMinutes}
              labels={{
                paymentBreakdown: t.paymentBreakdown,
                totalHours: t.totalHours,
                regularHours: t.regularHours,
                overtimeHours: t.overtimeHours,
                hourlyPayRate: t.hourlyPayRate,
                regularPay: t.regularPay,
                overtimeTier: t.overtimeTier,
                totalOvertimePay: t.totalOvertimePay,
                estimatedTotalPay: t.estimatedTotalPay,
                after: t.after,
                hours: t.hours,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
