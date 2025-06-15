import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import type { JwtPayload } from "../api/auth/jwt";

/**
 * Middleware to verify an access token stored in the `token` cookie.
 *
 * On success the corresponding user record is attached to the context as
 * `current_user`.
 */
export const verifyAccessToken = async (c: Context, next: Next) => {
  // Extract token from cookie
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (!match) {
    return c.text("Unauthorized", 401);
  }
  const token = match[1];

  // Verify JWT and ensure it's not a refresh token
  let payload: JwtPayload;
  try {
    payload = (await verify(token, c.env.JWT_SECRET)) as JwtPayload;
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

  c.set("current_user_id", userId);
  await next();
};
