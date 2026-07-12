import { createFileRoute } from "@tanstack/react-router";

import { requireAdmin } from "#/lib/auth-guards";
import { BusinessesPage } from "#features/businesses";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/businesses")({
  staticData: {
    breadcrumb: "Businesses",
  },
  beforeLoad: async ({ location }) =>
    requireAdmin({ pathname: location.pathname, searchStr: location.searchStr }),
  head: () => pageMeta("Businesses", "Manage businesses"),
  component: BusinessesPage,
});
