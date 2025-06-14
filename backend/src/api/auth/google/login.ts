import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Bindings } from "../../../bindings";
import { providersTable, usersTable } from "../../../db/schema";
import type { GoogleIdTokenPayload } from "./model";

// Create JWK Set from Google certs URL (cached automatically)
const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export const login = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const { id_token: idToken } = await c.req.json<{ id_token?: string }>();
  if (!idToken) {
    return c.json({ error: "id_token required" }, 400);
  }

  let payload: GoogleIdTokenPayload;
  try {
    const verified = await jwtVerify<GoogleIdTokenPayload>(idToken, jwks, {
      audience: c.env.GOOGLE_CLIENT_ID,
      issuer: "https://accounts.google.com",
    });
    payload = verified.payload;
  } catch (err) {
    return c.json({ error: "invalid id_token" }, 400);
  }

  const providerUserId = payload.sub as string;
  if (!providerUserId) {
    return c.json({ error: "token missing sub" }, 400);
  }

  const db = drizzle(c.env.DB);

  const provider = await db
    .select()
    .from(providersTable)
    .where(
      and(
        eq(providersTable.providerUserId, providerUserId),
        eq(providersTable.provider, "google"),
      ),
    )
    .get();

  let userId: number;
  if (!provider) {
    const insertUser = await db.insert(usersTable).values({}).run();
    // @ts-ignore
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
    c.env.JWT_SECRET,
  );

  c.header(
    "Set-Cookie",
    `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`,
  );
  return c.json({ token, refreshToken });
});

export default login;
