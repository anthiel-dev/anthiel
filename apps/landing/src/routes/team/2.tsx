import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "#features/home/components/page-layout";
import { TeamRosterSection } from "#features/home/components/team-roster-section";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/team/2")({
  head: () =>
    pageMeta(
      "People — Anthiel",
      "The team behind Anthiel. A small collective of senior engineers in Jakarta.",
    ),
  component: TeamRosterPage,
});

function TeamRosterPage() {
  return (
    <PageLayout>
      <TeamRosterSection />
    </PageLayout>
  );
}
