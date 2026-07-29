import { useLayoutEffect, useRef, useState } from "react";

import { useMediaQuery } from "#hooks/use-media-query";
import { cn } from "#lib/utils";

import { faqs } from "./data";

const DOT_SIZE_PX = 6; // size-1.5
const TAIL_WIDTH_PX = 2;

type IndicatorGeo = {
  top: number;
  height: number;
  width: number;
};

function measureDotTop(itemRefs: Map<string, HTMLLIElement>, activeId: string) {
  const item = itemRefs.get(activeId);
  const button = item?.querySelector("button");
  if (!item || !button) return null;
  return button.offsetTop + (button.offsetHeight - DOT_SIZE_PX) / 2;
}

export function FaqSplit() {
  const [activeId, setActiveId] = useState(faqs[0]?.id ?? "");
  const active = faqs.find((faq) => faq.id === activeId) ?? faqs[0];
  const isMobile = useMediaQuery("max-sm");
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const prevTopRef = useRef<number | null>(null);
  const skipSnapRef = useRef(false);
  const [geo, setGeo] = useState<IndicatorGeo>({
    top: 0,
    height: DOT_SIZE_PX,
    width: DOT_SIZE_PX,
  });
  const [animateGeo, setAnimateGeo] = useState(false);
  const [indicatorReady, setIndicatorReady] = useState(false);

  useLayoutEffect(() => {
    // Mobile uses a static active-dot color — skip the traveling indicator.
    if (isMobile) {
      prevTopRef.current = null;
      setIndicatorReady(false);
      return;
    }

    const list = listRef.current;
    if (!list) return;

    const nextTop = measureDotTop(itemRefs.current, activeId);
    if (nextTop == null) return;

    const prevTop = prevTopRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delta = prevTop == null ? 0 : nextTop - prevTop;

    if (prevTop == null || reduceMotion || Math.abs(delta) < 0.5) {
      setAnimateGeo(false);
      setGeo({ top: nextTop, height: DOT_SIZE_PX, width: DOT_SIZE_PX });
      prevTopRef.current = nextTop;
      setIndicatorReady(true);
      return;
    }

    // Stretch into a thin tail covering the travel path, then collapse into the tip.
    skipSnapRef.current = true;
    setAnimateGeo(false);
    setGeo({
      top: Math.min(prevTop, nextTop),
      height: Math.abs(delta) + DOT_SIZE_PX,
      width: TAIL_WIDTH_PX,
    });
    prevTopRef.current = nextTop;
    setIndicatorReady(true);

    let settleRaf = 0;
    const startRaf = requestAnimationFrame(() => {
      settleRaf = requestAnimationFrame(() => {
        setAnimateGeo(true);
        setGeo({ top: nextTop, height: DOT_SIZE_PX, width: DOT_SIZE_PX });
      });
    });

    const unlock = window.setTimeout(() => {
      skipSnapRef.current = false;
    }, 520);

    return () => {
      cancelAnimationFrame(startRaf);
      cancelAnimationFrame(settleRaf);
      window.clearTimeout(unlock);
      skipSnapRef.current = false;
    };
  }, [activeId, isMobile]);

  useLayoutEffect(() => {
    if (isMobile) return;

    const list = listRef.current;
    if (!list) return;

    function snap() {
      if (skipSnapRef.current) return;
      const nextTop = measureDotTop(itemRefs.current, activeId);
      if (nextTop == null) return;
      setAnimateGeo(false);
      setGeo({ top: nextTop, height: DOT_SIZE_PX, width: DOT_SIZE_PX });
      prevTopRef.current = nextTop;
      setIndicatorReady(true);
    }

    const observer = new ResizeObserver(snap);
    observer.observe(list);
    const item = itemRefs.current.get(activeId);
    if (item) observer.observe(item);

    return () => observer.disconnect();
  }, [activeId, isMobile]);

  return (
    <div className="faq-split grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-10">
      <ul ref={listRef} className="relative m-0 list-none p-0" role="list">
        <span
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-10 hidden rounded-full bg-orange-500 sm:block",
            indicatorReady &&
              animateGeo &&
              "motion-safe:transition-[transform,width,height,opacity] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}
          style={{
            width: geo.width,
            height: geo.height,
            opacity: geo.width < DOT_SIZE_PX ? 0.75 : 1,
            transform: `translate3d(${(DOT_SIZE_PX - geo.width) / 2}px, ${geo.top}px, 0)`,
          }}
          aria-hidden
        />

        {faqs.map((faq) => {
          const isActive = faq.id === activeId;

          return (
            <li
              key={faq.id}
              ref={(node) => {
                if (node) itemRefs.current.set(faq.id, node);
                else itemRefs.current.delete(faq.id);
              }}
              className="border-b border-white/[0.05] last:border-b-0"
              data-reveal-item
            >
              <button
                type="button"
                className={cn(
                  "faq-split-item group flex w-full cursor-pointer items-center gap-3 py-3.5 text-left outline-none",
                  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-orange-500/50",
                  "active:scale-[0.99]",
                  isActive ? "text-white" : "text-white/45 hover:text-white/75",
                )}
                aria-pressed={isActive}
                aria-expanded={isActive}
                onClick={() => setActiveId(faq.id)}
              >
                <span
                  className={cn(
                    "faq-split-dot size-1.5 shrink-0 rounded-full bg-white/20 transition-[background-color,transform] duration-200 ease-out",
                    "max-sm:scale-90",
                    isActive && "max-sm:scale-100 max-sm:bg-orange-500",
                  )}
                  aria-hidden
                />
                <span className="text-sm tracking-tight transition-colors duration-150 ease-out">
                  {faq.question}
                </span>
              </button>

              <div className="sm:hidden">
                <div className="faq-expand" data-open={isActive}>
                  <div className="faq-expand-inner">
                    <div className="pb-4 pl-[18px] text-xs leading-relaxed text-white/55">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className="relative hidden min-h-[140px] overflow-hidden border-l border-white/[0.06] pl-10 sm:block"
        data-reveal-item
      >
        {active ? (
          <div key={active.id} className="faq-answer-enter">
            <p className="text-xxs tracking-wide text-white/40">Answer</p>
            <p className="mt-3 font-mono text-[22px] leading-snug tracking-tight text-white/90 sm:text-[26px]">
              {active.question}
            </p>
            <div className="mt-4 text-xs leading-relaxed text-white/55">{active.answer}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
