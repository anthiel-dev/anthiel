import { Button, Field, FieldGroup, FieldLabel, Input } from "@anthiel/ui";
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
import { Controller, useForm } from "react-hook-form";

import type { PaymentMethodFormValues, PaymentMethodRecord } from "../types";

import {
  PAYMENT_METHOD_OPTIONS,
  formatDate,
  paymentMethodFormSchema,
  paymentMethodLabel,
} from "../types";

type PaymentMethodFormDrawerProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod?: PaymentMethodRecord | null;
  pending: boolean;
  error: string | null;
  onSubmit: (values: PaymentMethodFormValues) => void;
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function PaymentMethodFormDrawer({
  mode,
  open,
  onOpenChange,
  paymentMethod,
  pending,
  error,
  onSubmit,
}: PaymentMethodFormDrawerProps) {
  const formId = `${mode}-payment-method-form`;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      method: "bca",
      receiverName: "",
      accountNumber: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      mode === "edit"
        ? {
            method: paymentMethod?.method ?? "bca",
            receiverName: paymentMethod?.receiverName ?? "",
            accountNumber: paymentMethod?.accountNumber ?? "",
          }
        : {
            method: "bca",
            receiverName: "",
            accountNumber: "",
          },
    );
  }, [mode, open, paymentMethod, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create payment method" : "Edit payment method"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a bank, cash, or QRIS destination for invoices."
              : "Update payment destination details."}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Method</FieldLabel>
                <Controller
                  control={control}
                  name="method"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange((value ?? "bca") as PaymentMethodFormValues["method"])
                      }
                    >
                      <SelectTrigger aria-label="Method" aria-invalid={Boolean(errors.method)}>
                        <SelectValue placeholder="Select a method">
                          {paymentMethodLabel(field.value)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldMessage message={errors.method?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-payment-receiver`}>Receiver name</FieldLabel>
                <Input
                  id={`${mode}-payment-receiver`}
                  placeholder="Franco Clive Maleke"
                  nativeInput
                  aria-invalid={Boolean(errors.receiverName)}
                  {...register("receiverName")}
                />
                <FieldMessage message={errors.receiverName?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-payment-account`}>Account / card number</FieldLabel>
                <Input
                  id={`${mode}-payment-account`}
                  placeholder="0613197785"
                  nativeInput
                  aria-invalid={Boolean(errors.accountNumber)}
                  {...register("accountNumber")}
                />
                <FieldMessage message={errors.accountNumber?.message} />
              </Field>
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </FieldGroup>
          </form>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <Button type="submit" form={formId} loading={pending}>
            {mode === "create" ? "Create payment method" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

type PaymentMethodDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: PaymentMethodRecord | null;
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

export function PaymentMethodDetailDrawer({
  open,
  onOpenChange,
  paymentMethod,
  loading,
  error,
}: PaymentMethodDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>Payment method detail</SheetTitle>
          <SheetDescription>Invoice payment destination.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {paymentMethod ? (
            <dl>
              <DetailRow label="Method" value={paymentMethodLabel(paymentMethod.method)} />
              <DetailRow label="Receiver" value={paymentMethod.receiverName} />
              <DetailRow label="Account no." value={paymentMethod.accountNumber ?? "—"} />
              <DetailRow label="Created" value={formatDate(paymentMethod.createdAt)} />
              <DetailRow label="Last updated" value={formatDate(paymentMethod.updatedAt)} />
            </dl>
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
