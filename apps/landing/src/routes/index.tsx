import { createFileRoute } from "@tanstack/react-router";

import { IntroSection } from "#features/home/components/intro-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Anthiel", "Anthiel landing page"),
  component: HomePage,
});

function HomePage() {
  return (
    <PageLayout>
      <IntroSection />
    </PageLayout>
  );
}
