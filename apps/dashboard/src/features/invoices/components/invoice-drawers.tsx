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
import { Textarea } from "@anthiel/ui/components/textarea";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

import type { ListBusinesses200DataItem } from "#/generated/api/model";

import type {
  InvoiceFormValues,
  InvoiceLineFormValue,
  InvoiceRecord,
  InvoiceServiceType,
} from "../types";

import {
  SERVICE_TYPE_OPTIONS,
  STATUS_LABELS,
  emptyLineItem,
  formatDate,
  formatIdr,
  getInvoiceShareUrl,
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
  pending: boolean;
  error: string | null;
  onSubmit: (values: InvoiceFormValues) => void;
};

function serviceTypeLabel(value: InvoiceServiceType) {
  return SERVICE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function InvoiceFormDrawer({
  mode,
  open,
  onOpenChange,
  invoice,
  businesses,
  pending,
  error,
  onSubmit,
}: InvoiceFormDrawerProps) {
  const [businessId, setBusinessId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineFormValue[]>([emptyLineItem()]);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && invoice) {
      setBusinessId(invoice.businessId);
      setDueDate(isoToDateInput(invoice.dueDate));
      setNotes(invoice.notes ?? "");
      setLineItems(
        invoice.lineItems.map((line) => ({
          serviceType: line.serviceType,
          description: line.description,
          quantity: String(line.quantity),
          unitAmount: String(line.unitAmount),
        })),
      );
      return;
    }
    setBusinessId("");
    setDueDate("");
    setNotes("");
    setLineItems([emptyLineItem()]);
  }, [invoice, mode, open]);

  function updateLine(index: number, patch: Partial<InvoiceLineFormValue>) {
    setLineItems((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      businessId,
      dueDate,
      notes: notes.trim(),
      lineItems,
    });
  }

  const selectedBusiness = businesses.find((business) => business.id === businessId);
  const title = mode === "create" ? "Create invoice" : "Edit invoice";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right" className="sm:max-w-xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a draft invoice for a business with one or more line items."
                : "Update draft invoice details and line items."}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="flex-1 overflow-y-auto">
            <FieldGroup>
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
              <Field>
                <FieldLabel htmlFor={`${mode}-invoice-due-date`}>Due date</FieldLabel>
                <DatePickerField
                  id={`${mode}-invoice-due-date`}
                  value={dueDate}
                  onValueChange={setDueDate}
                  placeholder="Pick a due date"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${mode}-invoice-notes`}>Notes</FieldLabel>
                <Textarea
                  id={`${mode}-invoice-notes`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes for this invoice"
                  rows={3}
                />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">Line items</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLineItems((current) => [...current, emptyLineItem()])}
                  >
                    <PlusIcon />
                    Add line
                  </Button>
                </div>
                {lineItems.map((line, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        Line {index + 1}
                      </p>
                      {lineItems.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove line ${index + 1}`}
                          onClick={() =>
                            setLineItems((current) =>
                              current.filter((_, lineIndex) => lineIndex !== index),
                            )
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      ) : null}
                    </div>
                    <Field>
                      <FieldLabel>Service type</FieldLabel>
                      <Select
                        value={line.serviceType}
                        onValueChange={(value) =>
                          updateLine(index, {
                            serviceType: (value ?? "development") as InvoiceServiceType,
                          })
                        }
                      >
                        <SelectTrigger aria-label={`Service type for line ${index + 1}`}>
                          <SelectValue placeholder="Select a service type">
                            {serviceTypeLabel(line.serviceType)}
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
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${mode}-line-desc-${index}`}>Description</FieldLabel>
                      <Input
                        id={`${mode}-line-desc-${index}`}
                        value={line.description}
                        onChange={(event) => updateLine(index, { description: event.target.value })}
                        placeholder="e.g. Monthly maintenance for production app"
                        required
                        nativeInput
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel htmlFor={`${mode}-line-qty-${index}`}>Quantity</FieldLabel>
                        <QuantityInput
                          id={`${mode}-line-qty-${index}`}
                          value={line.quantity}
                          onValueChange={(quantity) => updateLine(index, { quantity })}
                          placeholder="1"
                          aria-label={`Quantity for line ${index + 1}`}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`${mode}-line-amount-${index}`}>
                          Unit amount
                        </FieldLabel>
                        <AmountInput
                          id={`${mode}-line-amount-${index}`}
                          value={line.unitAmount}
                          onValueChange={(unitAmount) => updateLine(index, { unitAmount })}
                          placeholder="0"
                          aria-label={`Unit amount for line ${index + 1}`}
                          required
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

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
              disabled={!businessId || lineItems.length === 0}
            >
              {mode === "create" ? "Create invoice" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
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
    invoice && invoice.status !== "draft" ? getInvoiceShareUrl(invoice.shareToken) : null;
  const [copied, setCopied] = useState(false);

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Invoice detail</SheetTitle>
          <SheetDescription>Invoice summary, business, and line items.</SheetDescription>
        </SheetHeader>
        <SheetPanel className="overflow-y-auto">
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
                      <QRCodeSVG value={shareUrl} size={128} level="M" marginSize={2} />
                    </div>
                    <Button type="button" variant="outline" onClick={() => void copyShareUrl()}>
                      {copied ? "Copied" : "Copy link"}
                    </Button>
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
