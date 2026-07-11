import { defineConfig } from "orval";

/** React Query client + models; OpenAPI spec from `@anthiel/api-types`. */
export default defineConfig({
  anthielQuery: {
    input: {
      target: "../../packages/api-types/openapi.json",
      filters: { mode: "exclude", tags: ["Better Auth"] },
    },
    output: {
      mode: "single",
      target: "./src/generated/api/index.ts",
      schemas: "./src/generated/api/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      baseUrl: "http://localhost:3002",
      override: {
        mutator: {
          path: "./src/lib/http-client.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
