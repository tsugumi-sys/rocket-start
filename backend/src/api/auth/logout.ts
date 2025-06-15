import { Hono } from "hono";
import type { Bindings } from "../bindings";

const logout = new Hono<{ Bindings: Bindings }>();

logout.post("/", (c) => {
  c.header(
    "Set-Cookie",
    "token=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );
  return c.json({ success: true });
});

export default logout;
