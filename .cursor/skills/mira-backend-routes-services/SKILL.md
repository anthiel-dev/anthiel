---
name: mira-backend-routes-services
description: Guides implementation of Mira Elysia route plugins and domain services in apps/backend—Zod contracts on routes, Result and ApiError in services, thin handlers with unwrap, dependency injection, and layer boundaries. Use when writing or reviewing *.route.ts and *.service.ts under modules/, fixing validation drift, or mapping HTTP errors to domain failures.
disable-model-invocation: true
---

# Mira routes and services

Use together with **`@mira-backend-modular`** (folder layout) and the project rule **`mira-backend-routes-services`**.

## Routes

1. **Plugin factory** — `export const thingRoutes = (db: AppDb) => new Elysia({ prefix: "/things", name: "things" })…` Mount in `app.ts` with `.use(thingRoutes(db))`.
2. **Schemas** — Import Zod schemas from `../contracts/request.contract` / `response.contract`; pass them to `get` / `post` / `patch` / `delete` options (`query`, `params`, `body`, `response`).
3. **Handler body** — One primary service call, then `return unwrap(await service.method(…))`. Do not wrap `unwrap` in try/catch unless you rethrow.
4. **Context** — Prefer `log` from Elysia context (see `app.ts` `derive`) for request-scoped logs; avoid importing the root logger in routes unless necessary.
5. **Naming** — Match REST shape to Eden consumers: stable `prefix`, predictable path segments.

## Services

1. **Deps** — `class ThingService { constructor(private readonly deps: { db: AppDb }) {} }` (or explicit `readonly deps` field). Inject other ports the same way.
2. **Returns** — Public methods: `Promise<Result<T, ApiError>>`. Use `ok` / `err` from `@/lib/result` and static factories on `ApiError` (`NotFound`, `BadRequest`, etc.).
3. **DB I/O** — `tryDb(fn)` from `@/database/helpers` for database calls; `tryCatchWithError` with a custom mapper for non-DB async (e.g. password hashing).
4. **List queries** — `paginate`, `resolveOrderBy`, `ilikeContains` from `@/database/helpers`; keep domain `where` and `sortColumnMap` in the service.
5. **PATCH** — `requireNonEmptyPatch(data)` before update.
6. **Mutations** — prefer `.returning()` + `NotFound` on empty over pre-fetch `checkExists` unless the loaded row is needed.
7. **Validation semantics** — Enforce invariants services care about even if routes also validate; keep messages consistent.
8. **Types** — Import **types** from contracts where shared: `import type { ListThingRequest } from "../contracts/request.contract"`.

## Checklist (new endpoint)

- [ ] Request/response Zod schemas live in **contracts** and are used on the **route**.
- [ ] Service method signature takes plain inputs (no HTTP context).
- [ ] Service returns `Result` for all expected failure modes.
- [ ] Route uses **`unwrap`** (or equivalent) so `API_ERROR` handling in `app.ts` stays uniform.
- [ ] List/mutation DB code uses **`@/database/helpers`** where applicable (not copy-pasted pagination/ILIKE blocks).

## Anti-patterns

- Business branching, transactions, or N+1 queries in route handlers.
- Service methods that throw `Error` for expected failures instead of `err(ApiError.…)`.
- **`query as any` / `body as any`** instead of aligning Zod + inferred types.
- Local `ilikeContains` or count+findMany pagination blocks — use shared helpers.

## Related

- Modular layout: [mira-backend-modular](.cursor/skills/mira-backend-modular/SKILL.md)
- Refactor existing services: [mira-backend-service-refactor](.cursor/skills/mira-backend-service-refactor/SKILL.md)
- Rule (editor scope): `.cursor/rules/mira-backend-routes-services.mdc`
