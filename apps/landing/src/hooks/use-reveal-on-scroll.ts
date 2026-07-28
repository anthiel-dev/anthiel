import { useEffect, type RefObject } from "react";

const REVEAL_SELECTOR = "[data-reveal-item]";
/** Gap between items revealed in the same scroll wave. */
const REVEAL_STEP_MS = 175;
/** Quiet period before the sequence counter resets for the next wave. */
const SEQUENCE_RESET_MS = 700;

/**
 * Reveals `[data-reveal-item]` elements once as they enter the viewport.
 * Items that become visible together cascade in document order so above-the-fold
 * sections (intro → work) don't all start at once.
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

    let sequence = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    function reveal(el: HTMLElement) {
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        sequence = 0;
      }, SEQUENCE_RESET_MS);

      // Document-order cascade; zero CSS stagger so delays don't double up.
      el.style.setProperty("--reveal-start", `${sequence * REVEAL_STEP_MS}ms`);
      el.style.setProperty("--stagger", "0");
      sequence += 1;
      el.dataset.revealed = "true";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const toReveal = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => {
            const position = a.compareDocumentPosition(b);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
          });

        for (const el of toReveal) {
          if (el.dataset.revealed === "true") continue;
          reveal(el);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -18% 0px",
      },
    );

    for (const item of items) {
      if (item.dataset.revealed === "true") continue;
      observer.observe(item);
    }

    return () => {
      if (resetTimer) clearTimeout(resetTimer);
      observer.disconnect();
    };
  }, [containerRef]);
}
