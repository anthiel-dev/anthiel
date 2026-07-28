import { teamProfiles } from "../team/profiles";
import { TeamStudioPortrait } from "../team/team-studio-portrait";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function TeamGridSection() {
  return (
    <PageSection id="team">
      <SectionHeader
        title="Team"
        description="Faces behind Anthiel — small, senior, hands-on."
        className="mb-8"
        revealStagger={1}
      />
      <ul
        className="team-grid grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10"
        role="list"
      >
        {teamProfiles.map((profile, index) => (
          <li
            key={profile.id}
            className="team-grid-person group"
            data-reveal-item
            data-stagger={index + 2}
          >
            <TeamStudioPortrait
              profile={profile}
              className="team-grid-portrait aspect-[3/4] w-20 rounded-lg sm:w-24"
            />
            <div className="mt-2.5">
              <h3 className="text-sm font-medium tracking-tight text-white/90 transition-colors duration-150 ease-out group-hover:text-white">
                {profile.name}
              </h3>
              <p className="mt-0.5 text-xxs text-white/45 transition-colors duration-150 ease-out group-hover:text-white/60">
                {profile.role}
              </p>
              <p className="mt-2 text-xxxs text-white/30 transition-colors duration-150 ease-out group-hover:text-white/45">
                {profile.focus}
                <span className="mx-1.5 text-white/15" aria-hidden>
                  ·
                </span>
                {profile.years} yrs
              </p>
            </div>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
