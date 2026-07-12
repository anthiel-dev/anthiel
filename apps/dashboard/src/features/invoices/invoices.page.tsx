import { Button } from "@anthiel/ui";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@anthiel/ui/components/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTableFrame } from "#/features/rbac/components/data-table-frame";
import { DataTableSearch } from "#/features/rbac/components/data-table-search";
import { PageHeader } from "#/features/rbac/components/page-header";
import { createFuzzySearcher, fuzzySearch } from "#/features/rbac/lib/fuzzy-search";
import {
  getListInvoicesQueryKey,
  useCreateInvoice,
  useDeleteInvoice,
  useGetInvoiceById,
  useListBusinesses,
  useListInvoices,
  useListPaymentMethods,
  useUpdateInvoice,
} from "#/generated/api";
import { isAdminRole } from "#/lib/roles";

import type { InvoiceFormValues, InvoiceRecord, InvoiceStatus } from "./types";

import { InvoiceDetailDrawer, InvoiceFormDrawer } from "./components/invoice-drawers";
import { InvoicePreviewDialog } from "./components/invoice-preview-dialog";
import { createInvoiceColumns } from "./components/invoices-columns";
import { dueDateToIso } from "./types";

const EMPTY_INVOICES: InvoiceRecord[] = [];
const authenticatedRoute = getRouteApi("/_authenticated");

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

function parseLineItems(values: InvoiceFormValues) {
  return values.lineItems.map((line) => ({
    serviceType: line.serviceType,
    description: line.description.trim(),
    quantity: Number(line.quantity),
    unitAmount: Number(line.unitAmount),
  }));
}

export function InvoicesPage() {
  const { session } = authenticatedRoute.useRouteContext();
  const isAdmin = isAdminRole(session.user.role);
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([{ id: "issueDate", desc: true }]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceRecord | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);

  const invoicesQuery = useListInvoices();
  const businessesQuery = useListBusinesses({
    query: { enabled: isAdmin },
  });
  const paymentMethodsQuery = useListPaymentMethods({
    query: { enabled: isAdmin },
  });
  const invoiceDetailQuery = useGetInvoiceById(selectedInvoice?.id ?? "", {
    query: { enabled: Boolean(selectedInvoice && (detailOpen || editOpen)) },
  });

  const rows = invoicesQuery.data?.data.data ?? EMPTY_INVOICES;
  const businesses = businessesQuery.data?.data.data ?? [];
  const paymentMethods = paymentMethodsQuery.data?.data.data ?? [];

  const searchableRows = useMemo(
    () =>
      rows.map((invoice) => ({
        ...invoice,
        businessName: invoice.business.name,
        businessEmail: invoice.business.email ?? "",
      })),
    [rows],
  );
  const fuse = useMemo(
    () =>
      createFuzzySearcher(searchableRows, [
        "number",
        "businessName",
        "businessEmail",
        "status",
        "notes",
      ]),
    [searchableRows],
  );
  const filteredRows = useMemo(
    () => fuzzySearch(fuse, searchableRows, query),
    [fuse, query, searchableRows],
  );

  async function invalidateInvoices() {
    await queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
  }

  const createMutation = useCreateInvoice({
    mutation: {
      onSuccess: async () => {
        await invalidateInvoices();
        setCreateOpen(false);
      },
    },
  });
  const updateMutation = useUpdateInvoice({
    mutation: {
      onSuccess: async () => {
        await invalidateInvoices();
        setEditOpen(false);
        setSelectedInvoice(null);
      },
    },
  });
  const deleteMutation = useDeleteInvoice({
    mutation: {
      onSuccess: async () => {
        await invalidateInvoices();
        setDeleteOpen(false);
        setInvoiceToDelete(null);
      },
    },
  });

  function openDetail(invoice: InvoiceRecord) {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  }

  function openShowInvoice(invoice: InvoiceRecord) {
    setPreviewInvoice(invoice);
    setPreviewOpen(true);
  }

  function openEdit(invoice: InvoiceRecord) {
    setSelectedInvoice(invoice);
    setEditOpen(true);
  }

  function openDelete(invoice: InvoiceRecord) {
    setInvoiceToDelete(invoice);
    setDeleteOpen(true);
  }

  function openShare(invoice: InvoiceRecord) {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  }

  function changeStatus(invoice: InvoiceRecord, status: InvoiceStatus) {
    updateMutation.mutate({
      id: invoice.id,
      data: { status },
    });
  }

  const columns = useMemo(
    () =>
      createInvoiceColumns({
        isAdmin,
        onDetail: openDetail,
        onShowInvoice: openShowInvoice,
        onEdit: openEdit,
        onDelete: openDelete,
        onStatusChange: changeStatus,
        onShare: openShare,
      }),
    [isAdmin],
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

  const detailInvoice =
    invoiceDetailQuery.data?.status === 200 ? invoiceDetailQuery.data.data.data : selectedInvoice;
  const pageError =
    invoicesQuery.error ??
    (isAdmin ? businessesQuery.error : null) ??
    (isAdmin ? paymentMethodsQuery.error : null) ??
    deleteMutation.error;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description={
          isAdmin
            ? "Create and manage invoices for client businesses."
            : "View invoices issued to your business."
        }
      />
      <DataTableFrame
        table={table}
        loading={invoicesQuery.isPending}
        error={pageError ? getErrorMessage(pageError, "Failed to load invoices") : null}
        toolbar={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataTableSearch
              value={query}
              onValueChange={setQuery}
              placeholder="Search invoices…"
            />
            {isAdmin ? (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon />
                Create invoice
              </Button>
            ) : null}
          </div>
        }
      />

      <InvoiceFormDrawer
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        businesses={businesses}
        paymentMethods={paymentMethods}
        pending={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, "Failed to create invoice")
            : null
        }
        onSubmit={(values) => {
          createMutation.mutate({
            data: {
              businessId: values.businessId,
              paymentMethodId: values.paymentMethodId,
              dueDate: dueDateToIso(values.dueDate),
              notes: values.notes || null,
              lineItems: parseLineItems(values),
            },
          });
        }}
      />
      <InvoiceFormDrawer
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
        invoice={detailInvoice}
        businesses={businesses}
        paymentMethods={paymentMethods}
        pending={updateMutation.isPending}
        error={
          updateMutation.error
            ? getErrorMessage(updateMutation.error, "Failed to update invoice")
            : null
        }
        onSubmit={(values) => {
          if (!selectedInvoice) return;
          updateMutation.mutate({
            id: selectedInvoice.id,
            data: {
              businessId: values.businessId,
              paymentMethodId: values.paymentMethodId,
              dueDate: dueDateToIso(values.dueDate),
              notes: values.notes || null,
              lineItems: parseLineItems(values),
            },
          });
        }}
      />

      <InvoiceDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
        invoice={detailInvoice}
        loading={invoiceDetailQuery.isPending}
        error={
          invoiceDetailQuery.error
            ? getErrorMessage(invoiceDetailQuery.error, "Failed to load invoice")
            : null
        }
      />

      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setPreviewInvoice(null);
        }}
        invoice={previewInvoice}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setInvoiceToDelete(null);
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {invoiceToDelete?.number ?? "this invoice"}
              </span>
              . Only draft invoices can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              disabled={!invoiceToDelete}
              onClick={() => {
                if (!invoiceToDelete) return;
                deleteMutation.mutate({ id: invoiceToDelete.id });
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}
