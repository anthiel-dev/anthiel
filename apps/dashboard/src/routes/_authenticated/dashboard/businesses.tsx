import { createFileRoute } from "@tanstack/react-router";

import { BusinessesPage } from "#features/businesses";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/businesses")({
  staticData: {
    breadcrumb: "Businesses",
  },
  head: () => pageMeta("Businesses", "Manage businesses"),
  component: BusinessesPage,
});
