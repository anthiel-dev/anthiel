import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "#features/home/components/page-layout";
import { TeamListSection } from "#features/home/components/team-list-section";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/team/4")({
  head: () =>
    pageMeta("Team — Anthiel", "The people behind Anthiel. A small senior team in Jakarta."),
  component: TeamListPage,
});

function TeamListPage() {
  return (
    <PageLayout>
      <TeamListSection />
    </PageLayout>
  );
}
