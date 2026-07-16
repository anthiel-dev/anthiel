import { z } from "zod";

import type { ListProjects200DataItem } from "#/generated/api/model";

export type ProjectRecord = ListProjects200DataItem;

export const projectFormSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  name: z.string().trim().min(1, "Name is required"),
  status: z.enum(["active", "archived"]),
  notes: z.string(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const STATUS_LABELS: Record<ProjectRecord["status"], string> = {
  active: "Active",
  archived: "Archived",
};

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
