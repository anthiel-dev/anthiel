import { workGroups } from "../work/data";
import { WorkProjectRow } from "../work/work-project-row";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function WorkSection() {
  return (
    <PageSection id="work">
      <SectionHeader
        title="Work"
        description="Projects we've shipped, and past work from the team."
        className="mb-8"
        revealStagger={4}
      />
      <div className="work-list flex flex-col gap-10" data-reveal-item data-stagger="5">
        {workGroups.map((group) => (
          <div key={group.id}>
            <p className="mb-4 text-xxs text-white/40">{group.label}</p>
            <ol className="m-0 list-none p-0">
              {group.projects.map((project) => (
                <WorkProjectRow key={project.number} {...project} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
