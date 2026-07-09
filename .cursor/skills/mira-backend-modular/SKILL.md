---
name: mira-backend-modular
description: Guides Mira’s modular Elysia backend under apps/backend—directory layout per domain using the customers module as the reference shape, optional folders for integrations and webhooks, and import/OpenAPI consistency. Use when adding a module, splitting services or routes within a domain, placing contracts, or avoiding cross-module leakage.
disable-model-invocation: true
---

# Mira backend modular structure

## Route and service code style

Use **`@mira-backend-routes-services`** and `.cursor/rules/mira-backend-routes-services.mdc` for validation on routes, **`Result` / `ApiError`** in services, **`unwrap`/`tryDb`**, and thin handlers.

Refactoring existing services to shared DB helpers: **`mira-backend-service-refactor`** skill (reference: post-migration **`modules/users/`**).

## Canonical module shape (`modules/customers/`)

The **customers** module is the **reference** for new work:

```
modules/customers/
  contracts/request.contract.ts
  contracts/response.contract.ts
  routes/customers.route.ts   → customersRoutes(db)
  services/customers.service.ts
  index.ts                      → customersRoutes, CustomersService, exported response types
```

**`routes/customers.route.ts`**

- Factory: **`(db: AppDb) => new Elysia({ prefix: "/customers", name: "customers", tags: ["Customers"] })`**.
- **`.use(requiredAuthPlugin)`**, **`.use(organizationPlugin)`**, **`.use(selectedOutletPlugin)`** (or the plugins your domain needs).
- **`.model({ ... })`** maps names to Zod schemas from contracts; route options use **`query` / `body` / `response`** with those names or schemas.
- Handlers: **`return unwrap(await customersService.method(...))`**.

**`services/customers.service.ts`**

- **`class CustomersService`** with **`constructor(private readonly deps: { db: AppDb })`** (or equivalent).
- Public methods return **`Promise<Result<T, ApiError>>`**.

**`index.ts`**

- Export **`customersRoutes`**, **`CustomersService`**, and any **`types`** other modules need (often from **`contracts/response.contract`**).

## Where code lives

| Layer         | Path                    | Role                                                                                            |
| ------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| App shell     | `src/app.ts`            | **`.use(xRoutes(db))`**, **`export type App`**                                                  |
| Domain        | `src/modules/<domain>/` | **contracts**, **routes**, **services**, optional **integrations/**, **webhooks/**, **shared/** |
| Infra         | `src/core/`             | **plugins**, auth context, middlewares                                                          |
| Data          | `src/database/`         | Drizzle + **schema/**                                                                           |
| Cross-cutting | `src/lib/`              | **Result**, **ApiError**, validators, logger                                                    |
| Utilities     | `src/shared/`           | Optional; generic helpers only — **not** domain policy                                          |

## Bigger modules without changing the stack

If a domain grows (many endpoints or concerns):

- Add more **`services/<area>.service.ts`** files and inject them from the route factory (same as **customers** but multiple classes).
- Split **routes** only when it stays manageable — e.g. **`routes/<area>.route.ts`**, each exporting **`(db) => new Elysia({ prefix: "…" })`**, all mounted from **`app.ts`** or composed with **`.use`** from a single exported factory.
- Prefer **clear service boundaries** over inventing a second HTTP framework inside **`apps/backend`**.

## Integration-heavy domains (e.g. payment)

Optional folders (still Elysia at the edge):

- **`integrations/<provider>/`** — HTTP client, provider types.
- **`webhooks/`** — signature verification, parse payload, call **services**.
- **`constants/`** — values shared by routes and services.
- **`*.job.ts`** — background/cron-style entry points calling services.

## Consistency

- **Contracts**: single source for wire types; routes and services must agree.
- **Imports**: **`@/modules/<domain>`** barrel or **`@/lib`**, **`@/database`**, **`@/core`** — avoid deep **`../../other/services/foo`** unless the other module’s **public API** is intentionally that path.
- **OpenAPI**: **`tags`**, **`detail.summary`**, security on **`guard`**, and **response** schemas must stay correct for **`@mira/api-types`** / web codegen.

## Checklist (new domain)

- [ ] **`modules/<domain>/contracts`** + **`routes/<domain>.route.ts`** + **`services/<domain>.service.ts`** + **`index.ts`** (same spirit as **customers**).
- [ ] **`app.ts`**: **`.use(<domain>Routes(db))`**.
- [ ] Contracts used on routes **and** in service inputs/types.

## Anti-patterns

- Business logic, multi-step transactions, or ad-hoc Drizzle in route handlers (belongs in **services**).
- Duplicate schemas — route **`.model`** / **body** out of sync with **contracts**.
- **Deep imports** into another module’s internals instead of its **`index.ts`**.
- **Non–`Result` Throwing** for expected failures in services (map to **`ApiError`**).

## Related

- Elysia routes/services: [mira-backend-routes-services](../mira-backend-routes-services/SKILL.md)
- Editor rule: `.cursor/rules/backend-modular-structure.mdc`
