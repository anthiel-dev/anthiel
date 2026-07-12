/** Normalize Better Auth role (string | string[]) into a comma-joined string. */
export function normalizeRole(role: unknown): string | null {
  if (typeof role === "string") return role;
  if (Array.isArray(role)) return role.join(",");
  return null;
}

export function isAdminRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return normalized
    .split(",")
    .map((value) => value.trim())
    .includes("admin");
}

/** Default landing path after sign-in for the given role. */
export function getAppHome(role: unknown): "/dashboard" | "/dashboard/invoices" {
  return isAdminRole(role) ? "/dashboard" : "/dashboard/invoices";
}
