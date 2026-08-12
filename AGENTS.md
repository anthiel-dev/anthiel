# Anthiel — agent guide

One-page map for AI-assisted work in this monorepo. Prefer `@`-mentioning reference paths over broad exploration.

## Apps

| App           | Path             | Stack                                       | Start here                                         |
| ------------- | ---------------- | ------------------------------------------- | -------------------------------------------------- |
| **API**       | `apps/backend`   | Elysia, Drizzle, Better Auth, Zod contracts | `src/modules/projects/` or `invoices/`             |
| **Dashboard** | `apps/dashboard` | TanStack Start, React, Tailwind, Orval      | `src/features/projects/`, `src/features/invoices/` |
| **Landing**   | `apps/landing`   | Marketing / public site (SSG)               | App `README.md`                                    |
| **Blog**      | `apps/blog`      | TanStack Start SSG, local MDX               | `src/content/blog/`, App `README.md`               |

## Packages

| Package              | Path                 | Role                    |
| -------------------- | -------------------- | ----------------------- |
| `@anthiel/ui`        | `packages/ui`        | Shared UI components    |
| `@anthiel/api-types` | `packages/api-types` | OpenAPI artifact export |

## Commands (repo root)

| Command             | Description                |
| ------------------- | -------------------------- |
| `bun install`       | Install all workspaces     |
| `bun run dev`       | All apps (Turbo)           |
| `bun run typecheck` | TypeScript across monorepo |
| `bun run lint`      | oxlint                     |
| `bun run format`    | oxfmt                      |
| `bun run build`     | Production builds          |

### Per-app

```bash
cd apps/backend && bun run dev
cd apps/dashboard && bun run dev
# After API contract changes, regenerate Orval clients in dashboard when that script exists
```

## Cursor config (canonical paths)

| Kind                                  | Location                    |
| ------------------------------------- | --------------------------- |
| **Rules** (auto-applied by glob)      | `.cursor/rules/*.mdc`       |
| **Skills** (task-specific deep dives) | `.cursor/skills/*/SKILL.md` |

### Rules by area

| Area                              | Rule file                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Monorepo tooling & agent behavior | `anthiel-agent-conventions.mdc` (also legacy `mira-agent-conventions.mdc`)                  |
| Task-boards (tracked work)        | `anthiel-task-boards.mdc`                                                                   |
| Frontend feature patterns         | `anthiel-frontend.mdc` / `mira-frontend-feature-patterns.mdc`                               |
| Frontend ↔ API                    | `mira-frontend-api-integration.mdc`                                                         |
| Backend modules                   | `anthiel-backend.mdc` / `backend-modular-structure.mdc`, `mira-backend-routes-services.mdc` |
| Bun                               | `anthiel-bun.mdc`                                                                           |

### Skills

| Skill                           | When to use                                                      |
| ------------------------------- | ---------------------------------------------------------------- |
| `anthiel-task-boards`           | Create/run markdown epics, cards, ADRs under `tasks-management/` |
| `anthiel-sync-rules`            | Sync company `anthiel-*.mdc` into `.cursor/rules/`               |
| `mira-frontend-feature`         | New dashboard (or similar) frontend feature                      |
| `mira-frontend-api-integration` | Wire Orval / API hooks                                           |
| `mira-backend-modular`          | New backend domain module                                        |
| `mira-backend-routes-services`  | Routes + services shape                                          |
| `transitions-dev`               | CSS motion polish                                                |
| `emil-design-eng`               | UI polish / interaction detail                                   |

Company skills install under `.agents/skills/` (mirrored in `.cursor/skills/` for Cursor). Source: `anthiel-dev/skills`.

## Task-boards (source of truth for agentic work)

Markdown task-boards under `tasks-management/<epic_name>/` hold plans, roadmaps, ADRs, and tracked multi-step work — replacing repo `docs/`, `.cursor/plans/`, and Plane. Rule: `.cursor/rules/anthiel-task-boards.mdc`. Skill: `anthiel-task-boards`.

> Plane is not used. Don't create/update Plane items unless the user explicitly asks.

Layout:

```
tasks-management/<epic_name>/
├── README.md          # Kanban board: Backlog / Todo / In Progress / Done
├── ADR.md             # Analysis + decisions (ADR-1..N)
└── tasks/<ID>-<slug>.md
```

### Agent loop

1. Resolve or create a task card (`tasks/<ID>-<slug>.md`) for multi-step product work; create the epic folder if new.
2. Set the card `Status: In Progress` and move its row in `README.md` when coding starts.
3. Split large scope into more small cards with `Depends on` / `Blocks`; keep each card runnable in one session.
4. Set `Status: Done` and move the row when acceptance criteria are met. Record decisions in the epic `ADR.md`.

## Session habits (save tokens)

- Prefer `@` paths and the golden paths in `mira-agent-conventions.mdc`.
- Don't re-explore folders already mapped here.
- Keep diffs surgical; don't commit/push unless asked.
