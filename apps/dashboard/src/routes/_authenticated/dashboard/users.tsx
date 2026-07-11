import { createFileRoute } from "@tanstack/react-router";

import { UsersPage } from "#features/users";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/users")({
  staticData: {
    breadcrumb: "Users",
  },
  head: () => pageMeta("Users", "Manage users"),
  component: UsersPage,
});
