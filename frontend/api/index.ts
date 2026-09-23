import type { IncomingMessage, ServerResponse } from "node:http";

// The SSR build emits JavaScript without a declaration file.
// @ts-expect-error The generated server module has no TypeScript declarations.
import server from "../dist/server/server.js";

const appServer = server as {
  fetch(request: Request, environment: Record<string, unknown>, context: Record<string, unknown>): Promise<Response>;
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const protocol = request.headers["x-forwarded-proto"] ?? "https";
  const host = request.headers.host ?? "localhost";
  const pathname = request.url ?? "/";
  const url = `${protocol}://${host}${pathname}`;
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      headers.set(name, value.join(", "));
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const webRequest = new Request(url, {
    method: request.method,
    headers,
    body: hasBody ? (request as unknown as BodyInit) : undefined,
    duplex: hasBody ? "half" : undefined,
  } as RequestInit & { duplex?: "half" });
  const webResponse = await appServer.fetch(webRequest, {}, {});

  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => response.setHeader(name, value));
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}
