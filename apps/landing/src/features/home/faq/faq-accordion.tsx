import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { cn } from "#lib/utils";

import { faqs } from "./data";

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <ul className="faq-accordion m-0 list-none p-0" role="list">
      {faqs.map((faq, index) => {
        const isOpen = openId === faq.id;

        return (
          <li
            key={faq.id}
            className="border-b border-white/[0.06] last:border-b-0"
            data-reveal-item
            data-stagger={index + 2}
          >
            <button
              type="button"
              className={cn(
                "faq-accordion-trigger group flex w-full items-start gap-4 py-4 text-left outline-none",
                "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-orange-500/50",
                "active:scale-[0.99]",
              )}
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span className="min-w-0 flex-1 text-sm tracking-tight text-white/85 transition-colors duration-150 ease-out group-hover:text-white">
                {faq.question}
              </span>
              <span
                className="t-icon-swap mt-0.5 size-4 shrink-0 text-white/40"
                data-state={isOpen ? "b" : "a"}
                aria-hidden
              >
                <span className="t-icon" data-icon="a">
                  <Plus className="size-4" strokeWidth={1.5} />
                </span>
                <span className="t-icon" data-icon="b">
                  <Minus className="size-4" strokeWidth={1.5} />
                </span>
              </span>
            </button>

            <div className="faq-expand" data-open={isOpen}>
              <div className="faq-expand-inner">
                <div className="pb-4 text-xs leading-relaxed text-white/55">{faq.answer}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
