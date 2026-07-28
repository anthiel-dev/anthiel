import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "#lib/utils";

import { faqs } from "./data";

export function FaqStack() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <ul className="faq-stack m-0 flex list-none flex-col gap-2 p-0" role="list">
      {faqs.map((faq, index) => {
        const isOpen = openId === faq.id;

        return (
          <li
            key={faq.id}
            className={cn(
              "faq-stack-item overflow-hidden rounded-xl border transition-[border-color,background-color] duration-200 ease-out",
              isOpen
                ? "border-white/[0.1] bg-white/[0.035]"
                : "border-white/[0.05] bg-transparent hover:border-white/[0.08]",
            )}
            data-reveal-item
            data-stagger={index + 2}
            data-open={isOpen}
          >
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none sm:px-5",
                "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-orange-500/50",
                "active:scale-[0.99]",
              )}
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm tracking-tight transition-colors duration-150 ease-out",
                  isOpen ? "text-white" : "text-white/70",
                )}
              >
                {faq.question}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-white/35 transition-transform duration-200 ease-out",
                  isOpen && "rotate-180 text-orange-500/80",
                )}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>

            <div className="faq-expand" data-open={isOpen}>
              <div className="faq-expand-inner">
                <div className="px-4 pb-4 text-xs leading-relaxed text-white/55 sm:px-5">
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
