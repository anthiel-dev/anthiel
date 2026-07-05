import { createFileRoute } from "@tanstack/react-router";

import { BuiltSection } from "#features/home/components/built-section";
import { PageLayout } from "#features/home/components/page-layout";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/built")({
  head: () =>
    pageMeta(
      "What we have built — Anthiel",
      "Products and tools Anthiel has shipped for founders.",
    ),
  component: BuiltPage,
});

function BuiltPage() {
  return (
    <PageLayout>
      <BuiltSection />
    </PageLayout>
  );
}
