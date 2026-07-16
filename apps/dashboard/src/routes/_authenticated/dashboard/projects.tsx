import { createFileRoute } from "@tanstack/react-router";

import { requireAdmin } from "#/lib/auth-guards";
import { ProjectsPage } from "#features/projects";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  staticData: {
    breadcrumb: "Projects",
  },
  beforeLoad: async ({ location }) =>
    requireAdmin({ pathname: location.pathname, searchStr: location.searchStr }),
  head: () => pageMeta("Projects", "Manage projects"),
  component: ProjectsPage,
});
