import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  resolveLocale,
  type Locale,
} from "./locales";

export function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.split("; ").find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  if (!match) return null;

  const value = match.slice(LOCALE_COOKIE.length + 1);
  return isLocale(value) ? value : null;
}

export function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;

  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function preferredLocaleFromDevice(): Locale {
  const cookie = readLocaleCookie();
  if (cookie) return cookie;

  if (typeof navigator !== "undefined") {
    const fromLanguages = navigator.languages?.join(",") || navigator.language;
    return resolveLocale(fromLanguages);
  }

  return DEFAULT_LOCALE;
}
