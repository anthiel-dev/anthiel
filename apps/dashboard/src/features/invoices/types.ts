import { z } from "zod";

import type { ListInvoices200DataItem } from "#/generated/api/model";

export type InvoiceRecord = ListInvoices200DataItem;

export type InvoiceServiceType = InvoiceRecord["lineItems"][number]["serviceType"];
export type InvoiceStatus = InvoiceRecord["status"];

export const invoiceServiceTypeSchema = z.enum(["development", "maintenance", "server", "other"]);

export const invoiceLineFormSchema = z.object({
  serviceType: invoiceServiceTypeSchema,
  description: z.string().trim().min(1, "Description is required"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((value) => Number(value) > 0, "Quantity must be greater than 0"),
  unitAmount: z
    .string()
    .min(1, "Unit amount is required")
    .refine((value) => Number(value) >= 0, "Unit amount must be 0 or more"),
});

export const invoiceFormSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  dueDate: z.string(),
  notes: z.string(),
  lineItems: z.array(invoiceLineFormSchema).min(1, "Add at least one line item"),
});

export type InvoiceLineFormValue = z.infer<typeof invoiceLineFormSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const SERVICE_TYPE_OPTIONS: { value: InvoiceServiceType; label: string }[] = [
  { value: "development", label: "Development" },
  { value: "maintenance", label: "Maintenance" },
  { value: "server", label: "Server" },
  { value: "other", label: "Other" },
];

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
};

export function formatIdr(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function emptyLineItem(): InvoiceLineFormValue {
  return {
    serviceType: "development",
    description: "",
    quantity: "",
    unitAmount: "",
  };
}

export function dueDateToIso(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function isoToDateInput(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function getInvoiceShareUrl(invoiceNumber: string) {
  const path = `/invoice/${encodeURIComponent(invoiceNumber)}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
