import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/server/auth";
import { withDatabase } from "@/lib/server/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function handler(request: Request) {
  return withDatabase((database) => createAuth(database).handler(request));
}
export const { GET, POST } = toNextJsHandler({ handler } as ReturnType<typeof createAuth>);
