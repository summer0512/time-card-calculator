import { relations, sql } from "drizzle-orm";
import { boolean, date, index, integer, jsonb, numeric, pgSchema, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const appSchema = pgSchema("time_card_calculator");
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const user = appSchema.table("user", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(), image: text("image"), ...timestamps,
});
export const session = appSchema.table("session", {
  id: text("id").primaryKey(), expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(), ...timestamps, ipAddress: text("ip_address"), userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_idx").on(table.userId)]);
export const account = appSchema.table("account", {
  id: text("id").primaryKey(), accountId: text("account_id").notNull(), providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }), accessToken: text("access_token"),
  refreshToken: text("refresh_token"), idToken: text("id_token"), accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }), scope: text("scope"), password: text("password"), ...timestamps,
}, (table) => [uniqueIndex("account_provider_account_uidx").on(table.providerId, table.accountId), index("account_user_idx").on(table.userId)]);
export const verification = appSchema.table("verification", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), ...timestamps,
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const timeCard = appSchema.table("time_card", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(), reportHeader: text("report_header"), notes: text("notes"), calculatorType: text("calculator_type").notNull(),
  sourcePath: text("source_path").notNull(), periodType: text("period_type").notNull(), periodStart: date("period_start"), periodEnd: date("period_end"),
  paymentEnabled: boolean("payment_enabled").default(false).notNull(), currency: varchar("currency", { length: 3 }), hourlyRate: numeric("hourly_rate", { precision: 12, scale: 4 }),
  settings: jsonb("settings").notNull(), cachedTotalMinutes: integer("cached_total_minutes").default(0).notNull(),
  cachedTotalPay: numeric("cached_total_pay", { precision: 14, scale: 4 }), schemaVersion: integer("schema_version").default(1).notNull(),
  ...timestamps, deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => [
  index("time_card_user_updated_idx").on(table.userId, table.updatedAt), index("time_card_user_deleted_updated_idx").on(table.userId, table.deletedAt, table.updatedAt),
  index("time_card_active_user_idx").on(table.userId).where(sql`${table.deletedAt} is null`),
]);
export const timeCardRow = appSchema.table("time_card_row", {
  id: text("id").primaryKey(), timeCardId: text("time_card_id").notNull().references(() => timeCard.id, { onDelete: "cascade" }),
  position: integer("position").notNull(), workDate: date("work_date"), dayLabel: text("day_label").notNull(),
  punches: jsonb("punches").notNull(), breaks: jsonb("breaks").notNull(), ...timestamps,
}, (table) => [uniqueIndex("time_card_row_card_position_uidx").on(table.timeCardId, table.position)]);

export const authSchema = { user, session, account, verification };
export const schema = { ...authSchema, timeCard, timeCardRow };
export const timeCardRelations = relations(timeCard, ({ many, one }) => ({ owner: one(user, { fields: [timeCard.userId], references: [user.id] }), rows: many(timeCardRow) }));
export const timeCardRowRelations = relations(timeCardRow, ({ one }) => ({ card: one(timeCard, { fields: [timeCardRow.timeCardId], references: [timeCard.id] }) }));
