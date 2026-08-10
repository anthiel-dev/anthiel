import { DEFAULT_LOCALE, getMessages } from "#i18n";

/** Canonical production origin for Anthiel landing. */
export const SITE_URL = "https://an-thiel.com";
export const SITE_NAME = "Anthiel";
/** Default (English) description — prefer locale messages for page meta. */
export const SITE_DESCRIPTION = getMessages(DEFAULT_LOCALE).meta.description;
export const THEME_COLOR = "#0a0a0a";
