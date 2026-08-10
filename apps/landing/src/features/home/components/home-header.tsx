import { Link } from "@tanstack/react-router";

import { DEFAULT_LOCALE, LanguageSwitcher, useLocale } from "#i18n";

export function HomeHeader() {
  const { locale } = useLocale();

  return (
    <header className="flex items-end justify-between px-6 sm:px-10">
      <h1
        className="font-brand text-5xl font-bold leading-none"
        data-reveal-item
        data-revealed="true"
        data-stagger="0"
      >
        <Link to="/{-$locale}" params={{ locale: locale === DEFAULT_LOCALE ? undefined : locale }}>
          anthiel.
        </Link>
      </h1>
      <div data-reveal-item data-revealed="true" data-stagger="0">
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
