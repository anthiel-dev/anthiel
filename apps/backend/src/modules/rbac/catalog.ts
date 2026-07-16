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
  invoice: {
    key: "invoice",
    name: "Invoice",
    description: "Invoice management",
    actions: ["list", "get", "create", "update", "delete"],
  },
  business: {
    key: "business",
    name: "Business",
    description: "Business (client company) administration",
    actions: ["list", "get", "create", "update", "delete"],
  },
  project: {
    key: "project",
    name: "Project",
    description: "Project administration and membership",
    actions: ["list", "get", "create", "update", "delete", "manage-members"],
  },
  "payment-method": {
    key: "payment-method",
    name: "Payment method",
    description: "Payment method administration",
    actions: ["list", "get", "create", "update", "delete"],
  },
} as const;

export type ResourceKey = keyof typeof RESOURCE_CATALOG;

export function permissionKey(resource: string, action: string): string {
  return `${resource}.${action}`;
}

export const ROLE = {
  admin: "admin",
  staff: "staff",
  client: "client",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
export type RoleName = Role;

export const ROLE_CATALOG = {
  admin: {
    key: ROLE.admin,
    name: "Admin",
    description: "Full access to every resource and action.",
    permissions: {
      user: [...RESOURCE_CATALOG.user.actions],
      session: [...RESOURCE_CATALOG.session.actions],
      dashboard: [...RESOURCE_CATALOG.dashboard.actions],
      invoice: [...RESOURCE_CATALOG.invoice.actions],
      business: [...RESOURCE_CATALOG.business.actions],
      project: [...RESOURCE_CATALOG.project.actions],
      "payment-method": [...RESOURCE_CATALOG["payment-method"].actions],
    },
  },
  staff: {
    key: ROLE.staff,
    name: "Staff",
    description: "Full manage access; invoices are limited to projects they are assigned to.",
    permissions: {
      user: [...RESOURCE_CATALOG.user.actions],
      session: [...RESOURCE_CATALOG.session.actions],
      dashboard: [...RESOURCE_CATALOG.dashboard.actions],
      invoice: [...RESOURCE_CATALOG.invoice.actions],
      business: [...RESOURCE_CATALOG.business.actions],
      project: [...RESOURCE_CATALOG.project.actions],
      "payment-method": [...RESOURCE_CATALOG["payment-method"].actions],
    },
  },
  client: {
    key: ROLE.client,
    name: "Client",
    description: "Invoice and project access for assigned memberships only.",
    permissions: {
      user: [] as const,
      session: [] as const,
      dashboard: [] as const,
      invoice: ["list", "get"] as const,
      business: [] as const,
      project: ["list", "get"] as const,
      "payment-method": [] as const,
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

export function isStaff(userRole: string | string[] | null | undefined): boolean {
  return hasRole(userRole, ROLE.staff);
}

/** Admin or staff — can use manage features. Does not bypass invoice project scope. */
export function canManage(userRole: string | string[] | null | undefined): boolean {
  return isAdmin(userRole) || isStaff(userRole);
}

/** Only admins bypass project membership filters on invoices. */
export function bypassesInvoiceScope(userRole: string | string[] | null | undefined): boolean {
  return isAdmin(userRole);
}
