import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { timeCardInputSchema } from "../lib/time-cards/types.ts";

const valid = { title: "Week 1", reportHeader: "Employee", notes: "", calculatorType: "time-card-calculator", sourcePath: "/",
  periodType: "weekly", periodStart: null, periodEnd: null, paymentEnabled: true, currency: "USD", hourlyRate: 35,
  settings: { mode: "time-card", timeFormat: "auto", showLunchColumn: true, breakColumnCount: 1, showBreakDeduction: true, isBiweekly: false, copyVariant: "time-card", overtime: { enabled: true, basis: "weekly", tiers: [{ id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 }] } },
  cachedTotalMinutes: 480, cachedTotalPay: 280, rows: [{ position: 0, workDate: null, dayLabel: "Monday", punches: [{ start: "08:00", end: "17:00" }], breaks: [{ kind: "lunch", position: 0, minutes: 60 }] }] };

test("accepts the normalized V1 calculator persistence contract", () => { assert.equal(timeCardInputSchema.parse(valid).rows[0].breaks[0].minutes, 60); });
test("rejects external source paths and malformed currency", () => { assert.equal(timeCardInputSchema.safeParse({ ...valid, sourcePath: "//example.com", currency: "$" }).success, false); });
test("migration is isolated to the application schema", () => { const sql = readFileSync(new URL("../drizzle/0000_illegal_black_cat.sql", import.meta.url), "utf8"); assert.match(sql, /CREATE SCHEMA IF NOT EXISTS "time_card_calculator"/); assert.doesNotMatch(sql, /"public"\./); assert.doesNotMatch(sql, /DROP\s+(TABLE|SCHEMA)/i); assert.equal((sql.match(/CREATE TABLE "time_card_calculator"/g) ?? []).length, 6); });
