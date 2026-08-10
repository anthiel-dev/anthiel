import type { FaqItem } from "#features/home/faq/types";

import type { Locale } from "./locales";

import { experienceAnswer } from "./format-established";
import { getMessages } from "./messages";
import { plainFaqText, RichText } from "./rich-text";

export function getFaqs(locale: Locale, now = new Date()): FaqItem[] {
  const { items } = getMessages(locale).faq;

  return items.map((item) => {
    const answerText = item.id === "experience" ? experienceAnswer(locale, now) : item.answer;
    const streamText = plainFaqText(answerText);

    return {
      id: item.id,
      question: item.question,
      streamText,
      answer: <RichText text={answerText} />,
    };
  });
}
