import { createFileRoute } from "@tanstack/react-router";

import { ContactEmailSection } from "#features/home/components/contact-email-section";
import { FaqSection } from "#features/home/components/faq-section";
import { IntroSection } from "#features/home/components/intro-section";
import { PageLayout } from "#features/home/components/page-layout";
import { WorkSection } from "#features/home/components/work-section";
import { faqPageJsonLd } from "#lib/faq-json-ld";
import { pageMeta } from "#lib/page-meta";
import { SITE_DESCRIPTION, SITE_NAME } from "#lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      path: "/",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(faqPageJsonLd()),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PageLayout showTeamPhoto>
      <IntroSection />
      <WorkSection />
      <FaqSection />
      <ContactEmailSection />
    </PageLayout>
  );
}
