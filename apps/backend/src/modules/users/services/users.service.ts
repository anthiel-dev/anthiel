import { and, eq, ne } from "drizzle-orm";

import type { AppDb } from "@/database";

import { auth } from "@/core/auth";
import { roles, user as userTable } from "@/database/schema";
import { ROLE } from "@/modules/rbac";

import type { CreateUserBody, UpdateUserBody } from "../contracts/request.contract";
import type { UserDto } from "../contracts/response.contract";

type UserWithRoleRow = typeof userTable.$inferSelect & {
  assignedRole: typeof roles.$inferSelect | null;
};

type UserMutationError =
  | "cannot_remove_last_admin"
  | "email_taken"
  | "role_not_found"
  | "user_not_found";

type UserMutationResult = { data: UserDto } | { error: UserMutationError };

type DeleteUserResult =
  | { success: true }
  | { error: "cannot_delete_self" | "cannot_remove_last_admin" | "user_not_found" };

export class UsersService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listUsers(): Promise<UserDto[]> {
    const rows = await this.deps.db.query.user.findMany({
      with: { assignedRole: true },
      orderBy: (table, { asc }) => [asc(table.name), asc(table.email)],
    });

    return rows.map((row) => this.toDto(row));
  }

  async getUserById(id: string): Promise<UserDto | null> {
    const row = await this.findUserById(id);
    return row ? this.toDto(row) : null;
  }

  async createUser(input: CreateUserBody): Promise<UserMutationResult> {
    const role = await this.findRoleById(input.roleId);
    if (!role) return { error: "role_not_found" };

    const existingUser = await this.deps.db.query.user.findFirst({
      where: eq(userTable.email, input.email),
      columns: { id: true },
    });
    if (existingUser) return { error: "email_taken" };

    const created = await auth.api.createUser({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
    });

    await this.deps.db
      .update(userTable)
      .set({
        role: role.key,
        roleId: role.id,
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

    if (input.email) {
      const emailOwner = await this.deps.db.query.user.findFirst({
        where: and(eq(userTable.email, input.email), ne(userTable.id, id)),
        columns: { id: true },
      });
      if (emailOwner) return { error: "email_taken" };
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
      email?: string;
      name?: string;
      role?: string;
      roleId?: string;
    } = {};

    if (input.name !== undefined) changes.name = input.name;
    if (input.email !== undefined) changes.email = input.email;
    if (role) {
      changes.role = role.key;
      changes.roleId = role.id;
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

  private findUserById(id: string): Promise<UserWithRoleRow | undefined> {
    return this.deps.db.query.user.findFirst({
      where: eq(userTable.id, id),
      with: { assignedRole: true },
    });
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

  private toDto(row: UserWithRoleRow): UserDto {
    return {
      id: row.id,
      name: row.name,
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
      status: row.banned ? "banned" : "active",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
