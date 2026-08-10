import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_BCP47,
  LOCALE_OG,
  getMessages,
  localePath,
  type Locale,
} from "#i18n";
import { SITE_NAME, SITE_URL, THEME_COLOR } from "#lib/site";

type PageMetaOptions = {
  title: string;
  description: string;
  /** Path including leading slash. Defaults to "/". */
  path?: string;
  image?: string;
  /** Hide experiment / thin variants from search indexes. */
  noIndex?: boolean;
  locale?: Locale;
};

function absoluteUrl(path: string) {
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

/**
 * Shared title, description, canonical, Open Graph, Twitter, and hreflang meta.
 */
export function pageMeta({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  locale = DEFAULT_LOCALE,
}: PageMetaOptions) {
  const url = absoluteUrl(path);
  const ogImage = image ?? `${SITE_URL}/og.png`;
  const ogLocale = LOCALE_OG[locale];

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "theme-color", content: THEME_COLOR },
      {
        name: "robots",
        content: noIndex
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      // TanStack head dedupes by `property`, so only one og:locale is possible.
      // Language alternates are covered by hreflang link tags below.
      { property: "og:locale", content: ogLocale },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "canonical", href: url },
      ...LOCALES.map((code) => ({
        rel: "alternate" as const,
        hrefLang: LOCALE_BCP47[code],
        href: absoluteUrl(localePath(code)),
        key: `hreflang-${code}`,
      })),
      {
        rel: "alternate" as const,
        hrefLang: "x-default",
        href: absoluteUrl("/"),
        key: "hreflang-x-default",
      },
    ],
  };
}

export function organizationJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const description = getMessages(locale).meta.description;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo512.png`,
    description,
    email: "hi@an-thiel.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Batam",
      },
      {
        "@type": "City",
        name: "Jakarta",
      },
      {
        "@type": "Country",
        name: "Indonesia",
      },
    ],
  };
}

export function websiteJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const description = getMessages(locale).meta.description;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl(localePath(locale)),
    description,
    inLanguage: LOCALE_BCP47[locale],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
