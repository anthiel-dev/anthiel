/**
 * Seed catalog for Anthiel RBAC. Keys must stay stable across seeds.
 */
export const RESOURCE_CATALOG = {
  user: {
    key: "user",
    name: "User",
    description: "User administration",
    actions: [
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
  },
  session: {
    key: "session",
    name: "Session",
    description: "Session management",
    actions: ["list", "revoke", "delete"],
  },
  dashboard: {
    key: "dashboard",
    name: "Dashboard",
    description: "Dashboard access",
    actions: ["access"],
  },
} as const;

export type ResourceKey = keyof typeof RESOURCE_CATALOG;

export function permissionKey(resource: string, action: string): string {
  return `${resource}.${action}`;
}

export const ROLE = {
  admin: "admin",
  client: "client",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
export type RoleName = Role;

export const ROLE_CATALOG = {
  admin: {
    key: ROLE.admin,
    name: "Admin",
    description: "Full access to user admin, sessions, and the dashboard.",
    permissions: {
      user: [...RESOURCE_CATALOG.user.actions],
      session: [...RESOURCE_CATALOG.session.actions],
      dashboard: [...RESOURCE_CATALOG.dashboard.actions],
    },
  },
  client: {
    key: ROLE.client,
    name: "Client",
    description: "Standard access limited to the dashboard.",
    permissions: {
      user: [] as const,
      session: [] as const,
      dashboard: ["access"] as const,
    },
  },
} as const satisfies Record<
  RoleName,
  {
    key: RoleName;
    name: string;
    description: string;
    permissions: { [K in ResourceKey]: readonly (typeof RESOURCE_CATALOG)[K]["actions"][number][] };
  }
>;

export function hasRole(userRole: string | string[] | null | undefined, role: Role): boolean {
  if (!userRole) return false;
  const roles = Array.isArray(userRole) ? userRole : userRole.split(",");
  return roles.map((value) => value.trim()).includes(role);
}

export function isAdmin(userRole: string | string[] | null | undefined): boolean {
  return hasRole(userRole, ROLE.admin);
}
