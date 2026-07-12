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

import type { PaymentMethodRecord } from "../types";

import { formatDate, paymentMethodLabel } from "../types";

type PaymentMethodColumnActions = {
  onDetail: (paymentMethod: PaymentMethodRecord) => void;
  onEdit: (paymentMethod: PaymentMethodRecord) => void;
  onDelete: (paymentMethod: PaymentMethodRecord) => void;
};

export function createPaymentMethodColumns({
  onDetail,
  onEdit,
  onDelete,
}: PaymentMethodColumnActions): ColumnDef<PaymentMethodRecord>[] {
  return [
    {
      accessorKey: "method",
      meta: { label: "Method" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {paymentMethodLabel(row.original.method)}
        </span>
      ),
    },
    {
      accessorKey: "receiverName",
      meta: { label: "Receiver" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Receiver" />,
      cell: ({ row }) => <span className="text-foreground">{row.original.receiverName}</span>,
    },
    {
      accessorKey: "accountNumber",
      meta: { label: "Account no." },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Account no." />,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.accountNumber ?? "—"}
        </span>
      ),
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
                  aria-label={`Actions for ${row.original.receiverName}`}
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
