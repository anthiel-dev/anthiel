import { Mail } from "lucide-react";

import { useMessages } from "#i18n";

import { PageSection } from "./page-section";

export function IntroSection() {
  const { intro } = useMessages();

  return (
    <PageSection id="intro">
      <p className="text-sm text-white/90" data-reveal-item data-revealed="true" data-stagger="1">
        {intro.p1Prefix} <span className="font-semibold text-orange-500">&</span> {intro.p1Suffix}
      </p>
      <p
        className="mt-2 text-sm text-white/90"
        data-reveal-item
        data-revealed="true"
        data-stagger="2"
      >
        {intro.p2Before} <span className="font-semibold text-orange-500">0</span> →{" "}
        <span className="font-semibold text-orange-500">1</span> {intro.p2After}
      </p>
      <p
        className="mt-10 text-xs text-white/50 flex items-end gap-2"
        data-reveal-item
        data-revealed="true"
        data-stagger="3"
      >
        {intro.sayHi}{" "}
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
