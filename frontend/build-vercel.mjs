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

// The index handler — Vercel Node runtime calls `module.exports.default` or
// the default export of the handler. The server.ts compiles to a fetch-API
// handler which Vercel 22.x runtime invokes natively.
writeFileSync(
  resolve(funcDir, "index.mjs"),
  `
import handler from "./dist/server/server.js";

// Vercel Node.js runtime invokes this as a standard fetch handler
export default handler.fetch.bind(handler);
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
      shouldAddHelpers: true,
      experimentalResponseStreaming: false,
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
        // Static client assets (hashed filenames) — served directly by CDN
        { src: "^/assets/(.+)$", dest: "/assets/$1" },
        // Favicon and other root static files
        { src: "^/(favicon\\.ico|robots\\.txt|sitemap\\.xml)$", dest: "/$1" },
        // All other requests → SSR function
        { src: "^/(.*)$", dest: "/index" },
      ],
    },
    null,
    2
  )
);

console.log("  ✓ Wrote .vercel/output/config.json");
console.log("Done — .vercel/output/ is ready for Vercel deployment.");
