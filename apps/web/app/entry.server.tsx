import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { renderToReadableStream } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    { signal: request.signal }
  ).then((stream) => {
    responseHeaders.set("Content-Type", "text/html");
    return new Response(stream, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  });
}
