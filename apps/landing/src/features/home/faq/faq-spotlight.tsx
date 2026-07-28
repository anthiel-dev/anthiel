import { useEffect, useRef, useState } from "react";

import { cn } from "#lib/utils";

import { faqs } from "./data";

const SWAP_MS = 150;

export function FaqSpotlight() {
  const [activeId, setActiveId] = useState(faqs[0]?.id ?? "");
  const [displayId, setDisplayId] = useState(faqs[0]?.id ?? "");
  const [swapPhase, setSwapPhase] = useState<"idle" | "exit" | "enter-start">("idle");
  const timerRef = useRef<number | null>(null);

  const display = faqs.find((faq) => faq.id === displayId) ?? faqs[0];

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function selectFaq(id: string) {
    if (id === activeId || swapPhase !== "idle") return;
    setActiveId(id);
    setSwapPhase("exit");

    timerRef.current = window.setTimeout(() => {
      setDisplayId(id);
      setSwapPhase("enter-start");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSwapPhase("idle"));
      });
    }, SWAP_MS);
  }

  return (
    <div className="faq-spotlight">
      <div
        className="min-h-[160px] border-b border-white/[0.06] pb-8"
        data-reveal-item
        data-stagger={2}
      >
        {display ? (
          <div
            className={cn(
              "t-text-swap",
              swapPhase === "exit" && "is-exit",
              swapPhase === "enter-start" && "is-enter-start",
            )}
          >
            <p className="text-xxs tracking-wide text-white/40">
              {String(faqs.findIndex((f) => f.id === display.id) + 1).padStart(2, "0")} /{" "}
              {String(faqs.length).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-display text-[26px] leading-snug tracking-tight text-white sm:text-[32px]">
              {display.question}
            </h3>
            <div className="mt-4 max-w-md text-xs leading-relaxed text-white/55">
              {display.answer}
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="mt-6 flex flex-wrap gap-2"
        data-reveal-item
        data-stagger={3}
        role="list"
        aria-label="Questions"
      >
        {faqs.map((faq) => {
          const isActive = faq.id === activeId;

          return (
            <button
              key={faq.id}
              type="button"
              role="listitem"
              className={cn(
                "faq-spotlight-chip max-w-full truncate rounded-full border px-3 py-1.5 text-left text-xxs outline-none transition-[color,border-color,background-color,transform] duration-150 ease-out",
                "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-orange-500/50",
                "active:scale-[0.97]",
                isActive
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-white/[0.08] bg-transparent text-white/50 hover:border-white/15 hover:text-white/80",
              )}
              aria-pressed={isActive}
              onClick={() => selectFaq(faq.id)}
            >
              {faq.question}
            </button>
          );
        })}
      </div>
    </div>
  );
}
