import { Elysia } from "elysia";
import { z } from "zod";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";

import { roleIdParamsSchema, updateRolePermissionBodySchema } from "../contracts/request.contract";
import {
  getRoleResponseSchema,
  listPermissionsResponseSchema,
  listResourcesResponseSchema,
  listRolesResponseSchema,
  rbacErrorResponseSchema,
  updateRolePermissionResponseSchema,
} from "../contracts/response.contract";
import { RbacService } from "../services/rbac.service";

export const rbacRoutes = (db: AppDb) => {
  const rbacService = new RbacService({ db });

  return new Elysia({ prefix: "/rbac", name: "rbac", tags: ["RBAC"] })
    .use(authGuardPlugin)
    .get(
      "/me/permissions",
      async ({ user }) => ({
        data: await rbacService.listPermissionKeysForUser(user.id),
      }),
      {
        auth: true,
        response: z.object({
          data: z.array(z.string()),
        }),
        detail: {
          summary: "List current user permission keys",
          operationId: "listMyPermissions",
        },
      },
    )
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
          404: rbacErrorResponseSchema,
        },
        detail: {
          summary: "Get role by id",
          operationId: "getRoleById",
        },
      },
    )
    .patch(
      "/roles/:id/permissions",
      async ({ params, body, status }) => {
        const result = await rbacService.updateRolePermission(params.id, body);

        if ("error" in result) {
          if (result.error === "role_not_found") {
            return status(404, { error: "Role not found" });
          }
          return status(404, { error: "Permission not found" });
        }

        return { data: result.data };
      },
      {
        admin: true,
        params: roleIdParamsSchema,
        body: updateRolePermissionBodySchema,
        response: {
          200: updateRolePermissionResponseSchema,
          404: rbacErrorResponseSchema,
        },
        detail: {
          summary: "Grant or revoke a permission on a role",
          operationId: "updateRolePermission",
        },
      },
    );
};
