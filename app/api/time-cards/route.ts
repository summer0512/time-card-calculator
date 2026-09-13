import { timeCardInputSchema } from "@/lib/time-cards/types";
import { withDatabase } from "@/lib/server/database";
import { currentUserId } from "@/lib/server/request-auth";
import { createTimeCard, listTimeCards } from "@/lib/server/time-cards";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return withDatabase(async (db) => { const userId = await currentUserId(db, request); if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 }); return Response.json({ cards: await listTimeCards(db, userId) }, { headers: { "Cache-Control": "no-store" } }); }); }
export async function POST(request: Request) { return withDatabase(async (db) => { const userId = await currentUserId(db, request); if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 }); const parsed = timeCardInputSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Invalid time card", details: parsed.error.flatten() }, { status: 400 }); return Response.json({ id: await createTimeCard(db, userId, parsed.data) }, { status: 201 }); }); }
