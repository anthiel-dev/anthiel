import { createFileRoute } from "@tanstack/react-router";

import { FaqSpotlightSection } from "#features/home/components/faq-spotlight-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq/5")({
  head: () =>
    pageMeta(
      "FAQ — Spotlight — Anthiel",
      "One Anthiel question at a time, with a soft answer swap.",
    ),
  component: FaqSpotlightPage,
});

function FaqSpotlightPage() {
  return (
    <PageLayout>
      <FaqSpotlightSection />
    </PageLayout>
  );
}
