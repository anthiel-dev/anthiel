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
import { PlusIcon, Trash2Icon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import type {
  ListBusinesses200DataItem,
  ListPaymentMethods200DataItem,
} from "#/generated/api/model";

import { formatPaymentMethodOption } from "#/features/payment-methods/types";

import type { InvoiceFormValues, InvoiceRecord, InvoiceServiceType } from "../types";

import {
  SERVICE_TYPE_OPTIONS,
  STATUS_LABELS,
  emptyLineItem,
  formatDate,
  formatIdr,
  getInvoiceShareUrl,
  invoiceFormSchema,
  isoToDateInput,
} from "../types";
import { DatePickerField } from "./date-picker-field";
import { AmountInput, QuantityInput } from "./masked-number-inputs";

type InvoiceFormDrawerProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceRecord | null;
  businesses: ListBusinesses200DataItem[];
  paymentMethods: ListPaymentMethods200DataItem[];
  pending: boolean;
  error: string | null;
  onSubmit: (values: InvoiceFormValues) => void;
};

function serviceTypeLabel(value: InvoiceServiceType) {
  return SERVICE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function InvoiceFormDrawer({
  mode,
  open,
  onOpenChange,
  invoice,
  businesses,
  paymentMethods,
  pending,
  error,
  onSubmit,
}: InvoiceFormDrawerProps) {
  const formId = `${mode}-invoice-form`;
  const title = mode === "create" ? "Create invoice" : "Edit invoice";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      businessId: "",
      paymentMethodId: "",
      dueDate: "",
      notes: "",
      lineItems: [emptyLineItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const businessId = useWatch({ control, name: "businessId" });
  const paymentMethodId = useWatch({ control, name: "paymentMethodId" });
  const selectedBusiness = businesses.find((business) => business.id === businessId);
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === paymentMethodId);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && invoice) {
      reset({
        businessId: invoice.businessId,
        paymentMethodId: invoice.paymentMethodId,
        dueDate: isoToDateInput(invoice.dueDate),
        notes: invoice.notes ?? "",
        lineItems: invoice.lineItems.map((line) => ({
          serviceType: line.serviceType,
          description: line.description,
          quantity: String(line.quantity),
          unitAmount: String(line.unitAmount),
        })),
      });
      return;
    }
    reset({
      businessId: "",
      paymentMethodId: "",
      dueDate: "",
      notes: "",
      lineItems: [emptyLineItem()],
    });
  }, [invoice, mode, open, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a draft invoice for a business with one or more line items."
              : "Update draft invoice details and line items."}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Business</FieldLabel>
                <Controller
                  control={control}
                  name="businessId"
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
              <Field>
                <FieldLabel>Payment method</FieldLabel>
                <Controller
                  control={control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger
                        aria-label="Payment method"
                        aria-invalid={Boolean(errors.paymentMethodId)}
                      >
                        <SelectValue placeholder="Select a payment method">
                          {selectedPaymentMethod
                            ? formatPaymentMethodOption(selectedPaymentMethod)
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {formatPaymentMethodOption(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldMessage message={errors.paymentMethodId?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-invoice-due-date`}>Due date</FieldLabel>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <DatePickerField
                      id={`${mode}-invoice-due-date`}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Pick a due date"
                    />
                  )}
                />
                <FieldMessage message={errors.dueDate?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-invoice-notes`}>Notes</FieldLabel>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea
                      id={`${mode}-invoice-notes`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      placeholder="Optional notes for this invoice"
                      rows={3}
                      aria-invalid={Boolean(errors.notes)}
                    />
                  )}
                />
                <FieldMessage message={errors.notes?.message} />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">Line items</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(emptyLineItem())}
                  >
                    <PlusIcon />
                    Add line
                  </Button>
                </div>
                <FieldMessage
                  message={errors.lineItems?.message ?? errors.lineItems?.root?.message}
                />
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        Line {index + 1}
                      </p>
                      {fields.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove line ${index + 1}`}
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon />
                        </Button>
                      ) : null}
                    </div>
                    <Field>
                      <FieldLabel>Service type</FieldLabel>
                      <Controller
                        control={control}
                        name={`lineItems.${index}.serviceType`}
                        render={({ field: serviceField }) => (
                          <Select
                            value={serviceField.value}
                            onValueChange={(value) =>
                              serviceField.onChange((value ?? "development") as InvoiceServiceType)
                            }
                          >
                            <SelectTrigger aria-label={`Service type for line ${index + 1}`}>
                              <SelectValue placeholder="Select a service type">
                                {serviceTypeLabel(serviceField.value)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {SERVICE_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMessage message={errors.lineItems?.[index]?.serviceType?.message} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${mode}-line-desc-${index}`}>Description</FieldLabel>
                      <Input
                        id={`${mode}-line-desc-${index}`}
                        placeholder="e.g. Monthly maintenance for production app"
                        nativeInput
                        aria-invalid={Boolean(errors.lineItems?.[index]?.description)}
                        {...register(`lineItems.${index}.description`)}
                      />
                      <FieldMessage message={errors.lineItems?.[index]?.description?.message} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel htmlFor={`${mode}-line-qty-${index}`}>Quantity</FieldLabel>
                        <Controller
                          control={control}
                          name={`lineItems.${index}.quantity`}
                          render={({ field: qtyField }) => (
                            <QuantityInput
                              id={`${mode}-line-qty-${index}`}
                              value={qtyField.value}
                              onValueChange={qtyField.onChange}
                              placeholder="1"
                              aria-label={`Quantity for line ${index + 1}`}
                            />
                          )}
                        />
                        <FieldMessage message={errors.lineItems?.[index]?.quantity?.message} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`${mode}-line-amount-${index}`}>
                          Unit amount
                        </FieldLabel>
                        <Controller
                          control={control}
                          name={`lineItems.${index}.unitAmount`}
                          render={({ field: amountField }) => (
                            <AmountInput
                              id={`${mode}-line-amount-${index}`}
                              value={amountField.value}
                              onValueChange={amountField.onChange}
                              placeholder="0"
                              aria-label={`Unit amount for line ${index + 1}`}
                            />
                          )}
                        />
                        <FieldMessage message={errors.lineItems?.[index]?.unitAmount?.message} />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </FieldGroup>
          </form>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <Button type="submit" form={formId} loading={pending}>
            {mode === "create" ? "Create invoice" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

type InvoiceDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceRecord | null;
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

export function InvoiceDetailDrawer({
  open,
  onOpenChange,
  invoice,
  loading,
  error,
}: InvoiceDetailDrawerProps) {
  const shareUrl =
    invoice && invoice.status !== "draft" ? getInvoiceShareUrl(invoice.number) : null;
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function downloadQrCode() {
    const canvas = qrCanvasRef.current;
    if (!canvas || !invoice) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${invoice.number}-qr.png`;
    link.click();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Invoice detail</SheetTitle>
          <SheetDescription>Invoice summary, business, and line items.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {invoice ? (
            <div className="space-y-2">
              <dl>
                <DetailRow label="Number" value={invoice.number} />
                <DetailRow
                  label="Business"
                  value={`${invoice.business.name}${invoice.business.email ? ` (${invoice.business.email})` : ""}`}
                />
                <DetailRow
                  label="Payment method"
                  value={formatPaymentMethodOption(invoice.paymentMethod)}
                />
                <div className="grid gap-1 border-b py-4">
                  <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Status
                  </dt>
                  <dd>
                    <Badge className="capitalize">{STATUS_LABELS[invoice.status]}</Badge>
                  </dd>
                </div>
                <DetailRow label="Total" value={formatIdr(invoice.totalAmount)} />
                <DetailRow label="Issued" value={formatDate(invoice.issueDate)} />
                <DetailRow label="Due" value={formatDate(invoice.dueDate)} />
                <DetailRow label="Notes" value={invoice.notes?.trim() ? invoice.notes : "—"} />
              </dl>
              <div className="pt-2">
                <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Line items
                </p>
                <div className="space-y-3">
                  {invoice.lineItems.map((line) => (
                    <div key={line.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium capitalize">
                            {serviceTypeLabel(line.serviceType)}
                          </p>
                          <p className="text-muted-foreground">{line.description}</p>
                        </div>
                        <p className="whitespace-nowrap font-medium">
                          {formatIdr(line.lineAmount)}
                        </p>
                      </div>
                      <p className="mt-2 text-muted-foreground text-xs">
                        {line.quantity} × {formatIdr(line.unitAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {shareUrl ? (
                <div className="space-y-3 border-t pt-4">
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Public share
                  </p>
                  <p className="break-all text-muted-foreground text-xs">{shareUrl}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-lg border bg-background p-3">
                      <QRCodeCanvas
                        ref={qrCanvasRef}
                        value={shareUrl}
                        size={128}
                        level="M"
                        marginSize={2}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" onClick={() => void copyShareUrl()}>
                        {copied ? "Copied" : "Copy link"}
                      </Button>
                      <Button type="button" variant="outline" onClick={downloadQrCode}>
                        Download QR
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="border-t pt-4 text-muted-foreground text-sm">
                  Mark as sent to enable the public share link and QR code.
                </p>
              )}
            </div>
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
