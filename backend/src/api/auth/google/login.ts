import { Hono } from "hono";
import { sign } from "hono/jwt";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { usersTable, providersTable } from "../../../db/schema";
import type { Bindings } from "../../../bindings";

export const login = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const body = await c.req.json<{ id_token?: string }>();
  const idToken = body.id_token;
  if (!idToken) {
    return c.json({ error: "id_token required" }, 400);
  }

  const tokenInfoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );
  if (!tokenInfoRes.ok) {
    return c.json({ error: "invalid id_token" }, 400);
  }
  const tokenInfo: any = await tokenInfoRes.json();
  if (tokenInfo.aud !== c.env.GOOGLE_CLIENT_ID) {
    return c.json({ error: "audience mismatch" }, 400);
  }

  const providerUserId = tokenInfo.sub as string;
  const db = drizzle(c.env.DB);

  const provider = await db
    .select()
    .from(providersTable)
    .where(
      and(
        eq(providersTable.providerUserId, providerUserId),
        eq(providersTable.provider, "google")
      )
    )
    .get();

  let userId: number;
  if (!provider) {
    const insertUser = await db.insert(usersTable).values({}).run();
    // @ts-ignore - Cloudflare D1 returns last_row_id
    userId = insertUser.lastInsertRowid as number;
    await db
      .insert(providersTable)
      .values({
        userId,
        provider: "google",
        providerUserId,
      })
      .run();
  } else {
    userId = provider.userId;
  }

  const token = await sign({ sub: String(userId) }, c.env.JWT_SECRET);
  const refreshToken = await sign(
    { sub: String(userId), typ: "refresh" },
    c.env.JWT_SECRET
  );

  return c.json({ token, refreshToken });
});

export default login;
