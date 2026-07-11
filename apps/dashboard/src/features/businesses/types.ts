import type { ListBusinesses200DataItem } from "#/generated/api/model";

export type BusinessRecord = ListBusinesses200DataItem;

export type BusinessFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
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
