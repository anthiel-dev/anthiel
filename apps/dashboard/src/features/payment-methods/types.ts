import { z } from "zod";

import type { ListPaymentMethods200DataItem } from "#/generated/api/model";

export type PaymentMethodRecord = ListPaymentMethods200DataItem;
export type PaymentMethodType = PaymentMethodRecord["method"];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethodType; label: string }[] = [
  { value: "bca", label: "BCA" },
  { value: "cash", label: "Cash" },
  { value: "qris", label: "QRIS" },
];

export const paymentMethodFormSchema = z.object({
  method: z.enum(["bca", "cash", "qris"]),
  receiverName: z.string().trim().min(1, "Receiver name is required"),
  accountNumber: z.string(),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;

export function paymentMethodLabel(method: PaymentMethodType) {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}

export function formatPaymentMethodOption(paymentMethod: {
  method: PaymentMethodType;
  receiverName: string;
  accountNumber: string | null;
}) {
  const method = paymentMethodLabel(paymentMethod.method);
  const account = paymentMethod.accountNumber?.trim();
  return account
    ? `${method} · ${paymentMethod.receiverName} · ${account}`
    : `${method} · ${paymentMethod.receiverName}`;
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
