import { createFileRoute, redirect } from "@tanstack/react-router";

import { canManageRole, getAppHome } from "#/lib/roles";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  beforeLoad: ({ context }) => {
    if (!canManageRole(context.session.user.role)) {
      throw redirect({ to: getAppHome(context.session.user.role) });
    }
  },
  head: () => pageMeta("Dashboard", "Anthiel dashboard overview"),
  component: DashboardPage,
});

function DashboardPage() {
  return null;
}
