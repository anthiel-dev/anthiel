import type { Locale } from "../locales";
import type { Messages } from "../types";

import { en } from "./en";
import { id } from "./id";
import { zh } from "./zh";

const catalog: Record<Locale, Messages> = { en, id, zh };

export function getMessages(locale: Locale): Messages {
  return catalog[locale];
}
