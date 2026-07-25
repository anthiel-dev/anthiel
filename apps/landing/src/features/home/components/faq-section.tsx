import { FaqChat } from "../faq/faq-chat";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqSection() {
  return (
    <PageSection id="faq">
      <SectionHeader
        title="More about us"
        description="Tap a message to learn about us or type your own to contact us."
        className="mb-4"
      />
      <FaqChat />
    </PageSection>
  );
}
