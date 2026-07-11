import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { ListRoles200DataItem } from "#/generated/api/model";

import { useListRoles } from "#/generated/api";

import { DataTableFrame } from "./components/data-table-frame";
import { DataTableSearch } from "./components/data-table-search";
import { PageHeader } from "./components/page-header";
import { roleColumns } from "./components/roles-columns";
import { createFuzzySearcher, fuzzySearch } from "./lib/fuzzy-search";

const EMPTY_ROWS: ListRoles200DataItem[] = [];

export function RolesPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [query, setQuery] = useState("");
  const { data, error, isPending } = useListRoles();

  const rows = data?.data.data ?? EMPTY_ROWS;

  const fuse = useMemo(() => createFuzzySearcher(rows, ["name", "description"]), [rows]);

  const filteredRows = useMemo(() => fuzzySearch(fuse, rows, query), [fuse, query, rows]);

  const table = useReactTable({
    data: filteredRows,
    columns: roleColumns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles"
        description="Database-backed roles that gate admin capabilities and dashboard access."
      />
      {error ? (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Failed to load roles"}
        </p>
      ) : null}
      {isPending ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      <DataTableFrame
        table={table}
        toolbar={
          <DataTableSearch value={query} onValueChange={setQuery} placeholder="Search roles…" />
        }
      />
    </div>
  );
}
