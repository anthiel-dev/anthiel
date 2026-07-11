import { createFileRoute } from "@tanstack/react-router";

import { RolesPage } from "#features/rbac";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/roles")({
  staticData: {
    breadcrumb: "Roles",
  },
  head: () => pageMeta("Roles", "Manage roles"),
  component: RolesPage,
});
