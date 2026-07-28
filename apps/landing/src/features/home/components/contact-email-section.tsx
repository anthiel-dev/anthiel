import { ContactEmailForm } from "../contact/contact-email-form";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function ContactEmailSection() {
  return (
    <PageSection id="contact">
      <SectionHeader
        title="Get in touch"
        description="You know what to do."
        className="mb-5"
        revealStagger={1}
      />
      <div data-reveal-item data-stagger={2}>
        <ContactEmailForm />
      </div>
    </PageSection>
  );
}
