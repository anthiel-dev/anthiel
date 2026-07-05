import { PageSection } from "./page-section";

export function IntroSection() {
  return (
    <PageSection>
      <p className="text-xs text-white/90" data-reveal-item data-stagger="1">
        A collective of software engineers based in Jakarta, Indonesia.
      </p>
      <p className="mt-2 text-xs text-white/90" data-reveal-item data-stagger="2">
        We help founders go from <span className="font-semibold text-orange-500">0</span> →{" "}
        <span className="font-semibold text-orange-500">1</span> with a small, senior engineering
        team.
      </p>
    </PageSection>
  );
}
