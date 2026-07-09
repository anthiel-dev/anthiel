---
name: mira-frontend-api-integration
description: Regenerates OpenAPI-backed TanStack Query clients for Mira web and online-order after backend API changes, and consumes hooks from Orval output. Use when a new API is added, OpenAPI or routes change under apps/backend, packages/api-types is updated, or when wiring apps/web or apps/online-order features to HTTP; also when the user mentions Orval, openapi.json, or @/generated/api.
disable-model-invocation: true
---

# Mira frontend ↔ backend API integration

When a new API is introduced or if there's an update in backend, front end must run openapi and orval regeneration.

Frontend SHOULD use tanstack queries or mutations from the generated files.

## Regenerate (required after backend/OpenAPI changes)

From **`apps/web`** or **`apps/online-order`**:

```bash
bun run api:generate
```

This runs:

1. **`api:fetch-spec`** — fetches/patches the spec via **`packages/api-types`** (`fetch-openapi`, `patch-transactions`), producing/updating **`packages/api-types/openapi.json`**.
2. **Orval** — `bunx orval --config orval.config.ts` reads that spec and regenerates clients.

To only refresh the spec without Orval (rare): `bun run api:fetch-spec`.

Do **not** edit **`src/generated/api/**`\*\* by hand in either app; fix the backend/OpenAPI surface and regenerate.

## Generated layout

- Hooks and API functions: **`src/generated/api/index.ts`** (import as `@/generated/api`).
- DTO / schema types: **`src/generated/api/model`** (e.g. `@/generated/api/model/...`).
- HTTP transport: custom mutator **`src/lib/http-client.ts`** (`miraFetch`).

Orval uses **`client: "react-query"`** (TanStack Query) and **`httpClient: "fetch"`**.

## Consuming APIs in features

- Prefer **`useQuery` / `useMutation`** (and related helpers) exported from **`@/generated/api`** for endpoints present in the OpenAPI spec.
- Prefer types from **`@/generated/api/model`** over duplicating request/response shapes.
- For invalidation or keys, use **`get*QueryKey`** helpers from **`@/generated/api`** when the generator exposes them.

Avoid ad-hoc **`fetch`** to REST paths when a generated hook exists, unless there is a documented exception (e.g. non-OpenAPI surface).

## Checklist (backend or contract change)

- [ ] Backend exposes the operation on the served OpenAPI document consumed by **`packages/api-types`**.
- [ ] Run **`bun run api:generate`** from **`apps/web`** or **`apps/online-order`** and commit updated **`openapi.json`** (if changed) and generated **`src/generated/api`** output as required by the team.
- [ ] Wire UI with generated TanStack Query hooks/mutations and generated types.

## Related

- Orval config: `apps/web/orval.config.ts`, `apps/online-order/orval.config.ts`
- Rule (editor scope): `.cursor/rules/mira-frontend-api-integration.mdc`
