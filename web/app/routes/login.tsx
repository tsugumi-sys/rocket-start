import { useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { loader as rootLoader } from "../root";

export default function Login() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          window.location.href = "/";
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
  }, [data]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div ref={divRef} />
    </div>
  );
}
