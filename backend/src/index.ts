import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import auth from "./api/auth";
import type { Bindings } from "./bindings";
import { usersTable } from "./db/schema";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(usersTable).all();
  return c.json(result);
});

app.use("/api/auth/*", cors());
app.route("/api/auth", auth);

showRoutes(app);

export default app;
