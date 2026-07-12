import { createFileRoute } from "@tanstack/react-router";

import { requireAdmin } from "#/lib/auth-guards";
import { PermissionsPage } from "#features/rbac";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/permissions")({
  staticData: {
    breadcrumb: "Permissions",
  },
  beforeLoad: async ({ location }) =>
    requireAdmin({ pathname: location.pathname, searchStr: location.searchStr }),
  head: () => pageMeta("Permissions", "Manage permissions"),
  component: PermissionsPage,
});
