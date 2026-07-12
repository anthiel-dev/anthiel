import { createFileRoute } from "@tanstack/react-router";

import { requireAdmin } from "#/lib/auth-guards";
import { UsersPage } from "#features/users";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/users")({
  staticData: {
    breadcrumb: "Users",
  },
  beforeLoad: async ({ location }) =>
    requireAdmin({ pathname: location.pathname, searchStr: location.searchStr }),
  head: () => pageMeta("Users", "Manage users"),
  component: UsersPage,
});
