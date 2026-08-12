import type { Locale } from "../locales";
import type { Messages } from "../types";

import { en } from "./en";

const catalog: Record<Locale, Messages> = { en };

export function getMessages(locale: Locale): Messages {
  return catalog[locale];
}
