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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { ListBusinesses200DataItem, ListRoles200DataItem } from "#/generated/api/model";

import type { UserRecord } from "../types";

const userFormBaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, underscores, and hyphens"),
  email: z.email("Enter a valid email"),
  roleId: z.string().min(1, "Role is required"),
  businessId: z.string(),
});

const createUserSchema = userFormBaseSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editUserSchema = userFormBaseSchema;

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

export type UserFormValues = {
  name: string;
  username: string;
  email: string;
  password?: string;
  roleId: string;
  businessId: string | null;
};

type UserFormDrawerProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserRecord | null;
  roles: ListRoles200DataItem[];
  businesses: ListBusinesses200DataItem[];
  pending: boolean;
  error: string | null;
  onSubmit: (values: UserFormValues) => void;
};

function getInitialRoleId(user: UserRecord | null | undefined) {
  if (!user) return "";
  if (user.roleId) return user.roleId;
  if (user.role) return user.role.id;
  return "";
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function UserFormDrawer({
  mode,
  open,
  onOpenChange,
  user,
  roles,
  businesses,
  pending,
  error,
  onSubmit,
}: UserFormDrawerProps) {
  const formId = `${mode}-user-form`;
  const title = mode === "create" ? "Create user" : "Edit user";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues | EditUserFormValues>({
    resolver: zodResolver(mode === "create" ? createUserSchema : editUserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      roleId: "",
      businessId: "",
    },
  });

  const roleId = useWatch({ control, name: "roleId" });
  const selectedRole = roles.find((role) => role.id === roleId);
  const selectedBusinessId = useWatch({ control, name: "businessId" });
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId);
  const isClientRole = selectedRole?.key === "client";

  useEffect(() => {
    if (!open) return;
    reset(
      mode === "edit"
        ? {
            name: user?.name ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            password: "",
            roleId: getInitialRoleId(user),
            businessId: user?.businessId ?? "",
          }
        : {
            name: "",
            username: "",
            email: "",
            password: "",
            roleId: "",
            businessId: "",
          },
    );
  }, [mode, open, reset, user]);

  function submit(values: CreateUserFormValues | EditUserFormValues) {
    onSubmit({
      name: values.name,
      username: values.username,
      email: values.email,
      roleId: values.roleId,
      businessId: isClientRole ? values.businessId || null : null,
      password: mode === "create" ? (values as CreateUserFormValues).password : undefined,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a user and assign their dashboard role."
              : "Update this user's profile and assigned role."}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <form id={formId} onSubmit={handleSubmit(submit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${mode}-user-name`}>Name</FieldLabel>
                <Input
                  id={`${mode}-user-name`}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  nativeInput
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                <FieldMessage message={errors.name?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-user-username`}>Username</FieldLabel>
                <Input
                  id={`${mode}-user-username`}
                  placeholder="jane.doe"
                  autoComplete="username"
                  nativeInput
                  aria-invalid={Boolean(errors.username)}
                  {...register("username")}
                />
                <FieldMessage message={errors.username?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-user-email`}>Email</FieldLabel>
                <Input
                  id={`${mode}-user-email`}
                  type="email"
                  placeholder="jane@company.com"
                  autoComplete="email"
                  nativeInput
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldMessage message={errors.email?.message} />
              </Field>
              {mode === "create" ? (
                <Field>
                  <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
                  <Input
                    id="create-user-password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    nativeInput
                    aria-invalid={Boolean((errors as { password?: { message?: string } }).password)}
                    {...register("password")}
                  />
                  <FieldMessage
                    message={(errors as { password?: { message?: string } }).password?.message}
                  />
                </Field>
              ) : null}
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Controller
                  control={control}
                  name="roleId"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger aria-label="Role" aria-invalid={Boolean(errors.roleId)}>
                        <SelectValue placeholder="Select a role">
                          {selectedRole?.name ?? null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldMessage message={errors.roleId?.message} />
              </Field>
              {isClientRole ? (
                <Field>
                  <FieldLabel>Business</FieldLabel>
                  <Controller
                    control={control}
                    name="businessId"
                    rules={{
                      validate: (value) =>
                        !isClientRole || Boolean(value) || "Business is required",
                    }}
                    render={({ field }) => (
                      <Select
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger
                          aria-label="Business"
                          aria-invalid={Boolean(errors.businessId)}
                        >
                          <SelectValue placeholder="Select a business">
                            {selectedBusiness?.name ?? null}
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
                    )}
                  />
                  <FieldMessage message={errors.businessId?.message} />
                </Field>
              ) : null}
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </FieldGroup>
          </form>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <Button type="submit" form={formId} loading={pending}>
            {mode === "create" ? "Create user" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

type UserDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRecord | null;
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

function getRoleName(user: UserRecord) {
  if (!user.role) return "No role";
  return user.role.name;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function UserDetailDrawer({
  open,
  onOpenChange,
  user,
  loading,
  error,
}: UserDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>User detail</SheetTitle>
          <SheetDescription>Profile, access, and account status.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {user ? (
            <dl>
              <DetailRow label="Name" value={user.name} />
              <DetailRow label="Username" value={user.username ?? "—"} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Role" value={getRoleName(user)} />
              <DetailRow label="Business" value={user.business?.name ?? "—"} />
              <div className="grid gap-1 border-b py-4">
                <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Status
                </dt>
                <dd className="flex gap-2">
                  <Badge variant={user.emailVerified ? "secondary" : "outline"}>
                    {user.emailVerified ? "Email verified" : "Email unverified"}
                  </Badge>
                  {user.status === "banned" ? <Badge variant="destructive">Banned</Badge> : null}
                </dd>
              </div>
              <DetailRow label="Created" value={formatDate(user.createdAt)} />
              <DetailRow label="Last updated" value={formatDate(user.updatedAt)} />
              <DetailRow label="User ID" value={user.id} />
            </dl>
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
