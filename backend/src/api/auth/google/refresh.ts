import { Hono } from "hono";
import { verify, sign } from "hono/jwt";
import type { Bindings } from "../../../bindings";

export const refresh = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const body = await c.req.json<{ refreshToken?: string }>();
  const token = body.refreshToken;
  if (!token) {
    return c.json({ error: "refreshToken required" }, 400);
  }
  let payload: any;
  try {
    payload = await verify(token, c.env.JWT_SECRET);
  } catch (e) {
    return c.json({ error: "invalid token" }, 401);
  }
  if (payload.typ !== "refresh") {
    return c.json({ error: "invalid token" }, 400);
  }
  const newToken = await sign({ sub: payload.sub }, c.env.JWT_SECRET);
  const newRefresh = await sign(
    { sub: payload.sub, typ: "refresh" },
    c.env.JWT_SECRET
  );
  return c.json({ token: newToken, refreshToken: newRefresh });
});

export default refresh;
