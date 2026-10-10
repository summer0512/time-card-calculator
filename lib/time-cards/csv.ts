import { formatDurationMinutes } from "./time.ts";

export type CsvCell = string | number;
export const encodeCsv = (rows: CsvCell[][]): string => "\uFEFF" + rows.map(row => row.map(value => {
  let text = String(value);
  // Keep user-supplied names and notes as text when opened in spreadsheet apps.
  if (typeof value === "string" && /^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}).join(",")).join("\r\n") + "\r\n";

export interface CsvTimesheetLabels {
  rowType: string; date: string; day: string; start: string; end: string;
  breakTime: string; netTime: string; decimalHours: string;
  entry: string; week: string; total: string; report: string; notes: string;
  currency: string; hourlyRate: string; regularHours: string; overtimeHours: string;
  regularPay: string; overtimePay: string; totalPay: string;
}
export interface CsvTimesheetInput {
  rows: Array<{ date?: string; label: string; start: string; end: string; breakMinutes: number; netMinutes: number }>;
  weeks?: Array<{ label: string; minutes: number }>;
  totalMinutes: number;
  breakMinutes: number;
  reportHeader?: string;
  notes?: string;
  payment?: { currency: string; hourlyRate: number; regularMinutes: number; overtimeMinutes: number; regularPay: number; overtimePay: number; totalPay: number };
}
const decimalHours = (minutes: number) => (minutes / 60).toFixed(2);

export function buildTimesheetCsv(input: CsvTimesheetInput, labels: CsvTimesheetLabels): string {
  const paymentHeaders = input.payment ? [labels.currency, labels.hourlyRate, labels.regularHours, labels.overtimeHours, labels.regularPay, labels.overtimePay, labels.totalPay] : [];
  const blankPayment = paymentHeaders.map(() => "");
  const rows: CsvCell[][] = [[labels.rowType, labels.date, labels.day, labels.start, labels.end, labels.breakTime, labels.netTime, labels.decimalHours, ...paymentHeaders]];
  if (input.reportHeader) rows.push([labels.report, "", input.reportHeader, "", "", "", "", "", ...blankPayment]);
  if (input.notes) rows.push([labels.notes, "", input.notes, "", "", "", "", "", ...blankPayment]);
  input.rows.forEach(row => rows.push([labels.entry, row.date ?? "", row.label, row.start, row.end, formatDurationMinutes(row.breakMinutes), formatDurationMinutes(row.netMinutes), decimalHours(row.netMinutes), ...blankPayment]));
  input.weeks?.forEach(week => rows.push([labels.week, "", week.label, "", "", "", formatDurationMinutes(week.minutes), decimalHours(week.minutes), ...blankPayment]));
  const pay = input.payment;
  rows.push([labels.total, "", labels.total, "", "", formatDurationMinutes(input.breakMinutes), formatDurationMinutes(input.totalMinutes), decimalHours(input.totalMinutes), ...(pay ? [pay.currency, pay.hourlyRate, decimalHours(pay.regularMinutes), decimalHours(pay.overtimeMinutes), pay.regularPay.toFixed(2), pay.overtimePay.toFixed(2), pay.totalPay.toFixed(2)] : [])]);
  return encodeCsv(rows);
}

export function timesheetCsvFilename(period: string, year?: number, month?: number): string {
  return year && month ? `timesheet-${year}-${String(month).padStart(2, "0")}.csv` : `timesheet-${period}.csv`;
}
