import type { TeamProfile } from "./profiles";

type TeamMemberRowProps = Pick<TeamProfile, "name" | "role" | "years" | "bio"> & {
  number: number;
};

export function TeamMemberRow({ number, name, role, years, bio }: TeamMemberRowProps) {
  return (
    <li className="team-member group border-b border-white/[0.06] py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="inline-flex items-center gap-2 font-heading text-sm font-medium tracking-tight text-white/90 transition-colors duration-150 ease-out group-hover:text-white">
          <span className="tabular-nums text-white/35 transition-colors duration-150 ease-out group-hover:text-white/50">
            {String(number).padStart(2, "0")}
          </span>
          <span className="min-w-0">{name}</span>
        </h3>
        <span className="shrink-0 text-xxs tabular-nums text-white/35 transition-colors duration-150 ease-out group-hover:text-white/50">
          {years} yrs
        </span>
      </div>
      <p className="mt-2 max-w-xl text-xxs leading-relaxed text-white/55 transition-colors duration-150 ease-out group-hover:text-white/70">
        <span className="text-white/70 transition-colors duration-150 ease-out group-hover:text-white/85">
          {role}.
        </span>{" "}
        {bio}
      </p>
    </li>
  );
}
