import { useState } from "react";

import { cn } from "#lib/utils";

import { faqs } from "./data";

export function FaqSplit() {
  const [activeId, setActiveId] = useState(faqs[0]?.id ?? "");
  const active = faqs.find((faq) => faq.id === activeId) ?? faqs[0];

  return (
    <div className="faq-split grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-10">
      <ul className="m-0 list-none p-0" role="list">
        {faqs.map((faq) => {
          const isActive = faq.id === activeId;

          return (
            <li
              key={faq.id}
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
                    "faq-split-dot size-1.5 shrink-0 rounded-full transition-[background-color,transform] duration-200 ease-out",
                    isActive ? "scale-100 bg-orange-500" : "scale-90 bg-white/20",
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
