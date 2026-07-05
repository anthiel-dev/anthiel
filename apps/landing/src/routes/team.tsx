import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "#features/home/components/page-layout";
import { TeamSection } from "#features/home/components/team-section";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/team")({
  head: () => pageMeta("Meet the team — Anthiel", "Meet the Anthiel engineering team."),
  component: TeamPage,
});

function TeamPage() {
  return (
    <PageLayout>
      <TeamSection />
    </PageLayout>
  );
}
