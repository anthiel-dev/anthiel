import { DEFAULT_LOCALE, getFaqs, type Locale } from "#i18n";

export function faqPageJsonLd(locale: Locale = DEFAULT_LOCALE) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getFaqs(locale).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.streamText,
      },
    })),
  };
}
