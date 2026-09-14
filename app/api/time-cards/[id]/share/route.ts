import { withDatabase } from "@/lib/server/database";
import { currentUserId } from "@/lib/server/request-auth";
import { disableTimeCardShare, enableTimeCardShare } from "@/lib/server/time-cards";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function POST(request: Request, context: Context) {
  return withDatabase(async (db) => {
    const userId = await currentUserId(db, request);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const shareId = await enableTimeCardShare(db, userId, (await context.params).id);
    return shareId
      ? Response.json({ shareId, sharePath: `/share/${shareId}` }, { headers: { "Cache-Control": "no-store" } })
      : notFound();
  });
}

export async function DELETE(request: Request, context: Context) {
  return withDatabase(async (db) => {
    const userId = await currentUserId(db, request);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    return await disableTimeCardShare(db, userId, (await context.params).id)
      ? Response.json({ ok: true })
      : notFound();
  });
}
