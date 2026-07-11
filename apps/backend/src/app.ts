import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import * as z from "zod";

import { betterAuthPlugin } from "./core/better-auth.plugin";
import { db } from "./database";
import { env } from "./env";
import { rbacRoutes } from "./modules/rbac";
import { usersRoutes } from "./modules/users";

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposeHeaders: ["Set-Cookie"],
    }),
  )
  .use(
    openapi({
      path: "/openapi",
      documentation: {
        info: {
          title: "Anthiel API",
          version: "0.0.1",
        },
        tags: [
          { name: "Health", description: "Service health" },
          { name: "Auth", description: "Session and identity" },
          { name: "RBAC", description: "Roles, permissions, and resources" },
          { name: "Users", description: "User administration" },
        ],
      },
      mapJsonSchema: {
        zod: (schema: Parameters<typeof z.toJSONSchema>[0]) =>
          z.toJSONSchema(schema, { target: "openapi-3.0" }),
      },
    }),
  )
  .use(betterAuthPlugin)
  .use(rbacRoutes(db))
  .use(usersRoutes(db))
  .get(
    "/",
    () => ({
      ok: true,
      service: "anthiel-backend",
    }),
    {
      response: z.object({
        ok: z.boolean(),
        service: z.string(),
      }),
      detail: {
        summary: "Service root",
        operationId: "getServiceRoot",
        tags: ["Health"],
      },
    },
  )
  .get(
    "/me",
    ({ user }) => ({
      user,
    }),
    {
      auth: true,
      response: z.object({
        user: z.record(z.string(), z.unknown()),
      }),
      detail: {
        summary: "Current session user",
        operationId: "getMe",
        tags: ["Auth"],
      },
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
      response: z.object({
        ok: z.boolean(),
        scope: z.string(),
      }),
      detail: {
        summary: "Admin health check",
        operationId: "getAdminHealth",
        tags: ["Health"],
      },
    },
  );

export type App = typeof app;
