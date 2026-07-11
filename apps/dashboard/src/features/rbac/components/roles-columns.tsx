import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@anthiel/ui";

import type { ListRoles200DataItem } from "#/generated/api/model";

import { DataTableColumnHeader } from "./data-table-column-header";

export const roleColumns: ColumnDef<ListRoles200DataItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground">{row.original.name}</span>
        <span className="font-mono text-muted-foreground text-xs">{row.original.key}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-normal">
        {row.original.description ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "permissionCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
    cell: ({ row }) => (
      <span className="tabular-nums text-foreground">{row.original.permissionCount}</span>
    ),
  },
  {
    accessorKey: "resources",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Resources" />,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1.5">
        {row.original.resources.map((resource) => (
          <Badge key={resource} variant="secondary" className="font-normal capitalize">
            {resource}
          </Badge>
        ))}
      </div>
    ),
  },
];
