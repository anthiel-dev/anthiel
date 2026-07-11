import type { FormEvent } from "react";

import { Button, Field, FieldGroup, FieldLabel, Input } from "@anthiel/ui";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@anthiel/ui/components/sheet";
import { Textarea } from "@anthiel/ui/components/textarea";
import { useEffect, useState } from "react";

import type { BusinessFormValues, BusinessRecord } from "../types";

import { formatDate } from "../types";
import { IndonesiaPhoneInput } from "./indonesia-phone-input";

type BusinessFormDrawerProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business?: BusinessRecord | null;
  pending: boolean;
  error: string | null;
  onSubmit: (values: BusinessFormValues) => void;
};

export function BusinessFormDrawer({
  mode,
  open,
  onOpenChange,
  business,
  pending,
  error,
  onSubmit,
}: BusinessFormDrawerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(mode === "edit" ? (business?.name ?? "") : "");
    setEmail(mode === "edit" ? (business?.email ?? "") : "");
    setPhone(mode === "edit" ? (business?.phone ?? "") : "");
    setAddress(mode === "edit" ? (business?.address ?? "") : "");
    setNotes(mode === "edit" ? (business?.notes ?? "") : "");
  }, [business, mode, open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Create business" : "Edit business"}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Add a client business that invoices can be assigned to."
                : "Update business contact details."}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="flex-1">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-name`}>Name</FieldLabel>
                <Input
                  id={`${mode}-business-name`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Acme Coffee"
                  required
                  nativeInput
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-email`}>Email</FieldLabel>
                <Input
                  id={`${mode}-business-email`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="hello@acmecoffee.com"
                  nativeInput
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-phone`}>Phone</FieldLabel>
                <IndonesiaPhoneInput
                  id={`${mode}-business-phone`}
                  value={phone}
                  onValueChange={setPhone}
                  placeholder="812 3456 7890"
                  aria-label="Phone number"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-address`}>Address</FieldLabel>
                <Textarea
                  id={`${mode}-business-address`}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Jl. Example No. 12, Jakarta"
                  rows={2}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-notes`}>Notes</FieldLabel>
                <Textarea
                  id={`${mode}-business-notes`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional internal notes about this business"
                  rows={3}
                />
              </Field>
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </FieldGroup>
          </SheetPanel>
          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending} disabled={!name.trim()}>
              {mode === "create" ? "Create business" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetPopup>
    </Sheet>
  );
}

type BusinessDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessRecord | null;
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

export function BusinessDetailDrawer({
  open,
  onOpenChange,
  business,
  loading,
  error,
}: BusinessDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>Business detail</SheetTitle>
          <SheetDescription>Client company profile.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {business ? (
            <dl>
              <DetailRow label="Name" value={business.name} />
              <DetailRow label="Email" value={business.email ?? "—"} />
              <DetailRow label="Phone" value={business.phone ?? "—"} />
              <DetailRow label="Address" value={business.address ?? "—"} />
              <DetailRow label="Notes" value={business.notes ?? "—"} />
              <DetailRow label="Created" value={formatDate(business.createdAt)} />
              <DetailRow label="Last updated" value={formatDate(business.updatedAt)} />
            </dl>
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
