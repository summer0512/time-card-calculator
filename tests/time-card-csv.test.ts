import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { encodeCsv, buildTimesheetCsv, timesheetCsvFilename } from "../lib/time-cards/csv.ts";

const labels = JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8")).TimeCardCsv;

test("CSV preserves Unicode, commas, quotes and multiline notes with BOM and CRLF", () => {
  assert.equal(encodeCsv([["Überstunden, payé", 'Name "A"', "line1\nline2", 1.25]]), '\uFEFF"Überstunden, payé","Name ""A""","line1\nline2","1.25"\r\n');
});

test("spreadsheet formula-like user text remains text, while numbers remain numbers", () => {
  assert.equal(encodeCsv([["=SUM(A1)", " +cmd", "@user", "-name", -1, "09:00"]]), '\uFEFF"\'=SUM(A1)","\' +cmd","\'@user","\'-name","-1","09:00"\r\n');
});

test("monthly CSV includes real dates, empty days, weekly subtotals and matching totals", () => {
  const csv = buildTimesheetCsv({
    rows: [
      { date: "2024-02-29", label: "Thursday", start: "22:00", end: "06:00", breakMinutes: 30, netMinutes: 450 },
      { date: "2024-02-28", label: "Wednesday", start: "", end: "", breakMinutes: 0, netMinutes: 0 },
    ],
    weeks: [{ label: "2024-02-26 – 2024-02-29", minutes: 450 }],
    totalMinutes: 450, breakMinutes: 30, reportHeader: "Jane", notes: "Reviewed",
  }, labels);
  const rows = csv.slice(1).trim().split("\r\n");
  assert.equal(rows.length, 7);
  assert.ok(rows.every(row => row.split(',').length === 8));
  assert.equal(rows[3], '"Entry","2024-02-29","Thursday","22:00","06:00","0:30","7:30","7.50"');
  assert.equal(rows[4], '"Entry","2024-02-28","Wednesday","","","0:00","0:00","0.00"');
  assert.equal(rows[5], '"Week subtotal","","2024-02-26 – 2024-02-29","","","","7:30","7.50"');
  assert.equal(rows[6], '"Total","","Total","","","0:30","7:30","7.50"');
});

test("payment summary keeps rate precision and puts payment only on the total row", () => {
  const csv = buildTimesheetCsv({ rows: [{ label: "Shift 1", start: "09:00", end: "17:30", breakMinutes: 30, netMinutes: 480 }], totalMinutes: 480, breakMinutes: 30,
    payment: { currency: "EUR", hourlyRate: 12.345, regularMinutes: 420, overtimeMinutes: 60, regularPay: 86.415, overtimePay: 18.5175, totalPay: 104.9325 } }, labels);
  const rows = csv.slice(1).trim().split("\r\n");
  assert.ok(rows.every(row => row.split(',').length === 15));
  assert.match(rows[1], /,"","","","","","",""$/);
  assert.match(rows[2], /"EUR","12.345","7.00","1.00","86.42","18.52","104.93"$/);
});

test("five languages provide the same CSV fields and locale-independent numeric values", () => {
  for (const locale of ["en", "de", "fr", "es", "pt-br"]) {
    const translated = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")).TimeCardCsv;
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(labels).sort());
    assert.ok(Object.values(translated).every(value => typeof value === "string" && value.length > 0));
    const csv = buildTimesheetCsv({ rows: [], totalMinutes: 90, breakMinutes: 0 }, translated);
    assert.ok(csv.endsWith('"1:30","1.50"\r\n'));
  }
});

test("download filenames identify months and all non-monthly modes", () => {
  assert.equal(timesheetCsvFilename("monthly", 2024, 2), "timesheet-2024-02.csv");
  for (const period of ["weekly", "biweekly", "single", "split-shift"]) assert.equal(timesheetCsvFilename(period), `timesheet-${period}.csv`);
});
