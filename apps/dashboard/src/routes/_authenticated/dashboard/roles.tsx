import { createFileRoute } from "@tanstack/react-router";

import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/roles")({
  head: () => pageMeta("Roles", "Manage roles"),
  component: RolesPage,
});

function RolesPage() {
  return null;
}
