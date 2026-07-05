import { Link } from "@tanstack/react-router";
import { LinkIcon } from "lucide-react";
import { Fragment } from "react";

import { cn } from "#lib/utils";

export const homeNavLinks = [
  { to: "/team", label: "the team", mobileLabel: "team" },
  { to: "/built", label: "portfolio", mobileLabel: "porto" },
  { to: "/faq", label: "more about us", mobileLabel: "contact" },
] as const;

function SiteNavLinks({
  className,
  revealStaggerStart,
  ...props
}: React.ComponentProps<"div"> & {
  revealStaggerStart?: number;
}) {
  return (
    <div className={cn("flex flex-row items-center gap-2", className)} {...props}>
      {homeNavLinks.map((link, index) => {
        const revealProps =
          revealStaggerStart !== undefined
            ? {
                "data-reveal-item": true,
                "data-stagger": revealStaggerStart + index,
              }
            : {};

        return (
          <Fragment key={link.to}>
            {index > 0 ? (
              <span className="text-xxs text-white/40" aria-hidden {...revealProps}>
                /
              </span>
            ) : null}
            <Link
              to={link.to}
              className="text-xxs text-white/60 transition-colors hover:text-white/80"
              activeProps={{ className: "text-xxs text-white/90" }}
              {...revealProps}
            >
              <span className="md:hidden">{link.mobileLabel}</span>
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}

export function HomeNavLinks({
  className,
  revealStaggerStart,
  ...props
}: {
  className?: string;
  revealStaggerStart?: number;
} & Omit<React.ComponentProps<"div">, "className">) {
  return (
    <nav aria-label="Site pages" className={className}>
      <SiteNavLinks revealStaggerStart={revealStaggerStart} {...props} />
    </nav>
  );
}

export function HomeNav() {
  return (
    <nav aria-label="Site pages" className="mt-10">
      <p
        className="mb-2 flex items-center gap-2 text-xs"
        aria-hidden
        data-reveal-item
        data-stagger="3"
      >
        <LinkIcon className="size-3" />
      </p>
      <SiteNavLinks revealStaggerStart={4} />
    </nav>
  );
}
