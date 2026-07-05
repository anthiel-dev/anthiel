import { FaqChat } from "../faq/faq-chat";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqSection() {
  return (
    <PageSection>
      <SectionHeader
        title="More about us"
        description="Tap a message to learn about us or type your own to contact us."
        className="mb-4"
        revealStagger={4}
      />
      <div data-reveal-item data-stagger="5">
        <FaqChat />
      </div>
    </PageSection>
  );
}
