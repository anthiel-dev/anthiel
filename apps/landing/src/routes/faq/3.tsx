import { createFileRoute } from "@tanstack/react-router";

import { FaqEditorialSection } from "#features/home/components/faq-editorial-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq/3")({
  head: () =>
    pageMeta(
      "FAQ — Editorial — Anthiel",
      "An editorial take on Anthiel questions — numbered, display-led.",
    ),
  component: FaqEditorialPage,
});

function FaqEditorialPage() {
  return (
    <PageLayout>
      <FaqEditorialSection />
    </PageLayout>
  );
}
