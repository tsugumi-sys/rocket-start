import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import type { Bindings } from "../bindings";
import { usersTable } from "../db/schema";

/**
 * Middleware to verify an access token stored in the `token` cookie.
 *
 * On success the corresponding user record is attached to the context as
 * `current_user`.
 */
export const verifyAccessToken = async (
  c: Context<{ Bindings: Bindings }>,
  next: Next,
) => {
  // Extract token from cookie
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (!match) {
    return c.text("Unauthorized", 401);
  }
  const token = match[1];

  // Verify JWT and ensure it's not a refresh token
  let payload: any;
  try {
    payload = await verify(token, c.env.JWT_SECRET);
  } catch (e) {
    console.error("JWT verification failed", e);
    return c.text("Unauthorized", 401);
  }
  if (payload.typ === "refresh") {
    return c.text("Unauthorized", 401);
  }

  const userId = Number(payload.sub);
  if (!userId) {
    return c.text("Unauthorized", 401);
  }

  // Validate that the user exists
  const db = drizzle(c.env.DB);
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .get();
  if (!user) {
    return c.text("Unauthorized", 401);
  }

  c.set("current_user", user);
  await next();
};
