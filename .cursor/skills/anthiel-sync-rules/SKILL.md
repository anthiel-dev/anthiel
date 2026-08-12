---
name: anthiel-sync-rules
description: >-
  Sync Anthiel Cursor rules (*.mdc) into a project’s .cursor/rules/. Use when
  the user asks to sync Anthiel rules, install/update Cursor rules from
  anthiel-dev/skills, copy rules into .cursor/rules, or set up company agent
  conventions in a consumer repo.
---

# Anthiel sync Cursor rules

`npx skills add` installs skills, not Cursor rules. This skill ships the rule
files and a script to copy them into `.cursor/rules/`.

## When to use

- “Sync Anthiel rules”
- “Install / update `.cursor/rules` from anthiel skills”
- First-time setup of a product repo for Anthiel agents

## Procedure

1. Confirm this skill is installed (folder contains `assets/*.mdc` and `scripts/sync.sh`).
2. Target = consumer app root (directory that should own `.cursor/rules/`). Default: current workspace root.
3. Run the sync script from **this skill’s directory**:

```bash
bash "<path-to-this-skill>/scripts/sync.sh" "<consumer-app-root>"
```

Examples (pick the path that exists after install):

```bash
# Project install (skills CLI)
bash .agents/skills/anthiel-sync-rules/scripts/sync.sh .
# or
bash .cursor/skills/anthiel-sync-rules/scripts/sync.sh .

# From anthiel-dev/skills clone
bash skills/anthiel-sync-rules/scripts/sync.sh /path/to/app
```

4. Verify `.cursor/rules/anthiel-*.mdc` exist.
5. Tell the user to **commit** `.cursor/rules/` in the product repo so the team shares them.

## What gets synced

| File                            | Role                                       |
| ------------------------------- | ------------------------------------------ |
| `anthiel-agent-conventions.mdc` | alwaysApply conventions                    |
| `anthiel-bun.mdc`               | Bun over npm/pnpm                          |
| `anthiel-frontend.mdc`          | Web / backoffice                           |
| `anthiel-backend.mdc`           | API modules                                |
| `anthiel-desktop.mdc`           | Desktop POS                                |
| `anthiel-task-boards.mdc`       | Markdown task-boards (`tasks-management/`) |
| `anthiel-copy.mdc`              | Copy / `t()`                               |

Source of truth for the files: this skill’s `assets/` (mirrored at repo `rules/` for Remote Rule / docs).

## Done criteria

- Script exited 0
- All `anthiel-*.mdc` present under `<app>/.cursor/rules/`
- User reminded to commit if this is a shared product repo

## Notes

- Overwrites same-named files in `.cursor/rules/` (does not delete unrelated rules).
- After updating `anthiel-dev/skills`, run `npx skills update` then sync again.
