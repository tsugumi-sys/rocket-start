import { Hono } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

const app = new Hono<{ Bindings: { GOOGLE_CLIENT_ID: string } }>();

app.post("/", async (c) => {
  const idToken = (await c.req.json()).id_token as string | undefined;
  if (!idToken) {
    return c.json({ error: "missing id_token" }, 400);
  }
  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      audience: c.env.GOOGLE_CLIENT_ID,
      issuer: "https://accounts.google.com",
    });
    const userId = payload.sub;
    if (!userId) {
      return c.json({ error: "invalid token" }, 400);
    }
    return c.json({ sub: userId });
  } catch (e) {
    return c.json({ error: "invalid token" }, 400);
  }
});

export default app;
