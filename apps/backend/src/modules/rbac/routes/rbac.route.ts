import { Elysia } from "elysia";
import { z } from "zod";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";

import { roleIdParamsSchema } from "../contracts/request.contract";
import {
  getRoleResponseSchema,
  listPermissionsResponseSchema,
  listResourcesResponseSchema,
  listRolesResponseSchema,
} from "../contracts/response.contract";
import { RbacService } from "../services/rbac.service";

export const rbacRoutes = (db: AppDb) => {
  const rbacService = new RbacService({ db });

  return new Elysia({ prefix: "/rbac", name: "rbac", tags: ["RBAC"] })
    .use(authGuardPlugin)
    .get(
      "/resources",
      async () => ({
        data: await rbacService.listResources(),
      }),
      {
        admin: true,
        response: listResourcesResponseSchema,
        detail: {
          summary: "List resources",
          operationId: "listResources",
        },
      },
    )
    .get(
      "/permissions",
      async () => ({
        data: await rbacService.listPermissions(),
      }),
      {
        admin: true,
        response: listPermissionsResponseSchema,
        detail: {
          summary: "List permissions",
          operationId: "listPermissions",
        },
      },
    )
    .get(
      "/roles",
      async () => ({
        data: await rbacService.listRoles(),
      }),
      {
        admin: true,
        response: listRolesResponseSchema,
        detail: {
          summary: "List roles",
          operationId: "listRoles",
        },
      },
    )
    .get(
      "/roles/:id",
      async ({ params, status }) => {
        const role = await rbacService.getRoleById(params.id);
        if (!role) return status(404, { error: "Role not found" });
        return { data: role };
      },
      {
        admin: true,
        params: roleIdParamsSchema,
        response: {
          200: getRoleResponseSchema,
          404: z.object({ error: z.string() }),
        },
        detail: {
          summary: "Get role by id",
          operationId: "getRoleById",
        },
      },
    );
};
