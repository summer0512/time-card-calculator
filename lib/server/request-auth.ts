import { createAuth } from "@/lib/server/auth";
import type { Database } from "@/lib/server/database";
export async function currentUserId(database: Database, request: Request) { const session = await createAuth(database).api.getSession({ headers: request.headers }); return session?.user.id ?? null; }
