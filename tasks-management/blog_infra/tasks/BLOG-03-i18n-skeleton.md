# BLOG-03 — i18n skeleton (English default)

- **Status:** Done
- **Labels:** blog, feature, agent
- **Priority:** High
- **Depends on:** BLOG-01

## Context

- Reuse landing locale scheme; `LOCALES = ["en"]` for now
- `#i18n` import alias
- Related ADR: ADR-4

## Acceptance criteria

- [x] `src/i18n/` with `locales.ts`, messages, context providers (English only)
- [x] Helpers: `localePath`, `parseLocaleParam`, `resolveLocale`, `isLocale`
- [x] English unprefixed URLs; structure ready for more locales
- [x] Content dirs remain per-locale (`content/blog/<locale>/`)
