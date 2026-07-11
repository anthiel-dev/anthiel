import { z } from "zod";

import type { ListBusinesses200DataItem } from "#/generated/api/model";

export type BusinessRecord = ListBusinesses200DataItem;

export const businessFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  phone: z.string(),
  address: z.string(),
  notes: z.string(),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

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
