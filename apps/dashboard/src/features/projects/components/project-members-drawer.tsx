import { Button, Field, FieldLabel } from "@anthiel/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@anthiel/ui/components/select";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@anthiel/ui/components/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import type { ListUsers200DataItem } from "#/generated/api/model";

import {
  getListProjectMembersQueryKey,
  getListProjectsQueryKey,
  useAddProjectMember,
  useListProjectMembers,
  useRemoveProjectMember,
} from "#/generated/api";

import type { ProjectRecord } from "../types";

import { formatDate } from "../types";

type ProjectMembersDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectRecord | null;
  users: ListUsers200DataItem[];
};

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

export function ProjectMembersDrawer({
  open,
  onOpenChange,
  project,
  users,
}: ProjectMembersDrawerProps) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const projectId = project?.id ?? "";

  const membersQuery = useListProjectMembers(projectId, {
    query: { enabled: Boolean(project && open) },
  });

  const members = membersQuery.data?.status === 200 ? membersQuery.data.data.data : [];
  const memberIds = useMemo(() => new Set(members.map((member) => member.userId)), [members]);

  const availableUsers = useMemo(
    () =>
      users.filter((user) => {
        if (memberIds.has(user.id)) return false;
        if (user.role?.key === "admin") return false;
        if (user.role?.key === "client") {
          return Boolean(project && user.businessId === project.businessId);
        }
        return true;
      }),
    [memberIds, project, users],
  );

  const selectedUser = availableUsers.find((user) => user.id === userId);

  async function invalidateMembers() {
    if (!projectId) return;
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getListProjectMembersQueryKey(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: getListProjectsQueryKey(),
      }),
    ]);
  }

  const addMutation = useAddProjectMember({
    mutation: {
      onSuccess: async () => {
        await invalidateMembers();
        setUserId("");
      },
    },
  });

  const removeMutation = useRemoveProjectMember({
    mutation: {
      onSuccess: async () => {
        await invalidateMembers();
      },
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setUserId("");
      }}
    >
      <SheetPopup side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Project members</SheetTitle>
          <SheetDescription>
            {project
              ? `Manage who can access invoices for ${project.name}.`
              : "Manage project members."}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <div className="space-y-6">
            <div className="space-y-3">
              <Field>
                <FieldLabel>Add member</FieldLabel>
                <Select value={userId || null} onValueChange={(value) => setUserId(value ?? "")}>
                  <SelectTrigger aria-label="User">
                    <SelectValue placeholder="Select a user">
                      {selectedUser
                        ? `${selectedUser.name} (${selectedUser.role?.name ?? "No role"})`
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} · {user.role?.name ?? "No role"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Button
                disabled={!userId || !project}
                loading={addMutation.isPending}
                onClick={() => {
                  if (!project || !userId) return;
                  addMutation.mutate({ id: project.id, data: { userId } });
                }}
              >
                Add member
              </Button>
              {addMutation.error ? (
                <p className="text-destructive text-sm">
                  {getErrorMessage(addMutation.error, "Failed to add member")}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="font-medium text-sm">Current members</p>
              {membersQuery.isPending ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : null}
              {membersQuery.error ? (
                <p className="text-destructive text-sm">
                  {getErrorMessage(membersQuery.error, "Failed to load members")}
                </p>
              ) : null}
              {members.length === 0 && !membersQuery.isPending ? (
                <p className="text-muted-foreground text-sm">No members yet.</p>
              ) : null}
              <ul className="space-y-2">
                {members.map((member) => (
                  <li
                    key={member.userId}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{member.name}</p>
                      <p className="truncate text-muted-foreground text-xs">{member.email}</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {member.role ?? "No role"} · joined {formatDate(member.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${member.name}`}
                      loading={removeMutation.isPending}
                      onClick={() => {
                        if (!project) return;
                        removeMutation.mutate({ id: project.id, userId: member.userId });
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ul>
              {removeMutation.error ? (
                <p className="text-destructive text-sm">
                  {getErrorMessage(removeMutation.error, "Failed to remove member")}
                </p>
              ) : null}
            </div>
          </div>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}
