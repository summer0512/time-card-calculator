import { defineConfig } from "drizzle-kit";
export default defineConfig({ dialect: "postgresql", schema: "./db/schema.ts", out: "./drizzle", schemaFilter: ["time_card_calculator"], dbCredentials: { url: process.env.DATABASE_URL ?? "postgresql://migration-only.invalid/database" }, strict: true, verbose: true });
