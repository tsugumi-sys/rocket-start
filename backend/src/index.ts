import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { usersTable } from "./db/schema";
import auth from "./api/auth";
import type { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(usersTable).all();
  return c.json(result);
});

app.route("/api/auth", auth);

export default app;
