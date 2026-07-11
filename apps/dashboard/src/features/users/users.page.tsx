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

import type { ListRoles200DataItem } from "#/generated/api/model";

import { DataTableFrame } from "#/features/rbac/components/data-table-frame";
import { DataTableSearch } from "#/features/rbac/components/data-table-search";
import { PageHeader } from "#/features/rbac/components/page-header";
import { createFuzzySearcher, fuzzySearch } from "#/features/rbac/lib/fuzzy-search";
import {
  getListUsersQueryKey,
  useCreateUser,
  useDeleteUser,
  useGetUserById,
  useListBusinesses,
  useListRoles,
  useListUsers,
  useUpdateUser,
} from "#/generated/api";

import type { UserRecord } from "./types";

import { UserDetailDrawer, UserFormDrawer } from "./components/user-drawers";
import { createUserColumns } from "./components/users-columns";

const EMPTY_USERS: UserRecord[] = [];
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

function getRoleName(user: UserRecord) {
  if (!user.role) return "";
  return user.role.name;
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  const usersQuery = useListUsers();
  const rolesQuery = useListRoles();
  const businessesQuery = useListBusinesses();
  const userDetailQuery = useGetUserById(selectedUser?.id ?? "", {
    query: { enabled: Boolean(selectedUser && (detailOpen || editOpen)) },
  });

  const rows = usersQuery.data?.data.data ?? EMPTY_USERS;
  const roles = rolesQuery.data?.data.data ?? EMPTY_ROLES;
  const businesses = businessesQuery.data?.data.data ?? [];
  const searchableRows = useMemo(
    () => rows.map((user) => ({ ...user, roleName: getRoleName(user) })),
    [rows],
  );
  const fuse = useMemo(
    () => createFuzzySearcher(searchableRows, ["name", "username", "email", "roleName"]),
    [searchableRows],
  );
  const filteredRows = useMemo(
    () => fuzzySearch(fuse, searchableRows, query),
    [fuse, query, searchableRows],
  );

  const createMutation = useCreateUser({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setCreateOpen(false);
      },
    },
  });
  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setEditOpen(false);
        setSelectedUser(null);
      },
    },
  });
  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setDeleteOpen(false);
        setUserToDelete(null);
      },
    },
  });

  function openDetail(user: UserRecord) {
    setSelectedUser(user);
    setDetailOpen(true);
  }

  function openEdit(user: UserRecord) {
    setSelectedUser(user);
    setEditOpen(true);
  }

  function openDelete(user: UserRecord) {
    setUserToDelete(user);
    setDeleteOpen(true);
  }

  const columns = useMemo(
    () =>
      createUserColumns({
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

  const detailUser =
    userDetailQuery.data?.status === 200 ? userDetailQuery.data.data.data : selectedUser;
  const pageError =
    usersQuery.error ?? rolesQuery.error ?? businessesQuery.error ?? deleteMutation.error;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage dashboard users, account details, and assigned roles."
      />
      {pageError ? (
        <p className="text-destructive text-sm">
          {getErrorMessage(pageError, "Failed to load users")}
        </p>
      ) : null}
      {usersQuery.isPending ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      <DataTableFrame
        table={table}
        toolbar={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataTableSearch value={query} onValueChange={setQuery} placeholder="Search users…" />
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Create user
            </Button>
          </div>
        }
      />

      <UserFormDrawer
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        roles={roles}
        businesses={businesses}
        pending={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, "Failed to create user")
            : null
        }
        onSubmit={(values) => {
          if (!values.password) return;
          createMutation.mutate({
            data: {
              name: values.name,
              username: values.username,
              email: values.email,
              password: values.password,
              roleId: values.roleId,
              businessId: values.businessId,
            },
          });
        }}
      />
      <UserFormDrawer
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedUser(null);
        }}
        user={detailUser}
        roles={roles}
        businesses={businesses}
        pending={updateMutation.isPending}
        error={
          updateMutation.error
            ? getErrorMessage(updateMutation.error, "Failed to update user")
            : null
        }
        onSubmit={(values) => {
          if (!selectedUser) return;
          updateMutation.mutate({
            id: selectedUser.id,
            data: {
              name: values.name,
              username: values.username,
              email: values.email,
              roleId: values.roleId,
              businessId: values.businessId,
            },
          });
        }}
      />
      <UserDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedUser(null);
        }}
        user={detailUser}
        loading={userDetailQuery.isPending}
        error={
          userDetailQuery.error
            ? getErrorMessage(userDetailQuery.error, "Failed to load user")
            : null
        }
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setUserToDelete(null);
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {userToDelete?.name ?? "this user"}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              disabled={!userToDelete}
              onClick={() => {
                if (!userToDelete) return;
                deleteMutation.mutate({ id: userToDelete.id });
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
