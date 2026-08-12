import { createFileRoute, redirect } from "@tanstack/react-router";

import { DEFAULT_LOCALE, parseLocaleParam } from "#i18n";

/** Root → blog index (locale-aware). */
export const Route = createFileRoute("/{-$locale}/")({
  beforeLoad: ({ params }) => {
    const locale = parseLocaleParam(params.locale);
    if (locale === null) {
      throw redirect({ to: "/{-$locale}/blog", replace: true });
    }
    if (params.locale === "en") {
      throw redirect({ to: "/{-$locale}/blog", replace: true });
    }
    throw redirect({
      to: "/{-$locale}/blog",
      params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
      replace: true,
    });
  },
});
