import type { ColumnDef } from "@tanstack/react-table";

import { Badge, Button } from "@anthiel/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@anthiel/ui/components/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";

import { DataTableColumnHeader } from "#/features/rbac/components/data-table-column-header";

import type { InvoiceRecord, InvoiceStatus } from "../types";

import { SERVICE_TYPE_OPTIONS, STATUS_LABELS, formatDate, formatIdr } from "../types";

const SERVICE_TYPE_LABELS = Object.fromEntries(
  SERVICE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<InvoiceRecord["lineItems"][number]["serviceType"], string>;

function formatServiceTypes(lineItems: InvoiceRecord["lineItems"]) {
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const item of lineItems) {
    if (seen.has(item.serviceType)) continue;
    seen.add(item.serviceType);
    labels.push(SERVICE_TYPE_LABELS[item.serviceType] ?? item.serviceType);
  }

  return labels.length > 0 ? labels.join(", ") : "—";
}

type InvoiceColumnActions = {
  isAdmin: boolean;
  onDetail: (invoice: InvoiceRecord) => void;
  onShowInvoice: (invoice: InvoiceRecord) => void;
  onEdit: (invoice: InvoiceRecord) => void;
  onDelete: (invoice: InvoiceRecord) => void;
  onStatusChange: (invoice: InvoiceRecord, status: InvoiceStatus) => void;
  onShare: (invoice: InvoiceRecord) => void;
};

function statusVariant(status: InvoiceStatus) {
  if (status === "paid") return "secondary" as const;
  if (status === "cancelled") return "outline" as const;
  if (status === "sent") return "default" as const;
  return "outline" as const;
}

export function createInvoiceColumns({
  isAdmin,
  onDetail,
  onShowInvoice,
  onEdit,
  onDelete,
  onStatusChange,
  onShare,
}: InvoiceColumnActions): ColumnDef<InvoiceRecord>[] {
  return [
    {
      accessorKey: "number",
      meta: { label: "Number" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.number}</span>,
    },
    {
      id: "project",
      accessorFn: (row) => row.project.name,
      meta: { label: "Project" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
      cell: ({ row }) => (
        <span className="truncate font-medium text-foreground">{row.original.project.name}</span>
      ),
    },
    {
      id: "business",
      accessorFn: (row) => row.business.name,
      meta: { label: "Business" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.original.business.name}</p>
          <p className="truncate text-muted-foreground text-xs">
            {row.original.business.email ?? "—"}
          </p>
        </div>
      ),
    },
    {
      id: "serviceType",
      accessorFn: (row) => formatServiceTypes(row.lineItems),
      meta: { label: "Service type" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Service type" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatServiceTypes(row.original.lineItems)}</span>
      ),
    },
    {
      accessorKey: "status",
      meta: { label: "Status" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)} className="capitalize">
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "totalAmount",
      meta: { label: "Total" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatIdr(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "issueDate",
      meta: { label: "Issued" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.issueDate)}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      meta: { label: "Due" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => {
        const invoice = row.original;
        const canEdit = isAdmin && invoice.status === "draft";
        const canDelete = isAdmin && invoice.status === "draft";
        const canSend = isAdmin && invoice.status === "draft";
        const canMarkPaid = isAdmin && invoice.status === "sent";
        const canCancel = isAdmin && (invoice.status === "draft" || invoice.status === "sent");
        const canShare = invoice.status !== "draft";

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${invoice.number}`}
                  />
                }
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onDetail(invoice)}>Detail</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowInvoice(invoice)}>
                  Show Invoice
                </DropdownMenuItem>
                {canShare ? (
                  <DropdownMenuItem onClick={() => onShare(invoice)}>Share link</DropdownMenuItem>
                ) : null}
                {canEdit ? (
                  <DropdownMenuItem onClick={() => onEdit(invoice)}>Edit</DropdownMenuItem>
                ) : null}
                {canSend || canMarkPaid || canCancel ? <DropdownMenuSeparator /> : null}
                {canSend ? (
                  <DropdownMenuItem onClick={() => onStatusChange(invoice, "sent")}>
                    Mark as sent
                  </DropdownMenuItem>
                ) : null}
                {canMarkPaid ? (
                  <DropdownMenuItem onClick={() => onStatusChange(invoice, "paid")}>
                    Mark as paid
                  </DropdownMenuItem>
                ) : null}
                {canCancel ? (
                  <DropdownMenuItem onClick={() => onStatusChange(invoice, "cancelled")}>
                    Cancel
                  </DropdownMenuItem>
                ) : null}
                {canDelete ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(invoice)}>
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
