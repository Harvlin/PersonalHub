#!/usr/bin/env node
/**
 * build-vercel.mjs
 *
 * Converts the TanStack Start dist output into a Vercel Build Output API v3
 * structure so the app can be deployed as an SSR app on Vercel.
 *
 * dist/client/  → .vercel/output/static/     (served as-is by Vercel CDN)
 * dist/server/  → .vercel/output/functions/index.func/  (SSR serverless fn)
 *
 * The server.ts entry exports:
 *   export default { fetch(req: Request): Promise<Response> }
 * which is the standard Web Fetch API handler — Vercel's Node 22 runtime
 * supports this natively when we set `shouldAddHelpers: false` and
 * `experimentalResponseStreaming: true`.
 */

import { cpSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname; // frontend/
const out = resolve(root, ".vercel", "output");

console.log("Building Vercel output structure...");

// ── 1. Static assets ──────────────────────────────────────────────────────────
const staticSrc = resolve(root, "dist", "client");
const staticDst = resolve(out, "static");
mkdirSync(staticDst, { recursive: true });
if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDst, { recursive: true });
  console.log("  ✓ Copied dist/client → .vercel/output/static");
}

// ── 2. SSR Serverless Function ────────────────────────────────────────────────
const funcDir = resolve(out, "functions", "index.func");
mkdirSync(funcDir, { recursive: true });

// Copy the entire dist/server directory into the function bundle
const serverSrc = resolve(root, "dist", "server");
if (existsSync(serverSrc)) {
  cpSync(serverSrc, resolve(funcDir, "dist", "server"), { recursive: true });
  console.log("  ✓ Copied dist/server → .vercel/output/functions/index.func/dist/server");
}

// CRITICAL: Ensure Node.js treats all .js files in the function bundle as ES Modules!
// Without this in /var/task, Node defaults to CommonJS and crashes with:
// "SyntaxError: Unexpected token 'export'" when loading server.js.
const pkgJson = JSON.stringify({ type: "module" }, null, 2);
writeFileSync(resolve(funcDir, "package.json"), pkgJson);
writeFileSync(resolve(funcDir, "dist", "package.json"), pkgJson);
writeFileSync(resolve(funcDir, "dist", "server", "package.json"), pkgJson);
console.log("  ✓ Wrote package.json (type: module) into function bundle");

// Bridge Web Fetch API (what server.ts exports) → Node.js (req, res)
// which is what the Vercel Node.js runtime actually calls.
writeFileSync(
  resolve(funcDir, "index.mjs"),
  `
import handler from "./dist/server/server.js";

export default async function vercelHandler(req, res) {
  try {
    let proto = req.headers["x-forwarded-proto"] || "https";
    if (Array.isArray(proto)) proto = proto[0];
    else proto = proto.split(",")[0].trim();

    let host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
    if (Array.isArray(host)) host = host[0];
    else host = host.split(",")[0].trim();

    let path = req.url || "/";
    if (path.startsWith("/index") && req.headers["x-matched-path"]) {
      path = req.headers["x-matched-path"];
    }

    const url = new URL(path, proto + "://" + host);

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v != null) {
        if (Array.isArray(v)) {
          for (const s of v) headers.append(k, s);
        } else {
          headers.set(k, v);
        }
      }
    }

    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const response = await handler.fetch(request, {}, {});

    res.statusCode = response.status;
    if (typeof response.headers.getSetCookie === "function") {
      const setCookies = response.headers.getSetCookie();
      if (setCookies && setCookies.length > 0) {
        res.setHeader("set-cookie", setCookies);
      }
    }
    for (const [k, v] of response.headers.entries()) {
      if (k.toLowerCase() !== "set-cookie") {
        res.setHeader(k, v);
      }
    }
    const buf = await response.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error("Vercel SSR Handler error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(err.stack || String(err));
  }
}
`.trimStart()
);

// .vc-config.json tells Vercel how to run the function
writeFileSync(
  resolve(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
    },
    null,
    2
  )
);

console.log("  ✓ Wrote .vercel/output/functions/index.func/");

// ── 3. Route config ───────────────────────────────────────────────────────────
writeFileSync(
  resolve(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Automatically check static files first (assets, favicon, etc.)
        { handle: "filesystem" },
        // All non-static requests → SSR function
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2
  )
);

console.log("  ✓ Wrote .vercel/output/config.json");
console.log("Done — .vercel/output/ is ready for Vercel deployment.");
