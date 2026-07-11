import { Button, Field, FieldGroup, FieldLabel, Input } from "@anthiel/ui";
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

import type { BusinessFormValues, BusinessRecord } from "../types";

import { businessFormSchema, formatDate } from "../types";
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

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function BusinessFormDrawer({
  mode,
  open,
  onOpenChange,
  business,
  pending,
  error,
  onSubmit,
}: BusinessFormDrawerProps) {
  const formId = `${mode}-business-form`;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      mode === "edit"
        ? {
            name: business?.name ?? "",
            email: business?.email ?? "",
            phone: business?.phone ?? "",
            address: business?.address ?? "",
            notes: business?.notes ?? "",
          }
        : {
            name: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
          },
    );
  }, [business, mode, open, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "Create business" : "Edit business"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a client business that invoices can be assigned to."
              : "Update business contact details."}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-name`}>Name</FieldLabel>
                <Input
                  id={`${mode}-business-name`}
                  placeholder="Acme Coffee"
                  nativeInput
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                <FieldMessage message={errors.name?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-email`}>Email</FieldLabel>
                <Input
                  id={`${mode}-business-email`}
                  type="email"
                  placeholder="hello@acmecoffee.com"
                  nativeInput
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldMessage message={errors.email?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-phone`}>Phone</FieldLabel>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <IndonesiaPhoneInput
                      id={`${mode}-business-phone`}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="812 3456 7890"
                      aria-label="Phone number"
                    />
                  )}
                />
                <FieldMessage message={errors.phone?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-address`}>Address</FieldLabel>
                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <Textarea
                      id={`${mode}-business-address`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      placeholder="Jl. Example No. 12, Jakarta"
                      rows={2}
                      aria-invalid={Boolean(errors.address)}
                    />
                  )}
                />
                <FieldMessage message={errors.address?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-business-notes`}>Notes</FieldLabel>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea
                      id={`${mode}-business-notes`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      placeholder="Optional internal notes about this business"
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
            {mode === "create" ? "Create business" : "Save changes"}
          </Button>
        </SheetFooter>
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
