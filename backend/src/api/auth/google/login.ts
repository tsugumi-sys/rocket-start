import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Bindings } from "../../../bindings";
import { userAccountsTable, usersTable } from "../../../db/schema";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../constants";
import type { GoogleIdTokenPayload } from "./model";

const GOOGLE_ISSUER = "https://accounts.google.com";
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export const login = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const body = await c.req.json<{ id_token?: string }>();
  const idToken = body.id_token;

  if (!idToken) {
    return c.json({ error: "Missing id_token" }, 400);
  }

  let payload: GoogleIdTokenPayload;
  try {
    const { payload: verifiedPayload } = await jwtVerify<GoogleIdTokenPayload>(
      idToken,
      GOOGLE_JWKS,
      {
        audience: c.env.GOOGLE_CLIENT_ID,
        issuer: GOOGLE_ISSUER,
      },
    );
    payload = verifiedPayload;
  } catch (err) {
    return c.json({ error: "Invalid id_token" }, 400);
  }

  const providerUserId = payload.sub;
  const email = payload.email;
  if (!providerUserId || !email) {
    return c.json({ error: "Token missing required fields" }, 400);
  }

  const db = drizzle(c.env.DB);

  // Find existing account by provider + providerUserId
  const existingAccount = await db
    .select()
    .from(userAccountsTable)
    .where(
      and(
        eq(userAccountsTable.provider, "google"),
        eq(userAccountsTable.providerUserId, providerUserId),
      ),
    )
    .get();

  let userId: number;

  if (existingAccount) {
    userId = existingAccount.userId;
  } else {
    // Create new user
    const insertUser = await db.insert(usersTable).values({}).returning();
    userId = insertUser[0].id;

    // Create new account
    await db
      .insert(userAccountsTable)
      .values({
        userId,
        provider: "google",
        providerUserId,
        email,
      })
      .run();
  }

  // Create JWT tokens with expirations
  const now = Math.floor(Date.now() / 1000);
  const token = await sign(
    { sub: String(userId), exp: now + ACCESS_TOKEN_EXP },
    c.env.JWT_SECRET,
  );
  const refreshToken = await sign(
    { sub: String(userId), typ: "refresh", exp: now + REFRESH_TOKEN_EXP },
    c.env.JWT_SECRET,
  );

  // Set HttpOnly cookie
  c.header(
    "Set-Cookie",
    `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${ACCESS_TOKEN_EXP}`,
  );

  return c.json({ token, refreshToken });
});

export default login;
