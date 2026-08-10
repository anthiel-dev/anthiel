import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { preferredLocaleFromDevice, readLocaleCookie } from "./cookie";
import { DEFAULT_LOCALE, type Locale } from "./locales";

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|redditbot|whatsapp|telegrambot|applebot|duckduckbot|yandex|baidu|sogou|exabot|facebot|ia_archiver/i;

function isBotUserAgent() {
  if (typeof navigator === "undefined") return true;
  return BOT_UA.test(navigator.userAgent);
}

/**
 * On first visit to the default (English) homepage with no locale cookie,
 * redirect once to the device-preferred locale when it is id or zh.
 * Explicit `/id` and `/zh` URLs are never overridden.
 */
export function LocaleRedirect({ locale }: { locale: Locale }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (locale !== DEFAULT_LOCALE) return;
    if (readLocaleCookie()) return;
    if (isBotUserAgent()) return;

    const preferred = preferredLocaleFromDevice();
    if (preferred === DEFAULT_LOCALE) return;

    void navigate({
      to: "/{-$locale}",
      params: { locale: preferred },
      replace: true,
    });
  }, [locale, navigate]);

  return null;
}
