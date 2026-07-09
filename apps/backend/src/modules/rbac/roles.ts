export const ROLE = {
  admin: "admin",
  user: "user",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export function hasRole(userRole: string | string[] | null | undefined, role: Role): boolean {
  if (!userRole) return false;
  const roles = Array.isArray(userRole) ? userRole : userRole.split(",");
  return roles.map((value) => value.trim()).includes(role);
}

export function isAdmin(userRole: string | string[] | null | undefined): boolean {
  return hasRole(userRole, ROLE.admin);
}
