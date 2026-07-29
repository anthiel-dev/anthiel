import { useLayoutEffect, type RefObject } from "react";

const REVEAL_SELECTOR = "[data-reveal-item]";
/** Gap between items revealed in the same scroll wave. */
const REVEAL_STEP_MS = 175;
/** Quiet period before the sequence counter resets for the next wave. */
const SEQUENCE_RESET_MS = 700;

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // Any overlap with the real viewport — used for first-paint above-the-fold reveals.
  return rect.bottom > 0 && rect.top < vh;
}

function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

function staggerIndex(el: HTMLElement) {
  const raw = el.dataset.stagger;
  if (raw == null || raw === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Reveals `[data-reveal-item]` elements once as they enter the viewport.
 * Above-the-fold items cascade after any pre-revealed intro; later scroll waves
 * restart their own document-order stagger.
 */
export function useRevealOnScroll(containerRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
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

    const preRevealed = items.filter((el) => el.dataset.revealed === "true");
    const maxPreStagger = preRevealed.reduce((max, el) => Math.max(max, staggerIndex(el)), -1);

    let sequence = maxPreStagger + 1;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    function reveal(el: HTMLElement) {
      if (el.dataset.revealed === "true") return;

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        sequence = 0;
      }, SEQUENCE_RESET_MS);

      // Document-order cascade within a wave.
      el.style.setProperty("--reveal-start", `${sequence * REVEAL_STEP_MS}ms`);
      el.style.setProperty("--stagger", "0");
      sequence += 1;
      el.dataset.revealed = "true";
    }

    // First paint: reveal anything already visible, continuing after intro stagger.
    for (const el of items.filter(isInViewport).sort(byDocumentOrder)) {
      reveal(el);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const toReveal = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort(byDocumentOrder);

        for (const el of toReveal) {
          reveal(el);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px",
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
