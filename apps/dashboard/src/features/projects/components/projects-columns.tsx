import type { ColumnDef } from "@tanstack/react-table";

import { Badge, Button } from "@anthiel/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@anthiel/ui/components/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";

import { DataTableColumnHeader } from "#/features/rbac/components/data-table-column-header";

import type { ProjectRecord } from "../types";

import { STATUS_LABELS, formatDate } from "../types";

type ProjectColumnActions = {
  onDetail: (project: ProjectRecord) => void;
  onEdit: (project: ProjectRecord) => void;
  onMembers: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
};

export function createProjectColumns({
  onDetail,
  onEdit,
  onMembers,
  onDelete,
}: ProjectColumnActions): ColumnDef<ProjectRecord>[] {
  return [
    {
      accessorKey: "name",
      meta: { label: "Name" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      id: "business",
      accessorFn: (row) => row.business.name,
      meta: { label: "Business" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.business.name}</span>
      ),
    },
    {
      accessorKey: "status",
      meta: { label: "Status" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "secondary" : "outline"}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "memberCount",
      meta: { label: "Members" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Members" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.memberCount}</span>,
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onDetail(row.original)}>Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMembers(row.original)}>Members</DropdownMenuItem>
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
