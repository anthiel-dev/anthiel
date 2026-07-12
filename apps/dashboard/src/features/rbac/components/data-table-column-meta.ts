export type DataTableColumnMeta = {
  /** Label shown next to the value in the mobile list layout. */
  label?: string;
  /** Hide this column in the mobile list (still shown in the desktop table). */
  mobileHidden?: boolean;
};

export function getColumnMeta(meta: unknown): DataTableColumnMeta {
  if (meta && typeof meta === "object") {
    return meta as DataTableColumnMeta;
  }
  return {};
}

export function humanizeColumnId(id: string): string {
  return id
    .replace(/^role:/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
