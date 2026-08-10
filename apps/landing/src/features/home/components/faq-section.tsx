import { useMessages } from "#i18n";

import { FaqSplit } from "../faq/faq-split";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function FaqSection() {
  const { faq } = useMessages();

  return (
    <PageSection id="faq">
      <SectionHeader
        title={faq.title}
        description={faq.description}
        className="mb-8"
        revealStagger={0}
      />
      <FaqSplit />
    </PageSection>
  );
}
