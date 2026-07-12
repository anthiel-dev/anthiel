import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const corsOrigins = z
  .string()
  .default("http://localhost:3001")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url()).min(1));

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3002"),
    PORT: z.coerce.number().default(3002),
    CORS_ORIGIN: corsOrigins,
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
