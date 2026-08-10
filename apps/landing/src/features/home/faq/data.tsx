import type { ReactNode } from "react";

import {
  DEFAULT_LOCALE,
  ESTABLISHED_AT,
  RichText,
  formatEstablishedAgo as formatEstablishedAgoLocale,
  getFaqs,
} from "#i18n";

export const INITIAL_SUGGESTION_COUNT = 4;
export const SUGGESTION_COUNT = 3;
export const ANSWER_REVEAL_DELAY_MS = 480;
export const TYPEWRITER_CHAR_MS = 16;

export { ESTABLISHED_AT };

/** English relative time for experiment FAQ variants. */
export function formatEstablishedAgo(now = new Date()): string {
  return formatEstablishedAgoLocale(DEFAULT_LOCALE, now);
}

/** English FAQ list for experiment routes (`/faq/*`). */
export const faqs = getFaqs(DEFAULT_LOCALE);

export const customQueryEmailPromptText =
  "Thanks — we've got your question.\n\nWhat's the best email to reach you? We'll reply there personally, usually within a day or two.";

export const customQueryEmailPrompt: ReactNode = <RichText text={customQueryEmailPromptText} />;

export const customQueryConfirmedText =
  "Perfect. We'll get back to you by email shortly.\n\nTalk soon!";

export const customQueryConfirmed: ReactNode = <RichText text={customQueryConfirmedText} />;

export const customQueryAcknowledgedText =
  "Got it — we've noted this one too. We'll follow up by email soon.";

export const customQueryAcknowledged: ReactNode = customQueryAcknowledgedText;

export const invalidEmailReplyText =
  "Hmm, that doesn't look quite right. Mind checking the email and trying again?";

export const invalidEmailReply: ReactNode = invalidEmailReplyText;

export function rateLimitReplyText(minutes: number) {
  const wait = Math.max(1, minutes);
  return `You've sent a few questions already. Please wait about ${wait} minute${wait === 1 ? "" : "s"} before sending another custom message.`;
}

export function rateLimitReply(minutes: number): ReactNode {
  return rateLimitReplyText(minutes);
}

export const submitFailedReplyText =
  "Something went wrong sending that. Please try again in a moment.";

export const submitFailedReply: ReactNode = submitFailedReplyText;
