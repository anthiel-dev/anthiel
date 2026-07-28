import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, THEME_COLOR } from "#lib/site";

type PageMetaOptions = {
  title: string;
  description: string;
  /** Path including leading slash. Defaults to "/". */
  path?: string;
  image?: string;
  /** Hide experiment / thin variants from search indexes. */
  noIndex?: boolean;
};

/**
 * Shared title, description, canonical, Open Graph, and Twitter meta for routes.
 */
export function pageMeta({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: PageMetaOptions) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const ogImage = image ?? `${SITE_URL}/og.png`;

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
      { property: "og:locale", content: "en_US" },
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
    links: [{ rel: "canonical", href: url }],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo512.png`,
    description: SITE_DESCRIPTION,
    email: "hi@an-thiel.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
    areaServed: ["Batam", "Jakarta", "Indonesia"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
