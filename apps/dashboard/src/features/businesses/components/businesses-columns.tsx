import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@anthiel/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@anthiel/ui/components/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";

import { DataTableColumnHeader } from "#/features/rbac/components/data-table-column-header";

import type { BusinessRecord } from "../types";

import { formatDate } from "../types";

type BusinessColumnActions = {
  onDetail: (business: BusinessRecord) => void;
  onEdit: (business: BusinessRecord) => void;
  onDelete: (business: BusinessRecord) => void;
};

export function createBusinessColumns({
  onDetail,
  onEdit,
  onDelete,
}: BusinessColumnActions): ColumnDef<BusinessRecord>[] {
  return [
    {
      accessorKey: "name",
      meta: { label: "Name" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      meta: { label: "Email" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? "—"}</span>,
    },
    {
      accessorKey: "phone",
      meta: { label: "Phone" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone ?? "—"}</span>,
    },
    {
      accessorKey: "createdAt",
      meta: { label: "Created" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onDetail(row.original)}>Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
