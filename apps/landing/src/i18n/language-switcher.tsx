import { Link } from "@tanstack/react-router";

import { cn } from "#lib/utils";

import { writeLocaleCookie } from "./cookie";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, type Locale } from "./locales";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <nav aria-label="Language" className="flex items-center gap-1.5 pb-1.5 text-xxs tracking-wide">
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            to="/{-$locale}"
            params={{ locale: code === DEFAULT_LOCALE ? undefined : code }}
            className={cn(
              "px-1 py-0.5 transition-colors duration-150 ease-out active:scale-[0.97]",
              active ? "text-white" : "text-white/35 hover:text-white/70",
            )}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              writeLocaleCookie(code);
            }}
          >
            {LOCALE_LABELS[code]}
          </Link>
        );
      })}
    </nav>
  );
}
