import { useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { ListPermissions200DataItem, ListRoles200DataItem } from "#/generated/api/model";

import {
  getListPermissionsQueryKey,
  getListRolesQueryKey,
  useListPermissions,
  useListRoles,
  useUpdateRolePermission,
} from "#/generated/api";

import { DataTableFrame } from "./components/data-table-frame";
import { DataTableSearch } from "./components/data-table-search";
import { PageHeader } from "./components/page-header";
import { createPermissionColumns } from "./components/permissions-columns";
import { createFuzzySearcher, fuzzySearch } from "./lib/fuzzy-search";

const EMPTY_PERMISSIONS: ListPermissions200DataItem[] = [];
const EMPTY_ROLES: ListRoles200DataItem[] = [];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "object" && error && "error" in error) {
    return String(error.error);
  }
  return fallback;
}

export function PermissionsPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: "key", desc: false }]);
  const [query, setQuery] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const permissionsQuery = useListPermissions();
  const rolesQuery = useListRoles();

  const rows = permissionsQuery.data?.data.data ?? EMPTY_PERMISSIONS;
  const roles = rolesQuery.data?.data.data ?? EMPTY_ROLES;

  const fuse = useMemo(() => createFuzzySearcher(rows, ["key", "resourceKey"]), [rows]);
  const filteredRows = useMemo(() => fuzzySearch(fuse, rows, query), [fuse, query, rows]);

  const updateMutation = useUpdateRolePermission({
    mutation: {
      onMutate: ({ id, data }) => {
        setActionError(null);
        setPendingKey(`${id}:${data.permissionId}`);
      },
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListPermissionsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() }),
        ]);
      },
      onError: (error) => {
        setActionError(getErrorMessage(error, "Failed to update permission"));
      },
      onSettled: () => {
        setPendingKey(null);
      },
    },
  });

  const columns = useMemo(
    () =>
      createPermissionColumns({
        roles,
        pendingKey,
        onToggle: ({ roleId, permissionId, granted }) => {
          updateMutation.mutate({
            id: roleId,
            data: { permissionId, granted },
          });
        },
      }),
    [pendingKey, roles, updateMutation.mutate],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const loadError = permissionsQuery.error ?? rolesQuery.error;
  const errorMessage =
    actionError ??
    (loadError
      ? loadError instanceof Error
        ? loadError.message
        : "Failed to load permissions"
      : null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Permissions"
        description="Grant or revoke permissions per role. Changes apply immediately."
      />
      <DataTableFrame
        table={table}
        loading={permissionsQuery.isPending || rolesQuery.isPending}
        error={errorMessage}
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
