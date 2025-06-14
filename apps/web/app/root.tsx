import type { MetaFunction } from "@remix-run/cloudflare";
import { Links, Meta, Outlet, Scripts } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "Rocket Start" }];

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
