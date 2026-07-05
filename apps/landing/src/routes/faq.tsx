import { createFileRoute } from "@tanstack/react-router";

import { FaqSection } from "#features/home/components/faq-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq")({
  head: () => pageMeta("FAQ — Anthiel", "Learn more about Anthiel and get in touch."),
  component: FaqPage,
});

function FaqPage() {
  return (
    <PageLayout>
      <FaqSection />
    </PageLayout>
  );
}
