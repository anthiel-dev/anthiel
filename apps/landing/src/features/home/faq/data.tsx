import type { ReactNode } from "react";

import { differenceInCalendarMonths } from "date-fns";
import { ArrowRight, Mail } from "lucide-react";

import type { FaqItem } from "./types";

export const INITIAL_SUGGESTION_COUNT = 4;
export const SUGGESTION_COUNT = 3;
export const ANSWER_REVEAL_DELAY_MS = 480;
export const TYPEWRITER_CHAR_MS = 16;

/** Anthiel was established on 23 March 2026. */
export const ESTABLISHED_AT = new Date(2026, 2, 23);

export function formatEstablishedAgo(now = new Date()): string {
  const months = Math.max(0, differenceInCalendarMonths(now, ESTABLISHED_AT));

  if (months < 1) return "less than a month ago";
  if (months === 1) return "a month ago";
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(months / 12);
  if (years === 1) return "a year ago";
  return `${years} years ago`;
}

function experienceAnswer(now = new Date()) {
  return `We knew each other for a long time but decided to create a group ${formatEstablishedAgo(now)}.`;
}

export const faqs: FaqItem[] = [
  {
    id: "experience",
    question: "How long have you been working together?",
    answer: experienceAnswer(),
    streamText: experienceAnswer(),
  },
  {
    id: "process",
    question: "What's your process?",
    streamText:
      "We start by understanding the problem, not writing code.\n\nTogether, we define the MVP, break it into milestones, get your approval, then start building.",
    answer: (
      <>
        We start by understanding the problem, not writing code.
        <br />
        <br />
        Together, we define the MVP, break it into milestones, get your approval, then start
        building.
      </>
    ),
  },
  {
    id: "timeline",
    question: "How long does a project take?",
    streamText:
      "It depends on the scope, but most projects take at least 3 months. Small products can often go from idea to production within that timeframe.",
    answer: (
      <>
        It depends on the scope, but most projects take{" "}
        <strong className="font-semibold text-foreground">at least 3 months</strong>. Small products
        can often go from idea to production within that timeframe.
      </>
    ),
  },
  {
    id: "cost",
    question: "How much does it cost?",
    streamText:
      "Every project is different.\n\nWe're typically more affordable than traditional agencies, and if you're working within a budget, we'll help find the right scope.",
    answer: (
      <>
        Every project is different.
        <br />
        <br />
        We&apos;re typically more affordable than traditional agencies, and if you&apos;re working
        within a budget, we&apos;ll help find the right scope.
      </>
    ),
  },
  {
    id: "why",
    question: "Why Anthiel?",
    streamText:
      "You work directly with the engineers building your product.\n\nNo account managers. No communication layers. Just faster decisions, clearer discussions, and better software.",
    answer: (
      <>
        You work directly with the engineers building your product.
        <br />
        <br />
        No account managers. No communication layers. Just faster decisions, clearer discussions,
        and better software.
      </>
    ),
  },
  {
    id: "start",
    question: "How do we get started?",
    streamText:
      "Tell us what you're building or the problem you're trying to solve.\n\nWe'll discuss the idea, define the scope, and figure out the best way forward together.\n\nContact us now",
    answer: (
      <>
        Tell us what you&apos;re building or the problem you&apos;re trying to solve.
        <br />
        <br />
        We&apos;ll discuss the idea, define the scope, and figure out the best way forward together.
        <br />
        <br />
        <a
          href="mailto:hi@an-thiel.com"
          className="group inline-flex items-center gap-1.5 text-orange-500 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <span className="relative size-3 shrink-0" aria-hidden>
            <Mail
              className="absolute inset-0 size-3 transition-[opacity,transform] duration-150 ease-out group-hover:scale-75 group-hover:opacity-0"
              strokeWidth={1.5}
            />
            <ArrowRight
              className="absolute inset-0 size-3 translate-x-[-3px] opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100"
              strokeWidth={1.5}
            />
          </span>
          Contact us now
        </a>
      </>
    ),
  },
];

export const customQueryEmailPromptText =
  "Thanks — we've got your question.\n\nWhat's the best email to reach you? We'll reply there personally, usually within a day or two.";

export const customQueryEmailPrompt: ReactNode = (
  <>
    Thanks — we&apos;ve got your question.
    <br />
    <br />
    What&apos;s the best email to reach you? We&apos;ll reply there personally, usually within a day
    or two.
  </>
);

export const customQueryConfirmedText =
  "Perfect. We'll get back to you by email shortly.\n\nTalk soon!";

export const customQueryConfirmed: ReactNode = (
  <>
    Perfect. We&apos;ll get back to you by email shortly.
    <br />
    <br />
    Talk soon!
  </>
);

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
