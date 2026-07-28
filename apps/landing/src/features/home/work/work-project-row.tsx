import { ArrowUpRight } from "lucide-react";

import type { WorkProject } from "./types";

export function WorkProjectRow({ number, title, year, description, href }: WorkProject) {
  const content = (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="inline-flex items-center gap-2 font-heading text-sm font-medium tracking-tight text-white/90 transition-colors duration-150 ease-out group-hover:text-white">
          <span className="tabular-nums text-white/35 transition-colors duration-150 ease-out group-hover:text-white/50">
            {String(number).padStart(2, "0")}
          </span>
          <span className="min-w-0">{title}</span>
          {href ? (
            <ArrowUpRight
              className="size-3 shrink-0 text-white/30 transition-[color,transform] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-500"
              strokeWidth={1.5}
              aria-hidden
            />
          ) : null}
        </h3>
        <time
          className="shrink-0 text-xxs tabular-nums text-white/35 transition-colors duration-150 ease-out group-hover:text-white/50"
          dateTime={year}
        >
          {year}
        </time>
      </div>
      <p className="mt-2 max-w-xl text-xxs leading-relaxed text-white/55 transition-colors duration-150 ease-out group-hover:text-white/70">
        {description}
      </p>
    </>
  );

  return (
    <li className="work-project group border-b border-white/[0.06] py-5 first:pt-0 last:border-b-0 last:pb-0">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block outline-none transition-transform duration-160 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}
