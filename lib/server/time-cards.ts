import { and, desc, eq, isNull } from "drizzle-orm";
import { timeCard, timeCardRow } from "@/db/schema";
import type { Database } from "@/lib/server/database";
import { settingsSchema, savedBreakSchema, punchSchema, type TimeCardInput } from "@/lib/time-cards/types";
import { calculatePayment, type PaymentConfig, type WorkPeriod } from "@/lib/payment";

const id = () => crypto.randomUUID();
const timeMinutes = (value: string) => { if (!/^\d{2}:\d{2}$/.test(value)) return null; const [hours, minutes] = value.split(":").map(Number); return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null; };
function summaries(input: TimeCardInput) {
  const rowMinutes = input.rows.map((row) => { const punchMinutes = row.punches.reduce((sum, punch) => { const start = timeMinutes(punch.start); const end = timeMinutes(punch.end); if (start === null || end === null) return sum; return sum + (end >= start ? end - start : end + 1440 - start); }, 0); return Math.max(0, punchMinutes - row.breaks.reduce((sum, item) => sum + item.minutes, 0)); });
  const totalMinutes = rowMinutes.reduce((sum, minutes) => sum + minutes, 0);
  if (!input.paymentEnabled || input.hourlyRate === null) return { totalMinutes, totalPay: null };
  const workPeriods: WorkPeriod[] = rowMinutes.map((minutes, index) => ({ dayId: input.settings.mode === "split-shift" ? "split-day" : String(index % 7), weekId: input.settings.mode === "hours" ? "shift" : input.settings.mode === "split-shift" ? "week-1" : String(Math.floor(index / 7)), workedHours: minutes / 60 }));
  const payment: PaymentConfig = { enabled: true, currency: input.currency ?? "USD", hourlyRate: input.hourlyRate, overtime: input.settings.overtime };
  return { totalMinutes, totalPay: calculatePayment(payment, workPeriods).totalPay };
}
const serializeCard = (card: typeof timeCard.$inferSelect) => ({ ...card, createdAt: card.createdAt.toISOString(), updatedAt: card.updatedAt.toISOString() });

export async function listTimeCards(db: Database, userId: string) {
  const cards = await db.select({ id: timeCard.id, title: timeCard.title, calculatorType: timeCard.calculatorType, sourcePath: timeCard.sourcePath,
    periodType: timeCard.periodType, periodStart: timeCard.periodStart, periodEnd: timeCard.periodEnd, paymentEnabled: timeCard.paymentEnabled,
    currency: timeCard.currency, cachedTotalMinutes: timeCard.cachedTotalMinutes, cachedTotalPay: timeCard.cachedTotalPay,
    createdAt: timeCard.createdAt, updatedAt: timeCard.updatedAt }).from(timeCard)
    .where(and(eq(timeCard.userId, userId), isNull(timeCard.deletedAt))).orderBy(desc(timeCard.updatedAt));
  return cards.map((card) => ({ ...card, createdAt: card.createdAt.toISOString(), updatedAt: card.updatedAt.toISOString() }));
}

async function owned(db: Database, userId: string, cardId: string) {
  const [card] = await db.select().from(timeCard).where(and(eq(timeCard.id, cardId), eq(timeCard.userId, userId), isNull(timeCard.deletedAt))).limit(1);
  return card;
}

export async function getTimeCard(db: Database, userId: string, cardId: string) {
  const card = await owned(db, userId, cardId); if (!card) return null;
  const rows = await db.select().from(timeCardRow).where(eq(timeCardRow.timeCardId, cardId)).orderBy(timeCardRow.position);
  return { ...serializeCard(card), settings: settingsSchema.parse(card.settings), rows: rows.map((row) => ({ position: row.position, workDate: row.workDate, dayLabel: row.dayLabel, punches: Array.isArray(row.punches) ? row.punches.map((x) => punchSchema.parse(x)) : [], breaks: Array.isArray(row.breaks) ? row.breaks.map((x) => savedBreakSchema.parse(x)) : [] })) };
}

const values = (userId: string, input: TimeCardInput) => { const cached = summaries(input); return ({
  userId, title: input.title, reportHeader: input.reportHeader || null, notes: input.notes || null, calculatorType: input.calculatorType,
  sourcePath: input.sourcePath, periodType: input.periodType, periodStart: input.periodStart ?? null, periodEnd: input.periodEnd ?? null,
  paymentEnabled: input.paymentEnabled, currency: input.currency, hourlyRate: input.hourlyRate === null ? null : input.hourlyRate.toFixed(4),
  settings: input.settings, cachedTotalMinutes: cached.totalMinutes, cachedTotalPay: cached.totalPay === null ? null : cached.totalPay.toFixed(4), schemaVersion: 1,
}); };
const rowValues = (cardId: string, input: TimeCardInput) => input.rows.map((row) => ({ id: id(), timeCardId: cardId, position: row.position, workDate: row.workDate ?? null, dayLabel: row.dayLabel, punches: row.punches, breaks: row.breaks }));

export async function createTimeCard(db: Database, userId: string, input: TimeCardInput) {
  const cardId = id();
  await db.transaction(async (tx) => { await tx.insert(timeCard).values({ id: cardId, ...values(userId, input) }); await tx.insert(timeCardRow).values(rowValues(cardId, input)); });
  return cardId;
}
export async function updateTimeCard(db: Database, userId: string, cardId: string, input: TimeCardInput) {
  if (!await owned(db, userId, cardId)) return false;
  await db.transaction(async (tx) => { await tx.update(timeCard).set({ ...values(userId, input), updatedAt: new Date() }).where(and(eq(timeCard.id, cardId), eq(timeCard.userId, userId))); await tx.delete(timeCardRow).where(eq(timeCardRow.timeCardId, cardId)); await tx.insert(timeCardRow).values(rowValues(cardId, input)); }); return true;
}
export async function renameTimeCard(db: Database, userId: string, cardId: string, title: string) { const result = await db.update(timeCard).set({ title, updatedAt: new Date() }).where(and(eq(timeCard.id, cardId), eq(timeCard.userId, userId), isNull(timeCard.deletedAt))).returning({ id: timeCard.id }); return result.length > 0; }
export async function deleteTimeCard(db: Database, userId: string, cardId: string) { const now = new Date(); const result = await db.update(timeCard).set({ deletedAt: now, updatedAt: now }).where(and(eq(timeCard.id, cardId), eq(timeCard.userId, userId), isNull(timeCard.deletedAt))).returning({ id: timeCard.id }); return result.length > 0; }
export async function duplicateTimeCard(db: Database, userId: string, cardId: string) { const original = await getTimeCard(db, userId, cardId); if (!original) return null; return createTimeCard(db, userId, { ...original, title: `Copy of ${original.title}`, reportHeader: original.reportHeader ?? "", notes: original.notes ?? "", periodType: original.periodType as TimeCardInput["periodType"], hourlyRate: original.hourlyRate === null ? null : Number(original.hourlyRate), cachedTotalPay: original.cachedTotalPay === null ? null : Number(original.cachedTotalPay) }); }
