import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { ContactEmailSection } from "#features/home/components/contact-email-section";
import { FaqSection } from "#features/home/components/faq-section";
import { IntroSection } from "#features/home/components/intro-section";
import { PageLayout } from "#features/home/components/page-layout";
import { WorkSection } from "#features/home/components/work-section";
import {
  DEFAULT_LOCALE,
  LocaleProvider,
  LocaleRedirect,
  getMessages,
  localePath,
  parseLocaleParam,
  type Locale,
} from "#i18n";
import { faqPageJsonLd } from "#lib/faq-json-ld";
import { organizationJsonLd, pageMeta, websiteJsonLd } from "#lib/page-meta";

export const Route = createFileRoute("/{-$locale}/")({
  beforeLoad: ({ params }) => {
    const parsed = parseLocaleParam(params.locale);
    if (parsed === null) throw notFound();
    if (params.locale === "en") {
      throw redirect({ to: "/{-$locale}", replace: true });
    }
    return { locale: parsed };
  },
  head: ({ params }) => {
    const locale = parseLocaleParam(params.locale) ?? DEFAULT_LOCALE;
    const messages = getMessages(locale);
    const path = localePath(locale);

    return {
      ...pageMeta({
        title: messages.meta.title,
        description: messages.meta.description,
        path,
        locale,
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([
            organizationJsonLd(locale),
            websiteJsonLd(locale),
            faqPageJsonLd(locale),
          ]),
        },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const { locale } = Route.useRouteContext() as { locale: Locale };

  return (
    <LocaleProvider locale={locale}>
      <LocaleRedirect locale={locale} />
      <PageLayout showTeamPhoto>
        <IntroSection />
        <WorkSection />
        <FaqSection />
        <ContactEmailSection />
      </PageLayout>
    </LocaleProvider>
  );
}
