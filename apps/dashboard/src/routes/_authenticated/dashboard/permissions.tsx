import { createFileRoute } from "@tanstack/react-router";

import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/permissions")({
  head: () => pageMeta("Permissions", "Manage permissions"),
  component: PermissionsPage,
});

function PermissionsPage() {
  return null;
}
