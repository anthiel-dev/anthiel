/** Normalize Better Auth role (string | string[]) into a comma-joined string. */
export function normalizeRole(role: unknown): string | null {
  if (typeof role === "string") return role;
  if (Array.isArray(role)) return role.join(",");
  return null;
}

function roleIncludes(role: unknown, key: string): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return normalized
    .split(",")
    .map((value) => value.trim())
    .includes(key);
}

export function isAdminRole(role: unknown): boolean {
  return roleIncludes(role, "admin");
}

export function isStaffRole(role: unknown): boolean {
  return roleIncludes(role, "staff");
}

/** Admin or staff — can use manage features. Does not bypass invoice project scope. */
export function canManageRole(role: unknown): boolean {
  return isAdminRole(role) || isStaffRole(role);
}

/** Default landing path after sign-in for the given role. */
export function getAppHome(role: unknown): "/dashboard" | "/dashboard/invoices" {
  return canManageRole(role) ? "/dashboard" : "/dashboard/invoices";
}
