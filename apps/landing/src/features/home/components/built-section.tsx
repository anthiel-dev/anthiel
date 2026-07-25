import { BuiltProjectCard } from "../built/built-project";
import { builtItems } from "../built/data";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function BuiltSection() {
  return (
    <PageSection id="built">
      <SectionHeader
        title="What we have built"
        description="Products and tools we've shipped for founders"
        className="mb-6"
      />
      <ul className="m-0 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10">
        {builtItems.map((item) => (
          <li key={item.title}>
            <BuiltProjectCard {...item} />
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
