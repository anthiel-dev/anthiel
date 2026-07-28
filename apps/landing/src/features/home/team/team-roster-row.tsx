import { cn } from "#lib/utils";

import type { TeamMember } from "./types";

interface TeamRosterRowProps {
  member: TeamMember;
  stagger: number;
}

export function TeamRosterRow({ member, stagger }: TeamRosterRowProps) {
  const initial = member.name.charAt(0);

  return (
    <li
      className="team-roster-person relative border-b border-white/[0.04] last:border-b-0"
      data-reveal-item
      data-stagger={stagger}
    >
      <div
        className={cn(
          "group flex w-full items-center gap-4 py-5 text-left sm:gap-6 sm:py-6",
          "outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-orange-500/50",
        )}
        tabIndex={0}
      >
        <span
          className="team-roster-mark flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[13px] text-white/40 sm:size-10"
          aria-hidden
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="team-roster-name block font-display text-[28px] font-normal tracking-tight text-white/70 sm:text-[34px]">
            {member.name}
          </span>
          <span className="team-roster-detail mt-1 flex items-center gap-2 text-xxs text-white/50">
            <span>{member.role}</span>
            <span className="text-white/20" aria-hidden>
              ·
            </span>
            <span>{member.years} yrs</span>
          </span>
          <span className="team-roster-rule mt-3 block h-px w-16 bg-orange-500/80" aria-hidden />
        </span>
      </div>
    </li>
  );
}
