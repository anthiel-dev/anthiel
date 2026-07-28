import { useEffect, type RefObject } from "react";

const REVEAL_SELECTOR = "[data-reveal-item]";

/**
 * Reveals `[data-reveal-item]` elements once as they enter the viewport.
 * Stagger delays still apply from the moment each item is revealed.
 */
export function useRevealOnScroll(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = [...root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)];

    if (reduceMotion) {
      for (const item of items) {
        item.dataset.revealed = "true";
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.revealed = "true";
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    for (const item of items) {
      if (item.dataset.revealed === "true") continue;
      observer.observe(item);
    }

    return () => observer.disconnect();
  }, [containerRef]);
}
