import { Elysia } from "elysia";

import { db } from "@/database";
import { extractApiKeyFromHeaders } from "@/lib/api-key";
import { ProjectApiKeysService } from "@/modules/projects";

const projectApiKeysService = new ProjectApiKeysService({ db });

/** API key macros for project-scoped integration endpoints. */
export const apiKeyGuardPlugin = new Elysia({ name: "api-key-guard" }).macro({
  apiKey: {
    async resolve({ status, request: { headers } }) {
      const rawKey = extractApiKeyFromHeaders(headers);
      if (!rawKey) return status(401, { error: "API key required" });

      const resolved = await projectApiKeysService.resolveApiKey(rawKey);
      if (!resolved) return status(401, { error: "Invalid API key" });

      return {
        apiKey: resolved,
      };
    },
  },
});
