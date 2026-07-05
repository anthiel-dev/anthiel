import { BuiltCard } from "../built/built-card";
import { builtItems } from "../built/data";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function BuiltSection() {
  return (
    <PageSection>
      <SectionHeader
        title="What we have built"
        description="Products and tools we've shipped for founders"
        className="mb-4"
        revealStagger={4}
      />
      <ul className="m-0 grid list-none grid-cols-1 sm:grid-cols-2 gap-4 p-0">
        {builtItems.map((item, index) => (
          <li key={item.title} data-reveal-item data-stagger={index + 5}>
            <BuiltCard {...item} />
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
