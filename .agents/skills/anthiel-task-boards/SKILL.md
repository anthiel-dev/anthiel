---
name: anthiel-task-boards
description: >-
  Create and run markdown task-boards under tasks-management/<epic>/. Use when
  starting a multi-step epic, adding task cards, updating kanban status, writing
  ADRs, or the user names a task ID (e.g. IS-03). Triggers on: "task board",
  "epic", "track this", "what's next", ADR, backlog/todo/in progress.
---

# Anthiel task-boards

Markdown kanban for agentic work. Companion rule: `anthiel-task-boards.mdc`.

## Create an epic

```
tasks-management/<epic_name>/
├── README.md
├── ADR.md
└── tasks/
```

1. Pick `snake_case` name + short ID prefix (2–4 letters), e.g. `invoice_sharing` → `IS`.
2. Write `README.md` from the board template below (scope + empty columns).
3. Seed `ADR.md` with locked scope; add ADR-N as decisions land.
4. Add one card per session-sized slice under `tasks/`. Put rows in the right board column.

## Board template (`README.md`)

```md
# <Epic Title> — Kanban Board

- **Analysis & decisions:** [`ADR.md`](./ADR.md)
- **Task cards:** [`tasks/`](./tasks)

## Scope (locked)

- <1–4 bullets: in / out of scope, surfaces>

## Legend

- **Labels:** app surface (`backend`, `frontend`/`dashboard`/`web`/`desktop`/`landing`/`mobile`, …), `feature`, `chore`, `bug`, `agent`
- **Priority:** High / Medium / Low
- Move a card by editing its `Status:` field and moving its row between columns.

## Board

### Backlog

| ID                             | Task    | Labels | Priority | Depends on |
| ------------------------------ | ------- | ------ | -------- | ---------- |
| [<ID>](./tasks/<ID>-<slug>.md) | <title> | …      | …        | —          |

### Todo

_None._

### In Progress

_None._

### Done

_None._

### Cancelled

_None._
```

## Card template (`tasks/<ID>-<slug>.md`)

```md
# <ID> — <title>

- **Status:** Todo
- **Labels:** backend, feature
- **Priority:** High
- **Depends on:** —

## Context

- Files: `path/…`
- Related ADR: ADR-N (if any)

## Acceptance criteria

- [ ] …
- [ ] `bun run typecheck` / `bun run lint` clean (when code changes)
```

## ADR template (`ADR.md`)

```md
# <Epic Title> — Analysis & ADR

## Scope (locked)

- …

## Current architecture

- …

## Gaps / options

1. …

## Architecture Decision Records

### ADR-1 — <title> — Accepted | Proposed | Rejected

<decision + rationale>
```

## Agent loop (per session)

1. **Resolve** — User gave an ID → open that card. Else read open columns on the epic board; create a card/epic if missing.
2. **Start** — `Status: In Progress` + move row to In Progress.
3. **Split** — If too big for one session, cut more cards; wire `Depends on`.
4. **Progress** — Check off ACs; append decisions to `ADR.md`.
5. **Done** — All ACs met (or user says done) → `Status: Done` + move row. Else leave In Progress / move to Todo with a note in Context.

## Companion rules

- `anthiel-task-boards.mdc`
- `anthiel-agent-conventions.mdc`

## Rules of thumb

- One card ≈ one PR-sized / one-session change.
- Board `README.md` is the status source of truth for “what’s next” — don’t invent from memory.
- No product plans/ADRs under `docs/` or `.cursor/plans/`.
- Do not use Plane unless the user explicitly asks.
