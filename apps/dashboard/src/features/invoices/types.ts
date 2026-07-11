import type { ListInvoices200DataItem } from "#/generated/api/model";

export type InvoiceRecord = ListInvoices200DataItem;

export type InvoiceServiceType = InvoiceRecord["lineItems"][number]["serviceType"];
export type InvoiceStatus = InvoiceRecord["status"];

export type InvoiceLineFormValue = {
  serviceType: InvoiceServiceType;
  description: string;
  quantity: string;
  unitAmount: string;
};

export type InvoiceFormValues = {
  businessId: string;
  dueDate: string;
  notes: string;
  lineItems: InvoiceLineFormValue[];
};

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

export function getInvoiceShareUrl(shareToken: string) {
  if (typeof window === "undefined") return `/invoice/${shareToken}`;
  return `${window.location.origin}/invoice/${shareToken}`;
}
