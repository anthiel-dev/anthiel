import type { FormEvent } from "react";

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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@anthiel/ui/components/sheet";
import { useEffect, useState } from "react";

import type { ListBusinesses200DataItem, ListRoles200DataItem } from "#/generated/api/model";

import type { UserRecord } from "../types";

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
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [businessId, setBusinessId] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(mode === "edit" ? (user?.name ?? "") : "");
    setUsername(mode === "edit" ? (user?.username ?? "") : "");
    setEmail(mode === "edit" ? (user?.email ?? "") : "");
    setPassword("");
    setRoleId(mode === "edit" ? getInitialRoleId(user) : "");
    setBusinessId(mode === "edit" ? (user?.businessId ?? "") : "");
  }, [mode, open, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password: mode === "create" ? password : undefined,
      roleId,
      businessId: isClientRole ? businessId || null : null,
    });
  }

  const title = mode === "create" ? "Create user" : "Edit user";
  const selectedRole = roles.find((role) => role.id === roleId);
  const selectedBusiness = businesses.find((business) => business.id === businessId);
  const isClientRole = selectedRole?.key === "client";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Add a user and assign their dashboard role."
                : "Update this user's profile and assigned role."}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="flex-1">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${mode}-user-name`}>Name</FieldLabel>
                <Input
                  id={`${mode}-user-name`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                  nativeInput
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-user-username`}>Username</FieldLabel>
                <Input
                  id={`${mode}-user-username`}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="jane.doe"
                  autoComplete="username"
                  minLength={3}
                  maxLength={32}
                  pattern="[a-zA-Z0-9._-]+"
                  required
                  nativeInput
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-user-email`}>Email</FieldLabel>
                <Input
                  id={`${mode}-user-email`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jane@company.com"
                  autoComplete="email"
                  required
                  nativeInput
                />
              </Field>
              {mode === "create" ? (
                <Field>
                  <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
                  <Input
                    id="create-user-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    nativeInput
                  />
                </Field>
              ) : null}
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={roleId || null}
                  onValueChange={(value) => setRoleId(value ?? "")}
                  required
                >
                  <SelectTrigger aria-label="Role">
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
              </Field>
              {isClientRole ? (
                <Field>
                  <FieldLabel>Business</FieldLabel>
                  <Select
                    value={businessId || null}
                    onValueChange={(value) => setBusinessId(value ?? "")}
                    required
                  >
                    <SelectTrigger aria-label="Business">
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
                </Field>
              ) : null}
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </FieldGroup>
          </SheetPanel>
          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={pending}
              disabled={!roleId || (isClientRole && !businessId)}
            >
              {mode === "create" ? "Create user" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
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
