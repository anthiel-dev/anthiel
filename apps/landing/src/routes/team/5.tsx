import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "#features/home/components/page-layout";
import { TeamGridSection } from "#features/home/components/team-grid-section";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/team/5")({
  head: () =>
    pageMeta("Team — Anthiel", "Meet the Anthiel team — a small senior collective in Jakarta."),
  component: TeamGridPage,
});

function TeamGridPage() {
  return (
    <PageLayout>
      <TeamGridSection />
    </PageLayout>
  );
}
