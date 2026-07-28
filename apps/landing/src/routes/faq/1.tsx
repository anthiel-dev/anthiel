import { createFileRoute } from "@tanstack/react-router";

import { FaqAccordionSection } from "#features/home/components/faq-accordion-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq/1")({
  head: () =>
    pageMeta(
      "FAQ — Accordion — Anthiel",
      "Common questions about Anthiel, answered in a quiet accordion.",
    ),
  component: FaqAccordionPage,
});

function FaqAccordionPage() {
  return (
    <PageLayout>
      <FaqAccordionSection />
    </PageLayout>
  );
}
