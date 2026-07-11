import { and, eq } from "drizzle-orm";

import type { AppDb } from "@/database";

import { permissions, rolePermission, roles } from "@/database/schema";

import type {
  PermissionDto,
  ResourceDto,
  RoleDetailDto,
  RoleDto,
} from "../contracts/response.contract";

export class RbacService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listResources(): Promise<ResourceDto[]> {
    const rows = await this.deps.db.query.resources.findMany({
      orderBy: (table, { asc }) => [asc(table.key)],
    });

    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
    }));
  }

  async listPermissions(): Promise<PermissionDto[]> {
    const rows = await this.deps.db.query.permissions.findMany({
      with: {
        resource: true,
        rolePermissions: {
          with: { role: true },
        },
      },
      orderBy: (table, { asc }) => [asc(table.key)],
    });

    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      action: row.action,
      description: row.description,
      resourceId: row.resourceId,
      resourceKey: row.resource.key,
      resourceName: row.resource.name,
      roles: row.rolePermissions.map((link) => link.role.key).sort(),
    }));
  }

  async listRoles(): Promise<RoleDto[]> {
    const roleRows = await this.deps.db.query.roles.findMany({
      with: {
        rolePermissions: {
          with: {
            permission: {
              with: { resource: true },
            },
          },
        },
      },
      orderBy: (table, { asc }) => [asc(table.key)],
    });

    return roleRows.map((row) => {
      const resourceKeys = new Set(row.rolePermissions.map((link) => link.permission.resource.key));

      return {
        id: row.id,
        key: row.key,
        name: row.name,
        description: row.description,
        permissionCount: row.rolePermissions.length,
        resources: [...resourceKeys].sort(),
      };
    });
  }

  async getRoleById(id: string): Promise<RoleDetailDto | null> {
    const row = await this.deps.db.query.roles.findFirst({
      where: eq(roles.id, id),
      with: {
        rolePermissions: {
          with: {
            permission: {
              with: { resource: true },
            },
          },
        },
      },
    });

    if (!row) return null;

    const permissionDtos = row.rolePermissions.map((link) => ({
      id: link.permission.id,
      key: link.permission.key,
      action: link.permission.action,
      description: link.permission.description,
      resourceId: link.permission.resourceId,
      resourceKey: link.permission.resource.key,
      resourceName: link.permission.resource.name,
      roles: [row.key],
    }));

    const resourceKeys = new Set(permissionDtos.map((permission) => permission.resourceKey));

    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      permissionCount: permissionDtos.length,
      resources: [...resourceKeys].sort(),
      permissions: permissionDtos.sort((a, b) => a.key.localeCompare(b.key)),
    };
  }

  async getRoleByKey(key: string) {
    return this.deps.db.query.roles.findFirst({
      where: eq(roles.key, key),
    });
  }

  async userHasPermission(userId: string, permissionKey: string): Promise<boolean> {
    const userRow = await this.deps.db.query.user.findFirst({
      where: (table, { eq: whereEq }) => whereEq(table.id, userId),
      columns: { roleId: true },
    });

    if (!userRow?.roleId) return false;

    const permission = await this.deps.db.query.permissions.findFirst({
      where: eq(permissions.key, permissionKey),
      columns: { id: true },
    });

    if (!permission) return false;

    const link = await this.deps.db.query.rolePermission.findFirst({
      where: and(
        eq(rolePermission.roleId, userRow.roleId),
        eq(rolePermission.permissionId, permission.id),
      ),
    });

    return Boolean(link);
  }
}
