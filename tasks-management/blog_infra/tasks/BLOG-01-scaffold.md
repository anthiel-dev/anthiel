# BLOG-01 — Scaffold apps/blog

- **Status:** Done
- **Labels:** blog, chore, agent
- **Priority:** High
- **Depends on:** —

## Context

- Mirror `apps/landing` stack: TanStack Start, React 19, Tailwind v4, `@anthiel/ui`
- Files: `apps/blog/package.json`, `tsconfig.json`, `vite.config.ts`, `src/router.tsx`, `src/routes/__root.tsx`, `src/styles.css`, `src/lib/site.ts`
- Related ADR: ADR-1

## Acceptance criteria

- [x] `apps/blog` package with scripts: `dev` (port 3002), `build`, `preview`, `generate-routes`, `deploy`, `typecheck`, `test`
- [x] Vite config with `tanstackStart` prerender enabled (`crawlLinks`, `autoStaticPathsDiscovery`)
- [x] Minimal root route + router shell renders
- [x] `bun install` then `cd apps/blog && bun run typecheck` clean
