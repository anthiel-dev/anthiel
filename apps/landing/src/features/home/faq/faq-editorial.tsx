import { useState } from "react";

import { cn } from "#lib/utils";

import { faqs } from "./data";

export function FaqEditorial() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="faq-editorial m-0 list-none p-0" role="list">
      {faqs.map((faq, index) => {
        const isOpen = openId === faq.id;
        const number = String(index + 1).padStart(2, "0");

        return (
          <li
            key={faq.id}
            className="faq-editorial-item border-b border-white/[0.05] last:border-b-0"
            data-reveal-item
            data-stagger={index + 2}
            data-open={isOpen}
          >
            <button
              type="button"
              className={cn(
                "group flex w-full items-baseline gap-4 py-5 text-left outline-none sm:gap-6 sm:py-6",
                "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-orange-500/50",
                "active:scale-[0.99]",
              )}
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span
                className={cn(
                  "faq-editorial-num shrink-0 text-xxs tabular-nums tracking-wide transition-colors duration-200 ease-out",
                  isOpen ? "text-orange-500" : "text-white/30 group-hover:text-white/50",
                )}
              >
                {number}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "faq-editorial-q block font-display text-[24px] leading-[1.15] tracking-tight transition-colors duration-200 ease-out sm:text-[30px]",
                    isOpen ? "text-white" : "text-white/65 group-hover:text-white/90",
                  )}
                >
                  {faq.question}
                </span>
                <span
                  className={cn(
                    "faq-editorial-rule mt-3 block h-px origin-left bg-orange-500/80 transition-transform duration-200 ease-out",
                    isOpen ? "scale-x-100" : "scale-x-0",
                  )}
                  aria-hidden
                />
              </span>
            </button>

            <div className="faq-expand" data-open={isOpen}>
              <div className="faq-expand-inner">
                <div className="pb-6 pl-10 text-xs leading-relaxed text-white/55 sm:pl-12">
                  {faq.answer}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
