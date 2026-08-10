import { DEFAULT_LOCALE, isLocale, type Locale } from "#i18n";

/** Derive active locale from a pathname like `/`, `/id`, `/zh`. */
export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.replace(/\/+$/, "").split("/").filter(Boolean)[0];
  if (isLocale(segment) && segment !== DEFAULT_LOCALE) return segment;
  return DEFAULT_LOCALE;
}
