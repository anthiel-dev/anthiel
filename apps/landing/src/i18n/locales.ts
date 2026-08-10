export const LOCALES = ["en", "id", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "anthiel.locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** BCP 47 tags for <html lang> and hreflang. */
export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en",
  id: "id",
  zh: "zh-Hans",
};

/** Open Graph locale tags. */
export const LOCALE_OG: Record<Locale, string> = {
  en: "en_US",
  id: "id_ID",
  zh: "zh_CN",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  id: "ID",
  zh: "中文",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "id" || value === "zh";
}

/** Map Accept-Language / navigator tags to a supported locale. */
export function resolveLocale(input: string | undefined | null): Locale {
  if (!input) return DEFAULT_LOCALE;

  const tags = input
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter((tag): tag is string => Boolean(tag));

  for (const tag of tags) {
    if (tag === "id" || tag.startsWith("id-")) return "id";
    if (tag === "zh" || tag.startsWith("zh-")) return "zh";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return DEFAULT_LOCALE;
}

/** URL path for a locale. English is unprefixed. */
export function localePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

export function parseLocaleParam(value: string | undefined): Locale | null {
  if (value === undefined || value === "") return DEFAULT_LOCALE;
  if (!isLocale(value)) return null;
  return value;
}
