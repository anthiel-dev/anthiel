import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@anthiel/ui/components/table";
import { useIsMobile } from "@anthiel/ui/hooks/use-media-query";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";

import { DataTableList } from "./data-table-list";

type DataTableProps<TData> = {
  table: TanStackTable<TData>;
};

function DataTableTable<TData>({ table }: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;

  return (
    <Table variant="card" className="w-full">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getAllColumns().length}
              className="h-24 text-center text-muted-foreground"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function DataTable<TData>({ table }: DataTableProps<TData>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DataTableList table={table} />;
  }

  return <DataTableTable table={table} />;
}
