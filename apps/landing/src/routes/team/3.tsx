import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "#features/home/components/page-layout";
import { TeamStudioSection } from "#features/home/components/team-studio-section";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/team/3")({
  head: () =>
    pageMeta({
      title: "Studio — Anthiel",
      description: "Meet the Anthiel studio — a small senior team in Jakarta building from 0 → 1.",
      path: "/team/3",
      noIndex: true,
    }),
  component: TeamStudioPage,
});

function TeamStudioPage() {
  return (
    <PageLayout>
      <TeamStudioSection />
    </PageLayout>
  );
}
