import { differenceInCalendarMonths } from "date-fns";

import type { Locale } from "./locales";

import { getMessages } from "./messages";

/** Anthiel was established on 23 March 2026. */
export const ESTABLISHED_AT = new Date(2026, 2, 23);

export function formatEstablishedAgo(locale: Locale, now = new Date()): string {
  const { established } = getMessages(locale).faq;
  const months = Math.max(0, differenceInCalendarMonths(now, ESTABLISHED_AT));

  if (months < 1) return established.lessThanMonth;
  if (months === 1) return established.oneMonth;
  if (months < 12) return established.months(months);

  const years = Math.floor(months / 12);
  if (years === 1) return established.oneYear;
  return established.years(years);
}

export function experienceAnswer(locale: Locale, now = new Date()): string {
  const ago = formatEstablishedAgo(locale, now);
  return getMessages(locale).faq.experienceTemplate.replace("{ago}", ago);
}
