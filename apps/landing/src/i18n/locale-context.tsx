import { createContext, useContext, type ReactNode } from "react";

import type { Locale } from "./locales";
import type { Messages } from "./types";

import { DEFAULT_LOCALE } from "./locales";
import { getMessages } from "./messages";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  messages: getMessages(DEFAULT_LOCALE),
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <LocaleContext.Provider value={{ locale, messages: getMessages(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useMessages() {
  return useContext(LocaleContext).messages;
}
