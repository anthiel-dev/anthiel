import { Badge, Button, Field, FieldGroup, FieldLabel, Input } from "@anthiel/ui";
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
import { Textarea } from "@anthiel/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import type { ListBusinesses200DataItem } from "#/generated/api/model";

import type { ProjectFormValues, ProjectRecord } from "../types";

import { STATUS_LABELS, formatDate, projectFormSchema } from "../types";

type ProjectFormDrawerProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectRecord | null;
  businesses: ListBusinesses200DataItem[];
  pending: boolean;
  error: string | null;
  onSubmit: (values: ProjectFormValues) => void;
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function ProjectFormDrawer({
  mode,
  open,
  onOpenChange,
  project,
  businesses,
  pending,
  error,
  onSubmit,
}: ProjectFormDrawerProps) {
  const formId = `${mode}-project-form`;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      businessId: "",
      name: "",
      status: "active",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      mode === "edit"
        ? {
            businessId: project?.businessId ?? "",
            name: project?.name ?? "",
            status: project?.status ?? "active",
            notes: project?.notes ?? "",
          }
        : {
            businessId: "",
            name: "",
            status: "active",
            notes: "",
          },
    );
  }, [mode, open, project, reset]);

  const selectedBusinessId = project?.businessId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "Create project" : "Edit project"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a project under a client business for invoice access control."
              : "Update project details. Business cannot be changed after creation."}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Business</FieldLabel>
                {mode === "create" ? (
                  <Controller
                    control={control}
                    name="businessId"
                    render={({ field }) => {
                      const selected = businesses.find((business) => business.id === field.value);
                      return (
                        <Select
                          value={field.value || null}
                          onValueChange={(value) => field.onChange(value ?? "")}
                        >
                          <SelectTrigger
                            aria-label="Business"
                            aria-invalid={Boolean(errors.businessId)}
                          >
                            <SelectValue placeholder="Select a business">
                              {selected?.name ?? null}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {businesses.map((business) => (
                              <SelectItem key={business.id} value={business.id}>
                                {business.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                ) : (
                  <Input
                    value={
                      businesses.find((business) => business.id === selectedBusinessId)?.name ??
                      project?.business.name ??
                      ""
                    }
                    disabled
                    nativeInput
                    readOnly
                  />
                )}
                <FieldMessage message={errors.businessId?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-project-name`}>Name</FieldLabel>
                <Input
                  id={`${mode}-project-name`}
                  placeholder="Website redesign"
                  nativeInput
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                <FieldMessage message={errors.name?.message} />
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) =>
                        field.onChange((value as ProjectFormValues["status"]) ?? "active")
                      }
                    >
                      <SelectTrigger aria-label="Status" aria-invalid={Boolean(errors.status)}>
                        <SelectValue placeholder="Select status">
                          {STATUS_LABELS[field.value]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldMessage message={errors.status?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-project-notes`}>Notes</FieldLabel>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea
                      id={`${mode}-project-notes`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      placeholder="Optional notes"
                      rows={3}
                      aria-invalid={Boolean(errors.notes)}
                    />
                  )}
                />
                <FieldMessage message={errors.notes?.message} />
              </Field>
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </FieldGroup>
          </form>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <Button type="submit" form={formId} loading={pending}>
            {mode === "create" ? "Create project" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

type ProjectDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectRecord | null;
  loading: boolean;
  error: string | null;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-4 last:border-b-0">
      <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function ProjectDetailDrawer({
  open,
  onOpenChange,
  project,
  loading,
  error,
}: ProjectDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>Project detail</SheetTitle>
          <SheetDescription>Project profile and membership summary.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {project ? (
            <dl>
              <DetailRow label="Name" value={project.name} />
              <DetailRow label="Business" value={project.business.name} />
              <div className="grid gap-1 border-b py-4">
                <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Status
                </dt>
                <dd>
                  <Badge variant={project.status === "active" ? "secondary" : "outline"}>
                    {STATUS_LABELS[project.status]}
                  </Badge>
                </dd>
              </div>
              <DetailRow label="Members" value={String(project.memberCount)} />
              <DetailRow label="Notes" value={project.notes ?? "—"} />
              <DetailRow label="Created" value={formatDate(project.createdAt)} />
              <DetailRow label="Last updated" value={formatDate(project.updatedAt)} />
            </dl>
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
