import { createAccessControl } from "better-auth/plugins/access";

/**
 * Permission statements for Anthiel RBAC.
 * Extends better-auth admin defaults with app-level resources as needed.
 */
export const statement = {
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  dashboard: ["access"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  dashboard: ["access"],
});

export const user = ac.newRole({
  user: [],
  session: [],
  dashboard: ["access"],
});

export const roles = {
  admin,
  user,
} as const;

export type RoleName = keyof typeof roles;
