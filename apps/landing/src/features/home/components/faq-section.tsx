import { FaqSplit } from "../faq/faq-split";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqSection() {
  return (
    <PageSection id="faq">
      <SectionHeader
        title="More about us"
        description="Select a question to see the answer."
        className="mb-8"
        revealStagger={0}
      />
      <FaqSplit />
    </PageSection>
  );
}
