# BLOG-04 — Blog index + post routes + sample post

- **Status:** Done
- **Labels:** blog, feature, agent
- **Priority:** High
- **Depends on:** BLOG-02, BLOG-03

## Context

- Routes under `src/routes/{-$locale}/blog/`
- Sample: `src/content/blog/en/hello-world.mdx`
- Related ADR: ADR-2, ADR-4
- Note: MDX `Component` must not be put in route context (Seroval); resolve via `getPost` in the component.

## Acceptance criteria

- [x] Index route lists posts (title, date, description, link)
- [x] `$slug` route renders MDX in `@tailwindcss/typography` `prose` container
- [x] `head()` sets title/description; missing slug → `notFound()`
- [x] Sample `hello-world.mdx` present
- [x] `bun run build` prerenders `/blog` and `/blog/hello-world` under `dist/client`
