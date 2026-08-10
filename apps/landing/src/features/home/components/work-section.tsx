import { useMessages } from "#i18n";

import { WorkProjectRow } from "../work/work-project-row";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function WorkSection() {
  const { work } = useMessages();

  return (
    <PageSection id="work">
      <SectionHeader
        title={work.title}
        description={work.description}
        className="mb-8"
        revealStagger={0}
      />
      <div className="work-list flex flex-col gap-10">
        {work.groups.map((group) => (
          <div key={group.id}>
            <p className="mb-4 text-xxs text-white/40" data-reveal-item>
              {group.label}
            </p>
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
