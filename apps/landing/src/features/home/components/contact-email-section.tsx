import { useMessages } from "#i18n";

import { ContactEmailForm } from "../contact/contact-email-form";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function ContactEmailSection() {
  const { contact } = useMessages();

  return (
    <PageSection id="contact">
      <SectionHeader
        title={contact.title}
        description={contact.description}
        className="mb-5"
        revealStagger={0}
      />
      <div data-reveal-item>
        <ContactEmailForm />
      </div>
    </PageSection>
  );
}
