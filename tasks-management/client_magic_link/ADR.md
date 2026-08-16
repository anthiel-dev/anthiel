# Client Magic Link — Analysis & ADR

## Scope (locked)

- Existing Anthiel `client` users sign in via email magic link
- No auto-create accounts (`disableSignUp: true`)
- Staff/admin keep username + password
- BatamToday dashboard one-tap SSO is a later epic

## Current architecture

- Better Auth: username + password, cookie session on API origin
- Resend already sends invoice mail (`RESEND_*`)
- Client users are pre-provisioned and bound to a `businessId`

## Gaps / options

1. Custom SSO ticket from BatamToday API key — one-tap, more code
2. Better Auth `magicLink` — passwordless, inbox hop, email match

Chose 2 for client sign-in. Ticket stays a follow-up if BatamToday still wants one-tap.

## Architecture Decision Records

### ADR-1 — Magic link, not SSO ticket — Accepted

Use Better Auth `magicLink` with `disableSignUp: true`. Send mail only when the email matches an existing, unbanned `client` user. HTTP always reports success so unknown emails are not enumerable.

### ADR-2 — Send only to `client` role — Accepted

Admin/staff do not receive magic links. Username/password remains their path. Verify still refuses unknown emails via `disableSignUp`.

### ADR-3 — Hashed stored token — Accepted

`storeToken: "hashed"` so a `verification` table leak is not a live login URL.
