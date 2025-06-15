import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { loader as rootLoader } from "../root";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("Cookie") || "";
  const loggedIn = /(?:^|;\s*)token=([^;]+)/.test(cookie);
  return json({ loggedIn });
};

export default function Index() {
  const { loggedIn } = useLoaderData<typeof loader>();
  const data = useRouteLoaderData<typeof rootLoader>("root");
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loggedIn) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google: any = (window as any).google;
      if (!google) return;
      google.accounts.id.initialize({
        client_id: data?.ENV.GOOGLE_CLIENT_ID,
        callback: async (resp: { credential: string }) => {
          await fetch(`${data?.ENV.BACKEND_SERVER_URL}/api/auth/google/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: resp.credential }),
            credentials: "include",
          });
          window.location.reload();
        },
      });
      google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [loggedIn, data]);

  const handleLogout = async () => {
    await fetch(`${data?.ENV.BACKEND_SERVER_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  if (!loggedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="rounded bg-white p-6 shadow" ref={divRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1>Hello world</h1>
      <button
        onClick={handleLogout}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Logout
      </button>
    </div>
  );
}
