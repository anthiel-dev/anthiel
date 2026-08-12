# Anthiel blog

Statically prerendered blog built with TanStack Start (Vite + React) and local MDX.

## Requirements

- [Bun](https://bun.sh) 1.3+

## Local development

From the monorepo root:

```bash
bun install
bun run dev --filter=blog
```

Or from this directory:

```bash
bun install
bun run dev
```

Open [http://localhost:3002](http://localhost:3002) — `/` redirects to `/blog`.

## Content

Posts are MDX files under `src/content/blog/<locale>/` with YAML frontmatter:

```mdx
---
title: Hello World
date: "2026-08-12"
description: Short summary for the index and meta tags.
---

# Hello World

Body in Markdown + JSX…
```

Optional `slug` overrides the filename. English (`en`) is the only locale for now; add folders like `id/` later without route changes.

## Production build

```bash
bun run build
```

Prerendered HTML lands in:

```text
apps/blog/dist/client/
```

Preview locally:

```bash
bun run preview
```

## Deploy (Cloudflare Workers static assets)

```bash
bun run deploy
```

Uses `wrangler.jsonc` (`anthiel-blog`, assets from `./dist/client`). From the monorepo root you can also run `bun run deploy:blog`.
