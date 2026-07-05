import { faqs } from "./data";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function refillSuggestions(
  visibleIds: string[],
  askedIds: Set<string>,
  removedId: string,
  limit: number,
): string[] {
  const next = visibleIds.filter((id) => id !== removedId);
  const visibleSet = new Set(next);

  for (const faq of faqs) {
    if (next.length >= limit) break;
    if (!askedIds.has(faq.id) && !visibleSet.has(faq.id)) {
      next.push(faq.id);
      visibleSet.add(faq.id);
    }
  }

  return next;
}
