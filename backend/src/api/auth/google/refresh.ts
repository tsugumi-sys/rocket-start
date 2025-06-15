import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import type { Bindings } from "../../../bindings";

const ACCESS_TOKEN_EXP = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 30; // 30 days

export const refresh = new Hono<{ Bindings: Bindings }>().post(
  "/",
  async (c) => {
    const body = await c.req.json<{ refreshToken?: string }>();
    const token = body.refreshToken;
    if (!token) {
      return c.json({ error: "refreshToken required" }, 400);
    }

    //  biome-ignore lint:
    let payload: any;
    try {
      payload = await verify(token, c.env.JWT_SECRET);
    } catch (e) {
      return c.json({ error: "invalid token" }, 401);
    }
    if (payload.typ !== "refresh") {
      return c.json({ error: "invalid token" }, 400);
    }
    const now = Math.floor(Date.now() / 1000);
    const newToken = await sign(
      { sub: payload.sub, exp: now + ACCESS_TOKEN_EXP },
      c.env.JWT_SECRET,
    );
    const newRefresh = await sign(
      { sub: payload.sub, typ: "refresh", exp: now + REFRESH_TOKEN_EXP },
      c.env.JWT_SECRET,
    );
    return c.json({ token: newToken, refreshToken: newRefresh });
  },
);

export default refresh;
