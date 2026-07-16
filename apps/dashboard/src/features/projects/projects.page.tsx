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
  getListProjectsQueryKey,
  useCreateProject,
  useDeleteProject,
  useGetProjectById,
  useListBusinesses,
  useListProjects,
  useListUsers,
  useUpdateProject,
} from "#/generated/api";

import type { ProjectRecord } from "./types";

import { ProjectDetailDrawer, ProjectFormDrawer } from "./components/project-drawers";
import { ProjectMembersDrawer } from "./components/project-members-drawer";
import { createProjectColumns } from "./components/projects-columns";

const EMPTY_PROJECTS: ProjectRecord[] = [];

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

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectRecord | null>(null);

  const projectsQuery = useListProjects();
  const businessesQuery = useListBusinesses();
  const usersQuery = useListUsers();
  const projectDetailQuery = useGetProjectById(selectedProject?.id ?? "", {
    query: { enabled: Boolean(selectedProject && (detailOpen || editOpen)) },
  });

  const rows = projectsQuery.data?.data.data ?? EMPTY_PROJECTS;
  const businesses = businessesQuery.data?.data.data ?? [];
  const users = usersQuery.data?.data.data ?? [];

  const searchableRows = useMemo(
    () =>
      rows.map((project) => ({
        ...project,
        businessName: project.business.name,
      })),
    [rows],
  );
  const fuse = useMemo(
    () => createFuzzySearcher(searchableRows, ["name", "businessName", "status", "notes"]),
    [searchableRows],
  );
  const filteredRows = useMemo(
    () => fuzzySearch(fuse, searchableRows, query),
    [fuse, query, searchableRows],
  );

  async function invalidateProjects() {
    await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
  }

  const createMutation = useCreateProject({
    mutation: {
      onSuccess: async () => {
        await invalidateProjects();
        setCreateOpen(false);
      },
    },
  });
  const updateMutation = useUpdateProject({
    mutation: {
      onSuccess: async () => {
        await invalidateProjects();
        setEditOpen(false);
        setSelectedProject(null);
      },
    },
  });
  const deleteMutation = useDeleteProject({
    mutation: {
      onSuccess: async () => {
        await invalidateProjects();
        setDeleteOpen(false);
        setProjectToDelete(null);
      },
    },
  });

  function openDetail(project: ProjectRecord) {
    setSelectedProject(project);
    setDetailOpen(true);
  }

  function openEdit(project: ProjectRecord) {
    setSelectedProject(project);
    setEditOpen(true);
  }

  function openMembers(project: ProjectRecord) {
    setSelectedProject(project);
    setMembersOpen(true);
  }

  function openDelete(project: ProjectRecord) {
    setProjectToDelete(project);
    setDeleteOpen(true);
  }

  const columns = useMemo(
    () =>
      createProjectColumns({
        onDetail: openDetail,
        onEdit: openEdit,
        onMembers: openMembers,
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

  const detailProject =
    projectDetailQuery.data?.status === 200 ? projectDetailQuery.data.data.data : selectedProject;
  const pageError =
    projectsQuery.error ?? businessesQuery.error ?? usersQuery.error ?? deleteMutation.error;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Group invoices under client projects and control who can see them."
      />
      <DataTableFrame
        table={table}
        loading={projectsQuery.isPending}
        error={pageError ? getErrorMessage(pageError, "Failed to load projects") : null}
        toolbar={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataTableSearch
              value={query}
              onValueChange={setQuery}
              placeholder="Search projects…"
            />
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Create project
            </Button>
          </div>
        }
      />

      <ProjectFormDrawer
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        businesses={businesses}
        pending={createMutation.isPending}
        error={
          createMutation.error
            ? getErrorMessage(createMutation.error, "Failed to create project")
            : null
        }
        onSubmit={(values) => {
          createMutation.mutate({
            data: {
              businessId: values.businessId,
              name: values.name,
              status: values.status,
              notes: values.notes || null,
            },
          });
        }}
      />
      <ProjectFormDrawer
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedProject(null);
        }}
        project={detailProject}
        businesses={businesses}
        pending={updateMutation.isPending}
        error={
          updateMutation.error
            ? getErrorMessage(updateMutation.error, "Failed to update project")
            : null
        }
        onSubmit={(values) => {
          if (!selectedProject) return;
          updateMutation.mutate({
            id: selectedProject.id,
            data: {
              name: values.name,
              status: values.status,
              notes: values.notes || null,
            },
          });
        }}
      />
      <ProjectDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedProject(null);
        }}
        project={detailProject}
        loading={projectDetailQuery.isPending}
        error={
          projectDetailQuery.error
            ? getErrorMessage(projectDetailQuery.error, "Failed to load project")
            : null
        }
      />
      <ProjectMembersDrawer
        open={membersOpen}
        onOpenChange={(open) => {
          setMembersOpen(open);
          if (!open) setSelectedProject(null);
        }}
        project={selectedProject}
        users={users}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setProjectToDelete(null);
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {projectToDelete?.name ?? "this project"}
              </span>
              . Projects with members or invoices cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              disabled={!projectToDelete}
              onClick={() => {
                if (!projectToDelete) return;
                deleteMutation.mutate({ id: projectToDelete.id });
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
