import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

import { betterAuthPlugin } from "./core/better-auth.plugin";
import { env } from "./env";

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposeHeaders: ["Set-Cookie"],
    }),
  )
  .use(betterAuthPlugin)
  .get("/", () => ({
    ok: true,
    service: "anthiel-backend",
  }))
  .get(
    "/me",
    ({ user }) => ({
      user,
    }),
    {
      auth: true,
    },
  )
  .get(
    "/admin/health",
    () => ({
      ok: true,
      scope: "admin",
    }),
    {
      admin: true,
    },
  );

export type App = typeof app;
