import { createFileRoute } from "@tanstack/react-router";

import { FaqEditorialSection } from "#features/home/components/faq-editorial-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq/3")({
  head: () =>
    pageMeta({
      title: "FAQ — Editorial — Anthiel",
      description: "An editorial take on Anthiel questions — numbered, display-led.",
      path: "/faq/3",
      noIndex: true,
    }),
  component: FaqEditorialPage,
});

function FaqEditorialPage() {
  return (
    <PageLayout>
      <FaqEditorialSection />
    </PageLayout>
  );
}
