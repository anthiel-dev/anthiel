# BLOG-05 — Deploy + monorepo wiring

- **Status:** Done
- **Labels:** blog, chore, agent
- **Priority:** High
- **Depends on:** BLOG-04

## Context

- Mirror landing Wrangler static deploy
- Update `AGENTS.md` Apps table
- Related ADR: ADR-5

## Acceptance criteria

- [x] `apps/blog/wrangler.jsonc` (`anthiel-blog`, `assets.directory: ./dist/client`)
- [x] Root `deploy:blog` script (and optional `deploy/blog.sh` if useful)
- [x] `apps/blog/README.md` with run/build/deploy docs
- [x] `AGENTS.md` lists Blog app
- [x] `bun run build` (blog) and typecheck/lint clean for touched code
