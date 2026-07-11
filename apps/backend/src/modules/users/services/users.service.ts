import { and, eq, ne } from "drizzle-orm";

import type { AppDb } from "@/database";

import { auth } from "@/core/auth";
import { businesses, roles, user as userTable } from "@/database/schema";
import { ROLE } from "@/modules/rbac";

import type { CreateUserBody, UpdateUserBody } from "../contracts/request.contract";
import type { UserDto } from "../contracts/response.contract";

type UserWithRelations = typeof userTable.$inferSelect & {
  assignedRole: typeof roles.$inferSelect | null;
  business: { id: string; name: string } | null;
};

type UserMutationError =
  | "business_not_found"
  | "business_required"
  | "cannot_remove_last_admin"
  | "email_taken"
  | "role_not_found"
  | "user_not_found"
  | "username_taken";

type UserMutationResult = { data: UserDto } | { error: UserMutationError };

type DeleteUserResult =
  | { success: true }
  | { error: "cannot_delete_self" | "cannot_remove_last_admin" | "user_not_found" };

export class UsersService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listUsers(): Promise<UserDto[]> {
    const rows = await this.deps.db.query.user.findMany({
      with: {
        assignedRole: true,
        business: { columns: { id: true, name: true } },
      },
      orderBy: (table, { asc }) => [asc(table.name), asc(table.email)],
    });

    return rows.map((row) => this.toDto(row as UserWithRelations));
  }

  async getUserById(id: string): Promise<UserDto | null> {
    const row = await this.findUserById(id);
    return row ? this.toDto(row) : null;
  }

  async createUser(input: CreateUserBody): Promise<UserMutationResult> {
    const role = await this.findRoleById(input.roleId);
    if (!role) return { error: "role_not_found" };

    const businessId = await this.resolveBusinessId(role.key, input.businessId);
    if (!businessId.ok) return { error: businessId.error };

    const existingEmail = await this.deps.db.query.user.findFirst({
      where: eq(userTable.email, input.email),
      columns: { id: true },
    });
    if (existingEmail) return { error: "email_taken" };

    const existingUsername = await this.deps.db.query.user.findFirst({
      where: eq(userTable.username, input.username),
      columns: { id: true },
    });
    if (existingUsername) return { error: "username_taken" };

    const created = await auth.api.createUser({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        data: {
          username: input.username,
          displayUsername: input.username,
        },
      },
    });

    await this.deps.db
      .update(userTable)
      .set({
        role: role.key,
        roleId: role.id,
        username: input.username,
        displayUsername: input.username,
        businessId: businessId.businessId,
      })
      .where(eq(userTable.id, created.user.id));

    const user = await this.findUserById(created.user.id);
    if (!user) return { error: "user_not_found" };

    return { data: this.toDto(user) };
  }

  async updateUser(
    id: string,
    input: UpdateUserBody,
    headers: Headers,
  ): Promise<UserMutationResult> {
    const existingUser = await this.findUserById(id);
    if (!existingUser) return { error: "user_not_found" };

    const role = input.roleId ? await this.findRoleById(input.roleId) : undefined;
    if (input.roleId && !role) return { error: "role_not_found" };
    if (
      role &&
      role.key !== ROLE.admin &&
      existingUser.role === ROLE.admin &&
      (await this.isLastAdmin())
    ) {
      return { error: "cannot_remove_last_admin" };
    }

    const nextRoleKey = role?.key ?? existingUser.role;
    const businessIdInput =
      input.businessId !== undefined ? input.businessId : existingUser.businessId;

    if (nextRoleKey === ROLE.client) {
      const businessId = await this.resolveBusinessId(ROLE.client, businessIdInput);
      if (!businessId.ok) return { error: businessId.error };
    }

    if (input.email) {
      const emailOwner = await this.deps.db.query.user.findFirst({
        where: and(eq(userTable.email, input.email), ne(userTable.id, id)),
        columns: { id: true },
      });
      if (emailOwner) return { error: "email_taken" };
    }

    if (input.username) {
      const usernameOwner = await this.deps.db.query.user.findFirst({
        where: and(eq(userTable.username, input.username), ne(userTable.id, id)),
        columns: { id: true },
      });
      if (usernameOwner) return { error: "username_taken" };
    }

    if (input.password) {
      await auth.api.setUserPassword({
        body: {
          userId: id,
          newPassword: input.password,
        },
        headers,
      });
    }

    const changes: {
      displayUsername?: string;
      email?: string;
      name?: string;
      role?: string;
      roleId?: string;
      username?: string;
      businessId?: string | null;
    } = {};

    if (input.name !== undefined) changes.name = input.name;
    if (input.email !== undefined) changes.email = input.email;
    if (input.username !== undefined) {
      changes.username = input.username;
      changes.displayUsername = input.username;
    }
    if (role) {
      changes.role = role.key;
      changes.roleId = role.id;
    }

    if (nextRoleKey === ROLE.admin) {
      if (input.businessId !== undefined || role?.key === ROLE.admin) {
        changes.businessId = null;
      }
    } else if (input.businessId !== undefined || role?.key === ROLE.client) {
      const resolved = await this.resolveBusinessId(ROLE.client, businessIdInput);
      if (resolved.ok) {
        changes.businessId = resolved.businessId;
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.deps.db.update(userTable).set(changes).where(eq(userTable.id, id));
    }

    const user = await this.findUserById(id);
    if (!user) return { error: "user_not_found" };

    return { data: this.toDto(user) };
  }

  async deleteUser(id: string, currentUserId: string): Promise<DeleteUserResult> {
    if (id === currentUserId) return { error: "cannot_delete_self" };

    const existingUser = await this.findUserById(id);
    if (!existingUser) return { error: "user_not_found" };
    if (existingUser.role === ROLE.admin && (await this.isLastAdmin())) {
      return { error: "cannot_remove_last_admin" };
    }

    const deleted = await this.deps.db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning({ id: userTable.id });

    if (deleted.length === 0) return { error: "user_not_found" };
    return { success: true };
  }

  private async resolveBusinessId(
    roleKey: string,
    businessId: string | null | undefined,
  ): Promise<
    | { ok: true; businessId: string | null }
    | { ok: false; error: "business_required" | "business_not_found" }
  > {
    if (roleKey !== ROLE.client) return { ok: true, businessId: null };
    if (!businessId) return { ok: false, error: "business_required" };

    const business = await this.deps.db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
      columns: { id: true },
    });
    if (!business) return { ok: false, error: "business_not_found" };
    return { ok: true, businessId: business.id };
  }

  private findUserById(id: string): Promise<UserWithRelations | undefined> {
    return this.deps.db.query.user.findFirst({
      where: eq(userTable.id, id),
      with: {
        assignedRole: true,
        business: { columns: { id: true, name: true } },
      },
    }) as Promise<UserWithRelations | undefined>;
  }

  private findRoleById(id: string) {
    return this.deps.db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
  }

  private async isLastAdmin(): Promise<boolean> {
    const admins = await this.deps.db.query.user.findMany({
      where: eq(userTable.role, ROLE.admin),
      columns: { id: true },
      limit: 2,
    });

    return admins.length === 1;
  }

  private toDto(row: UserWithRelations): UserDto {
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      emailVerified: row.emailVerified,
      image: row.image,
      roleId: row.roleId,
      role: row.assignedRole
        ? {
            id: row.assignedRole.id,
            key: row.assignedRole.key,
            name: row.assignedRole.name,
          }
        : null,
      businessId: row.businessId,
      business: row.business
        ? {
            id: row.business.id,
            name: row.business.name,
          }
        : null,
      status: row.banned ? "banned" : "active",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
