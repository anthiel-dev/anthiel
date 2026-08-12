# BLOG-02 — MDX content pipeline

- **Status:** Done
- **Labels:** blog, feature, agent
- **Priority:** High
- **Depends on:** BLOG-01

## Context

- Content: `src/content/blog/<locale>/*.mdx`
- Loader: `src/content/posts.ts` via `import.meta.glob`
- Related ADR: ADR-2, ADR-3

## Acceptance criteria

- [x] `@mdx-js/rollup`, `@mdx-js/react`, `remark-frontmatter`, `remark-mdx-frontmatter` installed and registered in Vite (before `viteReact`)
- [x] Zod frontmatter schema: `title`, `date`, `description`, optional `slug`
- [x] `getPosts(locale)` and `getPost(locale, slug)` exported from `src/content/posts.ts`
- [x] Posts sorted by date descending
