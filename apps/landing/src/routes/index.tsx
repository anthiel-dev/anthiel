import { createFileRoute } from "@tanstack/react-router";

import { IntroSection } from "#features/home/components/intro-section";
import { PageLayout } from "#features/home/components/page-layout";
import { WorkSection } from "#features/home/components/work-section";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Anthiel",
      "A collective of software engineers in Jakarta. We help founders go from 0 → 1.",
    ),
  component: HomePage,
});

function HomePage() {
  return (
    <PageLayout>
      <IntroSection />
      <WorkSection />
    </PageLayout>
  );
}
