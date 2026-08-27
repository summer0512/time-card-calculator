import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { authSchema } from "@/db/schema";
import type { Database } from "@/lib/server/database";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function createAuth(database: Database) {
  const runtime = process.env.NODE_ENV === "production"
    ? (getCloudflareContext().env as unknown as Record<string, string | undefined>)
    : process.env;
  const clientId = runtime.GOOGLE_CLIENT_ID;
  const clientSecret = runtime.GOOGLE_CLIENT_SECRET;
  const secret = runtime.BETTER_AUTH_SECRET;
  const baseURL = runtime.BETTER_AUTH_URL;
  if (!clientId || !clientSecret || !secret || !baseURL) throw new Error("Missing Better Auth or Google OAuth configuration");
  return betterAuth({
    database: drizzleAdapter(database, { provider: "pg", schema: authSchema }),
    baseURL, secret, emailAndPassword: { enabled: false },
    trustedOrigins: ["http://localhost:3000", "https://time-card-calculator.work"],
    socialProviders: { google: { clientId, clientSecret } },
  });
}

export type Auth = ReturnType<typeof createAuth>;
