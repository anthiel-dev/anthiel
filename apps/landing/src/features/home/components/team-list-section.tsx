import { teamProfiles } from "../team/profiles";
import { TeamMemberRow } from "../team/team-member-row";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function TeamListSection() {
  return (
    <PageSection id="team">
      <SectionHeader
        title="Team"
        description="The people behind the work."
        className="mb-8"
        revealStagger={1}
      />
      <ol className="team-list m-0 list-none p-0" data-reveal-item data-stagger={2}>
        {teamProfiles.map((profile, index) => (
          <TeamMemberRow
            key={profile.id}
            number={index + 1}
            name={profile.name}
            role={profile.role}
            years={profile.years}
            bio={profile.bio}
          />
        ))}
      </ol>
    </PageSection>
  );
}
