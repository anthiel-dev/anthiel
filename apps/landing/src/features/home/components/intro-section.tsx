import { Mail } from "lucide-react";

import { PageSection } from "./page-section";

export function IntroSection() {
  return (
    <PageSection id="intro">
      <p className="text-xs text-white/90" data-reveal-item data-revealed="true" data-stagger="1">
        A collective of software engineers based in Batam{" "}
        <span className="font-semibold text-orange-500">&</span> Jakarta, Indonesia.
      </p>
      <p
        className="mt-2 text-xs text-white/90"
        data-reveal-item
        data-revealed="true"
        data-stagger="2"
      >
        We help founders go from <span className="font-semibold text-orange-500">0</span> →{" "}
        <span className="font-semibold text-orange-500">1</span> with a small, senior engineering
        team.
      </p>
      <p
        className="mt-10 text-xxs text-white/50 flex items-end gap-2"
        data-reveal-item
        data-revealed="true"
        data-stagger="3"
      >
        Say hi to us{" "}
        <a
          href="mailto:hi@an-thiel.com"
          className="group inline-flex items-center text-white/70 transition-colors duration-150 ease-out hover:text-orange-500 active:scale-[0.97]"
        >
          <span className="inline-flex w-0 items-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-150 ease-out group-hover:mr-1 group-hover:w-3 group-hover:opacity-100">
            <Mail className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
          </span>
          hi@an-thiel.com
        </a>
      </p>
    </PageSection>
  );
}
