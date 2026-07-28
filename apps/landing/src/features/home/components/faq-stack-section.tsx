import { faqs } from "../faq/data";
import { FaqContactLine } from "../faq/faq-contact-line";
import { FaqStack } from "../faq/faq-stack";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqStackSection() {
  return (
    <PageSection id="faq">
      <SectionHeader
        title="More about us"
        description="Open a row to read the answer."
        className="mb-6"
        revealStagger={1}
      />
      <FaqStack />
      <FaqContactLine stagger={faqs.length + 2} />
    </PageSection>
  );
}
