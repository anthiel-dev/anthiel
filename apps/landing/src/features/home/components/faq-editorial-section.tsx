import { faqs } from "../faq/data";
import { FaqContactLine } from "../faq/faq-contact-line";
import { FaqEditorial } from "../faq/faq-editorial";
import { PageSection } from "./page-section";

export function FaqEditorialSection() {
  return (
    <PageSection id="faq">
      <div
        className="mb-8 flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-4"
        data-reveal-item
        data-stagger={1}
      >
        <h2 className="text-xs tracking-wide text-white/50">Questions</h2>
        <p className="text-xs text-white/40">Straight answers.</p>
      </div>
      <FaqEditorial />
      <FaqContactLine stagger={faqs.length + 2} />
    </PageSection>
  );
}
