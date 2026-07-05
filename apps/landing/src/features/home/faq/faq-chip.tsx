import { Bubble, BubbleContent } from "#components/ui/bubble";

import type { FaqItem } from "./types";

interface FaqChipProps {
  faq: FaqItem;
  onSelect: (faq: FaqItem) => void;
  disabled?: boolean;
}

export function FaqChip({ faq, onSelect, disabled = false }: FaqChipProps) {
  return (
    <Bubble variant="outline" className="max-w-full">
      <BubbleContent
        className="text-xs text-left"
        render={<button type="button" disabled={disabled} onClick={() => onSelect(faq)} />}
      >
        {faq.question}
      </BubbleContent>
    </Bubble>
  );
}
