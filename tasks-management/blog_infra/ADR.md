# Blog Infra — Analysis & ADR

## Scope (locked)

- New `apps/blog` TanStack Start app, statically prerendered
- Local MDX posts under `src/content/blog/<locale>/`
- i18n structure matching landing (English unprefixed); English-only posts for now
- Cloudflare Workers static deploy via Wrangler
- Out of scope: polished UI, tags, RSS, sitemap, advanced SEO/OG, CMS, backend-backed posts

## Current architecture

- Monorepo workspaces: `apps/*`, `packages/*` (Bun + Turbo)
- Landing (`apps/landing`) is the closest reference: TanStack Start + `prerender` + `{-$locale}` + Wrangler `dist/client`
- Dashboard uses Nitro (SSR) — not the pattern for this static blog

## Gaps / options

1. **Placement:** new app vs `/blog` on landing vs shared package → new `apps/blog` (locked)
2. **Content:** local MDX vs backend API vs headless CMS → local MDX (locked)
3. **MDX tooling:** `@mdx-js/rollup` + remark frontmatter vs contentlayer-style libs → `@mdx-js/rollup` + `remark-mdx-frontmatter` (locked)

## Architecture Decision Records

### ADR-1 — New `apps/blog` app — Accepted

Blog is its own TanStack Start app under `apps/blog`, deployed separately from landing/dashboard. Keeps marketing site and content site independent and matches monorepo app boundaries.

### ADR-2 — Local MDX content — Accepted

Posts live in-repo as `.mdx` files under `src/content/blog/<locale>/`, loaded at build time via `import.meta.glob`. Frontmatter validated with Zod. No CMS or API dependency for v1.

### ADR-3 — MDX via `@mdx-js/rollup` + `remark-mdx-frontmatter` — Accepted

Use the standard MDX Vite/Rollup plugin with `remark-frontmatter` + `remark-mdx-frontmatter` so each module exports `frontmatter`. Register the plugin before `@vitejs/plugin-react`.

### ADR-4 — i18n scheme from landing, English-only content — Accepted

Reuse landing’s locale helpers (`localePath`, `parseLocaleParam`, optional `{-$locale}` route, English unprefixed). `LOCALES` starts as `["en"]` only. Content dirs are per-locale so adding `id`/`zh` later does not require route changes.

### ADR-5 — Cloudflare static deploy — Accepted

Mirror landing: `wrangler.jsonc` with `assets.directory: ./dist/client` and `bun run deploy` → `wrangler deploy`. Output of `vite build` with TanStack Start prerender is a static site.
