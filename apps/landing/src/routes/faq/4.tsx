import { createFileRoute } from "@tanstack/react-router";

import { FaqStackSection } from "#features/home/components/faq-stack-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/faq/4")({
  head: () =>
    pageMeta({
      title: "FAQ — Stack — Anthiel",
      description: "Stacked FAQ rows that expand in place for Anthiel.",
      path: "/faq/4",
      noIndex: true,
    }),
  component: FaqStackPage,
});

function FaqStackPage() {
  return (
    <PageLayout>
      <FaqStackSection />
    </PageLayout>
  );
}
