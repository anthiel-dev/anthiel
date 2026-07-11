import { createFileRoute } from "@tanstack/react-router";

import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => pageMeta("Dashboard", "Anthiel dashboard overview"),
  component: DashboardPage,
});

function DashboardPage() {
  return null;
}
