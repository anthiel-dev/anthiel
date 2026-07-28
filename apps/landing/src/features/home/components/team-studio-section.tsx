import { teamProfiles } from "../team/profiles";
import { TeamStudioPortrait } from "../team/team-studio-portrait";
import { PageSection } from "./page-section";

export function TeamStudioSection() {
  return (
    <PageSection id="team">
      <div
        className="mb-8 flex items-baseline justify-between gap-4"
        data-reveal-item
        data-stagger={1}
      >
        <h2 className="text-xs tracking-wide text-white/50">Studio</h2>
        <p className="text-xxs text-white/35">Jakarta · five people</p>
      </div>

      <ul className="team-studio-list flex flex-col" role="list">
        {teamProfiles.map((profile, index) => (
          <li
            key={profile.id}
            className="team-studio-person flex gap-4 border-b border-white/[0.06] py-6 last:border-b-0 sm:gap-5 sm:py-7"
            data-reveal-item
            data-stagger={index + 2}
          >
            <TeamStudioPortrait
              profile={profile}
              className="aspect-[3/4] w-16 shrink-0 sm:w-[72px]"
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <h3 className="text-sm font-medium tracking-tight text-white/90">{profile.name}</h3>
                <p className="text-xxs text-white/40">{profile.role}</p>
              </div>
              <p className="mt-1 text-xxxs text-white/35">
                {profile.focus}
                <span className="mx-1.5 text-white/15" aria-hidden>
                  ·
                </span>
                {profile.years} years
              </p>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-white/50">{profile.bio}</p>
            </div>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
