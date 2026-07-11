import type { Column } from "@tanstack/react-table";

import { cn } from "@anthiel/ui";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 -ml-1 text-muted-foreground transition-[color,transform] duration-150 ease-out",
        "hover:text-foreground active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      onClick={column.getToggleSortingHandler()}
    >
      <span>{title}</span>
      {sorted === "desc" ? (
        <ArrowDownIcon className="size-3.5 opacity-70" strokeWidth={1.5} />
      ) : sorted === "asc" ? (
        <ArrowUpIcon className="size-3.5 opacity-70" strokeWidth={1.5} />
      ) : (
        <ChevronsUpDownIcon className="size-3.5 opacity-40" strokeWidth={1.5} />
      )}
    </button>
  );
}
