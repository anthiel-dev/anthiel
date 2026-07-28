import { team } from "../team/data";
import { TeamRosterRow } from "../team/team-roster-row";
import { PageSection } from "./page-section";

export function TeamRosterSection() {
  return (
    <PageSection id="team">
      <div
        className="mb-10 flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-4"
        data-reveal-item
        data-stagger={1}
      >
        <h2 className="text-xs tracking-wide text-white/50">People</h2>
        <p className="text-xs text-white/40">Five. Senior. Hands-on.</p>
      </div>

      <ul className="team-roster flex flex-col" role="list">
        {team.map((member, index) => (
          <TeamRosterRow key={member.id} member={member} stagger={index + 2} />
        ))}
      </ul>

      <p
        className="mt-14 max-w-sm text-xs leading-relaxed text-white/40"
        data-reveal-item
        data-stagger={team.length + 2}
      >
        A small collective. We help founders go from{" "}
        <span className="font-semibold text-orange-500">0</span>
        {" → "}
        <span className="font-semibold text-orange-500">1</span>.
      </p>
    </PageSection>
  );
}
