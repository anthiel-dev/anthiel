import { useLayoutEffect, useRef } from "react";

import { useRevealOnScroll } from "#hooks/use-reveal-on-scroll";

import { Atmosphere } from "./atmosphere";
import { HomeFooter } from "./home-footer";
import { HomeHeader } from "./home-header";
import { PremiumScrollbar } from "./premium-scrollbar";
import { ScrollEdgeFades } from "./scroll-edge-fades";

function scrollToHash() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

export function PageLayout({
  children,
  showTeamPhoto = false,
}: {
  children: React.ReactNode;
  showTeamPhoto?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useRevealOnScroll(rootRef);

  useLayoutEffect(() => {
    if (!window.location.hash) return;
    const frame = requestAnimationFrame(scrollToHash);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={rootRef} className="mx-auto flex max-w-3xl flex-col pt-32 pb-4" data-reveal="true">
      <Atmosphere />
      <ScrollEdgeFades />
      <PremiumScrollbar />
      <HomeHeader />
      <main className="mt-8 flex flex-col gap-20 px-6 sm:gap-28 sm:px-10">{children}</main>
      <HomeFooter showTeamPhoto={showTeamPhoto} />
    </div>
  );
}
