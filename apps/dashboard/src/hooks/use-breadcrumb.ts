import { useMatches } from "@tanstack/react-router";

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    breadcrumb?: string;
  }
}

/** Builds breadcrumb crumbs from matched routes that declare `staticData.breadcrumb`. */
export function useBreadcrumb(): BreadcrumbCrumb[] {
  return useMatches({
    select: (matches) => {
      const withCrumb = matches.filter((match) => Boolean(match.staticData.breadcrumb));

      return withCrumb.map((match, index) => {
        const label = match.staticData.breadcrumb!;
        const isLast = index === withCrumb.length - 1;

        return {
          label,
          href: isLast ? undefined : match.pathname,
        };
      });
    },
  });
}
