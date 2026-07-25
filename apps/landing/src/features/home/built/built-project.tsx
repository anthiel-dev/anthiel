import { ArrowUpRight } from "lucide-react";

import type { BuiltProject } from "./types";

export function BuiltProjectCard({ title, description, href, image, tag }: BuiltProject) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="built-project group block rounded-xl outline-none transition-transform duration-160 ease-out active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <img
          src={image}
          alt=""
          className="built-project-image absolute inset-0 size-full object-cover object-top grayscale"
          draggable={false}
        />
        <div
          className="built-project-shade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-sm font-medium tracking-tight text-white/90 transition-colors duration-150 ease-out group-hover:text-white">
              {title}
            </h3>
            {tag ? (
              <span className="text-xxs text-white/35 transition-colors duration-150 ease-out group-hover:text-white/50">
                {tag}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xxs text-white/55 transition-colors duration-150 ease-out group-hover:text-white/70">
            {description}
          </p>
        </div>
        <ArrowUpRight
          className="mt-0.5 size-3.5 shrink-0 text-white/35 transition-[color,transform] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-500"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    </a>
  );
}
