import { createFileRoute } from "@tanstack/react-router";

import { FaqSplitSection } from "#features/home/components/faq-split-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq/2")({
  head: () =>
    pageMeta(
      "FAQ — Split — Anthiel",
      "Browse Anthiel questions in a split list and answer layout.",
    ),
  component: FaqSplitPage,
});

function FaqSplitPage() {
  return (
    <PageLayout>
      <FaqSplitSection />
    </PageLayout>
  );
}
