import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as dbSchema from "@/db/schema";

export type Database = NodePgDatabase<typeof dbSchema>;
type RuntimeEnv = { HYPERDRIVE?: { connectionString: string } };

async function target(): Promise<{ connectionString: string; close: boolean }> {
  if (process.env.NODE_ENV === "production") {
    const { env } = getCloudflareContext() as unknown as { env: RuntimeEnv };
    if (!env.HYPERDRIVE?.connectionString) throw new Error("Missing required HYPERDRIVE binding");
    return { connectionString: env.HYPERDRIVE.connectionString, close: false };
  }
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL for local database access");
  return { connectionString: process.env.DATABASE_URL, close: true };
}

export async function withDatabase<T>(operation: (database: Database) => Promise<T>): Promise<T> {
  const resolved = await target();
  const client = new Client({ connectionString: resolved.connectionString });
  let connected = false;
  try { await client.connect(); connected = true; return await operation(drizzle(client, { schema: dbSchema })); }
  finally { if (connected && resolved.close) await client.end(); }
}
