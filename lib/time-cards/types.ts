import { z } from "zod";

export const punchSchema = z.object({ start: z.string().max(16), end: z.string().max(16) });
export const savedBreakSchema = z.object({ kind: z.enum(["break", "lunch"]), position: z.number().int().nonnegative(), minutes: z.number().int().nonnegative() });
export const savedRowSchema = z.object({ position: z.number().int().nonnegative(), workDate: z.string().date().nullable().optional(), dayLabel: z.string().max(160), punches: z.array(punchSchema).max(24), breaks: z.array(savedBreakSchema).max(24) });
export const settingsSchema = z.object({
  mode: z.enum(["time-card", "hours", "split-shift"]), timeFormat: z.enum(["auto", "12h", "24h", "military"]),
  showLunchColumn: z.boolean(), breakColumnCount: z.number().int().min(0).max(24), showBreakDeduction: z.boolean(), isBiweekly: z.boolean(),
  copyVariant: z.enum(["time-card", "timesheet", "time-clock", "punch"]),
  overtime: z.object({ enabled: z.boolean(), basis: z.enum(["weekly", "daily"]), tiers: z.array(z.object({ id: z.string().min(1).max(100), afterHours: z.number().nonnegative(), rateType: z.enum(["multiplier", "fixed"]), rateValue: z.number().positive() })).max(12) }),
});
export const timeCardInputSchema = z.object({
  title: z.string().trim().min(1).max(160), reportHeader: z.string().max(500).default(""), notes: z.string().max(5000).default(""),
  calculatorType: z.string().min(1).max(120), sourcePath: z.string().startsWith("/").max(500).refine((path) => !path.startsWith("//") && !path.includes("?") && !path.includes("#"), "Invalid source path"),
  periodType: z.enum(["weekly", "biweekly", "single", "split_shift", "custom"]), periodStart: z.string().date().nullable().optional(), periodEnd: z.string().date().nullable().optional(),
  paymentEnabled: z.boolean(), currency: z.string().regex(/^[A-Z]{3}$/).nullable(), hourlyRate: z.number().nonnegative().nullable(),
  settings: settingsSchema, cachedTotalMinutes: z.number().int().nonnegative(), cachedTotalPay: z.number().nonnegative().nullable(), rows: z.array(savedRowSchema).min(1).max(100),
});
export type TimeCardInput = z.infer<typeof timeCardInputSchema>;
export type SavedTimeCardRow = z.infer<typeof savedRowSchema>;
export type TimeCardSettings = z.infer<typeof settingsSchema>;

export type TimeCardListItem = { id: string; title: string; calculatorType: string; sourcePath: string; periodType: string; periodStart: string | null; periodEnd: string | null; paymentEnabled: boolean; currency: string | null; cachedTotalMinutes: number; cachedTotalPay: string | null; createdAt: string; updatedAt: string };
export type SavedTimeCard = TimeCardListItem & Omit<TimeCardInput, "title" | "calculatorType" | "sourcePath" | "periodType" | "periodStart" | "periodEnd" | "paymentEnabled" | "currency" | "cachedTotalMinutes" | "cachedTotalPay"> & { reportHeader: string; notes: string; hourlyRate: string | null; schemaVersion: number };
