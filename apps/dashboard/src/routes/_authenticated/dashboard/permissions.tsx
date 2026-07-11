import { createFileRoute } from "@tanstack/react-router";

import { PermissionsPage } from "#features/rbac";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/permissions")({
  staticData: {
    breadcrumb: "Permissions",
  },
  head: () => pageMeta("Permissions", "Manage permissions"),
  component: PermissionsPage,
});
