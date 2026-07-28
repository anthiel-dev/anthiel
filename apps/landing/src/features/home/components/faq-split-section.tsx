import { FaqContactLine } from "../faq/faq-contact-line";
import { FaqSplit } from "../faq/faq-split";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqSplitSection() {
  return (
    <PageSection id="faq">
      <SectionHeader
        title="More about us"
        description="Select a question — the answer shows beside it."
        className="mb-8"
        revealStagger={1}
      />
      <FaqSplit />
      <FaqContactLine stagger={4} />
    </PageSection>
  );
}
