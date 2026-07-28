import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3002"),
    /** Public dashboard origin used for invoice share links. */
    DASHBOARD_URL: z.string().url().default("http://localhost:3000"),
    PORT: z.coerce.number().default(3002),
    RESEND_API_KEY: z.string().min(1).optional(),
    /** Verified sender, e.g. `Anthiel <billing@yourdomain.com>`. */
    RESEND_FROM_EMAIL: z.string().min(3).optional(),
    /** Where recipient replies go, e.g. `hi@an-thiel.com`. */
    RESEND_REPLY_TO: z.string().email().optional(),
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
