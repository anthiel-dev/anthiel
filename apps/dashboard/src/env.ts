import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BETTER_AUTH_URL: z.string().url().default("http://localhost:3002"),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
