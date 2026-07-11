import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@anthiel/ui";
import { CheckIcon, MinusIcon } from "lucide-react";

import type { ListPermissions200DataItem } from "#/generated/api/model";

import { DataTableColumnHeader } from "./data-table-column-header";

export const permissionColumns: ColumnDef<ListPermissions200DataItem>[] = [
  {
    accessorKey: "key",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Permission" />,
    cell: ({ row }) => (
      <code className="font-mono text-foreground text-xs">{row.original.key}</code>
    ),
  },
  {
    accessorKey: "resourceKey",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal capitalize">
        {row.original.resourceKey}
      </Badge>
    ),
  },
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">{row.original.action}</span>
    ),
  },
  {
    id: "admin",
    accessorFn: (row) => (row.roles.includes("admin") ? 1 : 0),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Admin" />,
    cell: ({ row }) => <RoleGrant granted={row.original.roles.includes("admin")} />,
  },
  {
    id: "client",
    accessorFn: (row) => (row.roles.includes("client") ? 1 : 0),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => <RoleGrant granted={row.original.roles.includes("client")} />,
  },
];

function RoleGrant({ granted }: { granted: boolean }) {
  if (granted) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-md bg-foreground/5 text-foreground">
        <CheckIcon className="size-3.5" strokeWidth={1.5} />
        <span className="sr-only">Granted</span>
      </span>
    );
  }

  return (
    <span className="inline-flex size-6 items-center justify-center text-muted-foreground/50">
      <MinusIcon className="size-3.5" strokeWidth={1.5} />
      <span className="sr-only">Not granted</span>
    </span>
  );
}
