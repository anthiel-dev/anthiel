import { FaqContactLine } from "../faq/faq-contact-line";
import { FaqSpotlight } from "../faq/faq-spotlight";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqSpotlightSection() {
  return (
    <PageSection id="faq">
      <SectionHeader
        title="More about us"
        description="One question at a time."
        className="mb-8"
        revealStagger={1}
      />
      <FaqSpotlight />
      <FaqContactLine stagger={4} />
    </PageSection>
  );
}
