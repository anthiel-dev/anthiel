import { faqs } from "../faq/data";
import { FaqAccordion } from "../faq/faq-accordion";
import { FaqContactLine } from "../faq/faq-contact-line";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqAccordionSection() {
  return (
    <PageSection id="faq">
      <SectionHeader
        title="More about us"
        description="Common questions, answered plainly."
        className="mb-6"
        revealStagger={1}
      />
      <FaqAccordion />
      <FaqContactLine stagger={faqs.length + 2} />
    </PageSection>
  );
}
