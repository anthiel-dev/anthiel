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
  getListBusinessesQueryKey,
  useCreateBusiness,
  useDeleteBusiness,
  useGetBusinessById,
  useListBusinesses,
  useUpdateBusiness,
} from "#/generated/api";

import type { BusinessRecord } from "./types";

import { BusinessDetailDrawer, BusinessFormDrawer } from "./components/business-drawers";
import { createBusinessColumns } from "./components/businesses-columns";

const EMPTY_BUSINESSES: BusinessRecord[] = [];

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

export function BusinessesPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<BusinessRecord | null>(null);

  const businessesQuery = useListBusinesses();
  const businessDetailQuery = useGetBusinessById(selectedBusiness?.id ?? "", {
    query: { enabled: Boolean(selectedBusiness && (detailOpen || editOpen)) },
  });

  const rows = businessesQuery.data?.data.data ?? EMPTY_BUSINESSES;
  const fuse = useMemo(
    () => createFuzzySearcher(rows, ["name", "email", "phone", "address", "notes"]),
    [rows],
  );
  const filteredRows = useMemo(() => fuzzySearch(fuse, rows, query), [fuse, query, rows]);

  async function invalidateBusinesses() {
    await queryClient.invalidateQueries({
      queryKey: getListBusinessesQueryKey(),
    });
  }

  const createMutation = useCreateBusiness({
    mutation: {
      onSuccess: async () => {
        await invalidateBusinesses();
        setCreateOpen(false);
      },
    },
  });
  const updateMutation = useUpdateBusiness({
    mutation: {
      onSuccess: async () => {
        await invalidateBusinesses();
        setEditOpen(false);
        setSelectedBusiness(null);
      },
    },
  });
  const deleteMutation = useDeleteBusiness({
    mutation: {
      onSuccess: async () => {
        await invalidateBusinesses();
        setDeleteOpen(false);
        setBusinessToDelete(null);
      },
    },
  });

  function openDetail(business: BusinessRecord) {
    setSelectedBusiness(business);
    setDetailOpen(true);
  }

  function openEdit(business: BusinessRecord) {
    setSelectedBusiness(business);
    setEditOpen(true);
  }

  function openDelete(business: BusinessRecord) {
    setBusinessToDelete(business);
    setDeleteOpen(true);
  }

  const columns = useMemo(
    () =>
      createBusinessColumns({
        onDetail: openDetail,
        onEdit: openEdit,
        onDelete: openDelete,
      }),
    [],
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

  const detailBusiness =
    businessDetailQuery.data?.status === 200
      ? businessDetailQuery.data.data.data
      : selectedBusiness;
  const pageError = businessesQuery.error ?? deleteMutation.error;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Businesses"
        description="Manage client businesses that receive Anthiel invoices."
      />
      <DataTableFrame
        table={table}
        loading={businessesQuery.isPending}
        error={pageError ? getErrorMessage(pageError, "Failed to load businesses") : null}
        toolbar={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataTableSearch
              value={query}
              onValueChange={setQuery}
              placeholder="Search businesses…"
            />
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Create business
            </Button>
          </div>
        }
      />

      <BusinessFormDrawer
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        pending={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, "Failed to create business")
            : null
        }
        onSubmit={(values) => {
          createMutation.mutate({
            data: {
              name: values.name,
              email: values.email || null,
              phone: values.phone || null,
              address: values.address || null,
              notes: values.notes || null,
            },
          });
        }}
      />
      <BusinessFormDrawer
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedBusiness(null);
        }}
        business={detailBusiness}
        pending={updateMutation.isPending}
        error={
          updateMutation.error
            ? getErrorMessage(updateMutation.error, "Failed to update business")
            : null
        }
        onSubmit={(values) => {
          if (!selectedBusiness) return;
          updateMutation.mutate({
            id: selectedBusiness.id,
            data: {
              name: values.name,
              email: values.email || null,
              phone: values.phone || null,
              address: values.address || null,
              notes: values.notes || null,
            },
          });
        }}
      />
      <BusinessDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedBusiness(null);
        }}
        business={detailBusiness}
        loading={businessDetailQuery.isPending}
        error={
          businessDetailQuery.error
            ? getErrorMessage(businessDetailQuery.error, "Failed to load business")
            : null
        }
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setBusinessToDelete(null);
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {businessToDelete?.name ?? "this business"}
              </span>
              . Businesses with users or invoices cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              disabled={!businessToDelete}
              onClick={() => {
                if (!businessToDelete) return;
                deleteMutation.mutate({ id: businessToDelete.id });
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
