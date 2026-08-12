# Blog Infra — Kanban Board

- **Analysis & decisions:** [`ADR.md`](./ADR.md)
- **Task cards:** [`tasks/`](./tasks)

## Scope (locked)

- New SSG blog app at `apps/blog` (TanStack Start + local MDX + Cloudflare)
- i18n skeleton with English-only content for now (structure ready for more locales)
- Infra only: scaffold, SSG, MDX pipeline, routes, deploy wiring — not polished design, tags, RSS, sitemap, or advanced SEO

## Legend

- **Labels:** app surface (`backend`, `frontend`/`dashboard`/`web`/`desktop`/`landing`/`mobile`/`blog`, …), `feature`, `chore`, `bug`, `agent`
- **Priority:** High / Medium / Low
- Move a card by editing its `Status:` field and moving its row between columns.

## Board

### Backlog

_None._

### Todo

_None._

### In Progress

_None._

### Done

| ID                                          | Task                                   | Labels               | Priority | Depends on       |
| ------------------------------------------- | -------------------------------------- | -------------------- | -------- | ---------------- |
| [BLOG-01](./tasks/BLOG-01-scaffold.md)      | Scaffold apps/blog                     | blog, chore, agent   | High     | —                |
| [BLOG-02](./tasks/BLOG-02-mdx-pipeline.md)  | MDX content pipeline                   | blog, feature, agent | High     | BLOG-01          |
| [BLOG-03](./tasks/BLOG-03-i18n-skeleton.md) | i18n skeleton (English default)        | blog, feature, agent | High     | BLOG-01          |
| [BLOG-04](./tasks/BLOG-04-routes.md)        | Blog index + post routes + sample post | blog, feature, agent | High     | BLOG-02, BLOG-03 |
| [BLOG-05](./tasks/BLOG-05-deploy-wiring.md) | Deploy + monorepo wiring               | blog, chore, agent   | High     | BLOG-04          |

### Cancelled

_None._
