# CML-01 — Magic link sign-in (email match)

- **Status:** Done
- **Labels:** backend, dashboard, feature
- **Priority:** High
- **Depends on:** —

## Context

- Files: `apps/backend/src/core/auth.ts`, `apps/backend/src/core/magic-link-email.ts`, `apps/dashboard/src/lib/auth-client.ts`, `apps/dashboard/src/features/auth/`
- Related ADR: ADR-1, ADR-2, ADR-3

## Acceptance criteria

- [x] Better Auth `magicLink` plugin: `disableSignUp: true`, hashed store, Resend send
- [x] Mail sent only for existing unbanned `client` users; unknown/staff emails get no mail
- [x] Dashboard login is email-first; username/password still available
- [x] Invalid/expired link returns the user to login with a generic error
- [x] `bun run typecheck` / `bun run lint` clean
