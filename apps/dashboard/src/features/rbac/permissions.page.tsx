import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { ListPermissions200DataItem } from "#/generated/api/model";

import { useListPermissions } from "#/generated/api";

import { DataTableFrame } from "./components/data-table-frame";
import { DataTableSearch } from "./components/data-table-search";
import { PageHeader } from "./components/page-header";
import { permissionColumns } from "./components/permissions-columns";
import { createFuzzySearcher, fuzzySearch } from "./lib/fuzzy-search";

const EMPTY_ROWS: ListPermissions200DataItem[] = [];

export function PermissionsPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "key", desc: false }]);
  const [query, setQuery] = useState("");
  const { data, error, isPending } = useListPermissions();

  const rows = data?.data.data ?? EMPTY_ROWS;

  const fuse = useMemo(() => createFuzzySearcher(rows, ["key", "resourceKey"]), [rows]);

  const filteredRows = useMemo(() => fuzzySearch(fuse, rows, query), [fuse, query, rows]);

  const table = useReactTable({
    data: filteredRows,
    columns: permissionColumns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Permissions"
        description="Every permission in the catalog and which roles grant it."
      />
      {error ? (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Failed to load permissions"}
        </p>
      ) : null}
      {isPending ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      <DataTableFrame
        table={table}
        toolbar={
          <DataTableSearch
            value={query}
            onValueChange={setQuery}
            placeholder="Search permissions…"
          />
        }
      />
    </div>
  );
}
