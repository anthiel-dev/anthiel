---
name: mira-frontend-feature
description: Scaffold or modify a frontend feature module in apps/web or apps/online-order. Use when creating a new feature, adding pages/components/hooks to an existing feature, or asking about the frontend feature structure, data layer, or UI patterns. Covers directory layout, data layer (api.ts, hooks.ts, models.ts), pages, table columns, form drawers/dialogs, routing, and naming conventions.
disable-model-invocation: true
---

# Mira frontend feature module

Standard patterns for building feature modules under `apps/web/src/features/` or `apps/online-order/src/features/`.

## Directory layout

Two variants exist depending on whether APIs are generated (Orval) or hand-written.

### Variant A — Generated API (preferred for new OpenAPI endpoints)

```
features/<feature-name>/
├── components/
│   ├── <entity>-columns.tsx        # Table column definitions
│   ├── <entity>-form.tsx           # Form drawer or dialog
│   └── <entity>-select.tsx         # Optional combobox/select picker
├── validators/
│   └── <entity>.validator.ts       # Zod schemas for form validation
├── <feature-name>.page.tsx         # List/main page component
├── index.ts                        # Barrel: re-exports page(s)
```

Hooks and types come from `@/generated/api` and `@/generated/api/model`.

### Variant B — Hand-written API (catalog-style features, non-OpenAPI)

```
features/<feature-name>/
├── data/
│   ├── api.ts                      # API client (object with methods)
│   ├── hooks.ts                    # TanStack Query/Mutation hooks
│   └── models.ts                   # Zod schemas + TS types
├── components/
│   ├── <entity>-table-columns.tsx  # Table column definitions
│   └── <entity>-form-dialog.tsx    # Form dialog or drawer
├── hooks/
│   └── use-<feature>-list-table.ts # useReactTable wiring + URL state
├── <feature-name>.page.tsx         # List/main page component
├── index.ts                        # Barrel: re-exports page(s)
```

## Data layer (Variant B)

### `data/models.ts`

Define Zod schemas, infer types, and export both. Use shared helpers from `@/features/catalog/shared/data/models` when applicable.

```typescript
import { z } from "zod";
import {
  CatalogStatusSchema,
  paginatedSchema,
  type CatalogStatus,
  type PaginationParams,
} from "@/features/catalog/shared/data/models";

const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: CatalogStatusSchema,
  // ...fields
});

const EntitiesListResponseSchema = paginatedSchema(EntitySchema);

const CreateEntityBodySchema = z.object({
  name: z.string().min(1),
  // ...required + optional fields
});

const UpdateEntityBodySchema = CreateEntityBodySchema.partial();

type Entity = z.infer<typeof EntitySchema>;
type EntitiesListResponse = z.infer<typeof EntitiesListResponseSchema>;
type CreateEntityBody = z.infer<typeof CreateEntityBodySchema>;
type UpdateEntityBody = z.infer<typeof UpdateEntityBodySchema>;

type ListEntitiesParams = PaginationParams & {
  search?: string;
  status?: CatalogStatus;
};

export type {
  Entity,
  EntitiesListResponse,
  CreateEntityBody,
  UpdateEntityBody,
  ListEntitiesParams,
};
export { EntitySchema, EntitiesListResponseSchema, CreateEntityBodySchema, UpdateEntityBodySchema };
```

### `data/api.ts`

Single object with `list`, `get`, `create`, `update`, `delete` methods. Uses `$fetch` from `@/lib/http-client` and `buildQuery` from `@/features/catalog/shared/data/build-query`.

```typescript
import { buildQuery } from "@/features/catalog/shared/data/build-query";
import { $fetch } from "@/lib/http-client";
import type {
  CreateEntityBody,
  ListEntitiesParams,
  UpdateEntityBody,
  Entity,
  EntitiesListResponse,
} from "./models";

const BASE = "/api/v1/<resource-path>";

const entitiesApi = {
  list: async (params: ListEntitiesParams = {}) => {
    const { data, error } = await $fetch<EntitiesListResponse>(BASE, {
      query: buildQuery({ page: params.page, limit: params.limit, search: params.search }),
    });
    if (error) throw error;
    return data;
  },
  get: async (id: string) => {
    const { data, error } = await $fetch<Entity>(`${BASE}/${id}`);
    if (error) throw error;
    return data;
  },
  create: async (body: CreateEntityBody) => {
    const { data, error } = await $fetch<Entity>(BASE, { method: "POST", body });
    if (error) throw error;
    return data;
  },
  update: async (id: string, body: UpdateEntityBody) => {
    const { data, error } = await $fetch<Entity>(`${BASE}/${id}`, { method: "PUT", body });
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { data, error } = await $fetch<Entity>(`${BASE}/${id}`, { method: "DELETE" });
    if (error) throw error;
    return data;
  },
};

export { entitiesApi };
```

### `data/hooks.ts`

Wrap API calls with `useQuery` / `useMutation`. Use hierarchical query keys: `["<domain>", "<entity>", "list" | "detail", ...params]`.

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateEntityBody, ListEntitiesParams, UpdateEntityBody } from "./models";
import { entitiesApi } from "./api";

function useEntitiesQuery(params: ListEntitiesParams = {}) {
  return useQuery({
    queryKey: ["catalog", "entities", "list", params] as const,
    queryFn: () => entitiesApi.list(params),
  });
}

function useEntityQuery(id: string | null) {
  return useQuery({
    queryKey: ["catalog", "entities", "detail", id ?? ""] as const,
    queryFn: () => entitiesApi.get(id!),
    enabled: !!id,
  });
}

function useCreateEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEntityBody) => entitiesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "entities", "list"] });
    },
  });
}

function useUpdateEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEntityBody }) =>
      entitiesApi.update(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "entities", "list"] });
      queryClient.invalidateQueries({ queryKey: ["catalog", "entities", "detail", id] });
    },
  });
}

function useDeleteEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "entities"] });
    },
  });
}

export {
  useEntitiesQuery,
  useEntityQuery,
  useCreateEntityMutation,
  useUpdateEntityMutation,
  useDeleteEntityMutation,
};
```

## Pages

### List page structure

Every list page follows this skeleton:

1. Call `useBreadcrumb(...)` at the top
2. Fetch data with query hook
3. Manage create/edit state with `React.useState`
4. Build columns (via hook or factory function)
5. Wire `useReactTable` with TanStack Table
6. Render `<Page>` → `<Page.Header>` → `<Page.Content>` → `<Page.Title>` → `<Card>` → `<DataTable>` → `<DataTableToolbar>`
7. Render form drawer/dialog outside the main content

```tsx
function EntityListPage() {
  useBreadcrumb([{ label: "Entities", href: "/backoffice/..." }]);

  const { data, isLoading } = useEntitiesQuery();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Entity | null>(null);

  // ... openCreate, openEdit callbacks
  // ... columns, table setup

  return (
    <Page>
      <Page.Header />
      <Page.Content>
        <Page.Title
          title="Entities"
          description="..."
          actions={[
            <Button key="add" onClick={openCreate}>
              <PlusIcon /> Add entity
            </Button>,
          ]}
        />
        <Card>
          <DataTable
            table={table}
            loading={isLoading}
            className="px-4"
            paginationTotalCount={data?.total}
          >
            <DataTableToolbar table={table} />
          </DataTable>
        </Card>
      </Page.Content>
      <EntityFormDrawer open={drawerOpen} onOpenChange={setDrawerOpen} entity={editing} />
    </Page>
  );
}

export { EntityListPage };
```

### URL state sync

Use `nuqs` for search/filter/sort/page URL state:

```typescript
const [searchInUrl, setSearchInUrl] = useQueryState(
  "search",
  parseAsString.withDefault("").withOptions({ history: "replace", clearOnDefault: true }),
);
const debouncedSearch = useDebouncedValue(searchInUrl, 300);
```

## Components

### Table columns

Use `createColumnHelper<Entity>()` from TanStack Table. Use `<DataTableColumnHeader>` for sortable headers. Action column uses `DropdownMenu`.

Naming: `useEntityColumns` (hook) or `createEntityColumns` (factory function).

### Form drawer

Use `<Drawer>` for side-panel forms, `<Dialog>` for modal forms. Both accept `open`, `onOpenChange`, and an optional entity for edit mode.

Forms use either `react-hook-form` + `zodResolver` (Variant A) or controlled `React.useState` fields (Variant B). Use `toast.success`/`toast.error` from `sonner` for feedback.

### Barrel `index.ts`

Re-export page components:

```typescript
export { EntityListPage } from "./entity.page";
```

## Routing

Routes live in `apps/web/src/routes/backoffice/` or `apps/online-order/src/routes/`. Use TanStack Router `createFileRoute`:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { EntityListPage } from "@/features/<feature-name>";

export const Route = createFileRoute("/backoffice/<path>/")({
  component: EntityListPage,
});
```

## Key conventions

- **Named exports only** — no default exports
- **Function declarations** — `function ComponentName()` not `const ComponentName = () =>`
- **Types via `type` keyword** — use `type` for type-only exports/imports
- **Sonner for toasts** — `toast.success(...)`, `toast.error(...)`
- **TanStack Table** — always via `useReactTable`, never raw `<table>`
- **Lucide icons** — `PlusIcon`, `MoreHorizontalIcon`, etc.
- **No unnecessary comments** — only add comments when the logic isn't self-explanatory
