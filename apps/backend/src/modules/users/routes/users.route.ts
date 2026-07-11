import { Elysia } from "elysia";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";

import {
  createUserBodySchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from "../contracts/request.contract";
import {
  deleteUserResponseSchema,
  getUserResponseSchema,
  listUsersResponseSchema,
  userErrorResponseSchema,
} from "../contracts/response.contract";
import { UsersService } from "../services/users.service";

export const usersRoutes = (db: AppDb) => {
  const usersService = new UsersService({ db });

  return new Elysia({ prefix: "/users", name: "users", tags: ["Users"] })
    .use(authGuardPlugin)
    .get(
      "",
      async () => ({
        data: await usersService.listUsers(),
      }),
      {
        admin: true,
        response: listUsersResponseSchema,
        detail: {
          summary: "List users",
          operationId: "listUsers",
        },
      },
    )
    .get(
      "/:id",
      async ({ params, status }) => {
        const user = await usersService.getUserById(params.id);
        if (!user) return status(404, { error: "User not found" });
        return { data: user };
      },
      {
        admin: true,
        params: userIdParamsSchema,
        response: {
          200: getUserResponseSchema,
          404: userErrorResponseSchema,
        },
        detail: {
          summary: "Get user by id",
          operationId: "getUserById",
        },
      },
    )
    .post(
      "",
      async ({ body, status }) => {
        const result = await usersService.createUser(body);

        if ("error" in result) {
          if (result.error === "role_not_found") {
            return status(404, { error: "Role not found" });
          }
          if (result.error === "email_taken") {
            return status(409, { error: "Email is already in use" });
          }
          return status(500, { error: "Created user could not be loaded" });
        }

        return status(201, { data: result.data });
      },
      {
        admin: true,
        body: createUserBodySchema,
        response: {
          201: getUserResponseSchema,
          404: userErrorResponseSchema,
          409: userErrorResponseSchema,
          500: userErrorResponseSchema,
        },
        detail: {
          summary: "Create user",
          operationId: "createUser",
        },
      },
    )
    .patch(
      "/:id",
      async ({ body, params, request, status }) => {
        const result = await usersService.updateUser(params.id, body, request.headers);

        if ("error" in result) {
          if (result.error === "user_not_found") {
            return status(404, { error: "User not found" });
          }
          if (result.error === "role_not_found") {
            return status(404, { error: "Role not found" });
          }
          if (result.error === "cannot_remove_last_admin") {
            return status(409, { error: "The last admin cannot be demoted" });
          }
          return status(409, { error: "Email is already in use" });
        }

        return { data: result.data };
      },
      {
        admin: true,
        params: userIdParamsSchema,
        body: updateUserBodySchema,
        response: {
          200: getUserResponseSchema,
          404: userErrorResponseSchema,
          409: userErrorResponseSchema,
        },
        detail: {
          summary: "Update user",
          operationId: "updateUser",
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, status, user }) => {
        const result = await usersService.deleteUser(params.id, user.id);

        if ("error" in result) {
          if (result.error === "cannot_delete_self") {
            return status(403, { error: "You cannot delete your own user" });
          }
          if (result.error === "cannot_remove_last_admin") {
            return status(409, { error: "The last admin cannot be deleted" });
          }
          return status(404, { error: "User not found" });
        }

        return { success: true as const };
      },
      {
        admin: true,
        params: userIdParamsSchema,
        response: {
          200: deleteUserResponseSchema,
          403: userErrorResponseSchema,
          404: userErrorResponseSchema,
          409: userErrorResponseSchema,
        },
        detail: {
          summary: "Delete user",
          operationId: "deleteUser",
        },
      },
    );
};
