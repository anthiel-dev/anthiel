import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Export OpenAPI from the in-process Elysia app (deterministic for codegen).
 * Set OPENAPI_URL to fetch a live server instead.
 *
 * Run from `apps/backend` so Bun loads `.env` (DATABASE_URL, etc.).
 */
async function main() {
  const outPath = resolve(import.meta.dirname, "../../../../packages/api-types/openapi.json");

  let spec: unknown;
  const openApiUrl = process.env.OPENAPI_URL;

  if (openApiUrl) {
    const response = await fetch(openApiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${openApiUrl}: HTTP ${response.status}`);
    }
    spec = await response.json();
    console.log(`Fetched OpenAPI from ${openApiUrl}`);
  } else {
    const { app } = await import("../app");
    const response = await app.handle(new Request("http://localhost/openapi/json"));
    if (!response.ok) {
      throw new Error(`Failed to export OpenAPI: HTTP ${response.status}`);
    }
    spec = await response.json();
    console.log("Built OpenAPI from app instance");
  }

  writeFileSync(outPath, `${JSON.stringify(spec, null, 2)}\n`);
  console.log(`Wrote ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
