import { FramePanel } from "@anthiel/ui";
import {
  flexRender,
  type Cell,
  type Row,
  type Table as TanStackTable,
} from "@tanstack/react-table";

import { getColumnMeta, humanizeColumnId } from "./data-table-column-meta";

type DataTableListProps<TData> = {
  table: TanStackTable<TData>;
};

function isActionsColumn(columnId: string) {
  return columnId === "actions";
}

function getCellLabel<TData>(cell: Cell<TData, unknown>) {
  const meta = getColumnMeta(cell.column.columnDef.meta);
  return meta.label ?? humanizeColumnId(cell.column.id);
}

function DataTableListItem<TData>({ row }: { row: Row<TData> }) {
  const cells = row.getVisibleCells().filter((cell) => {
    if (isActionsColumn(cell.column.id)) return false;
    return !getColumnMeta(cell.column.columnDef.meta).mobileHidden;
  });

  const [primaryCell, ...detailCells] = cells;
  const actionsCell = row.getVisibleCells().find((cell) => isActionsColumn(cell.column.id));

  if (!primaryCell) return null;

  return (
    <FramePanel className="p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-snug">
            {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
          </div>
        </div>
        {actionsCell ? (
          <div className="shrink-0 -mt-1 -mr-1.5">
            {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
          </div>
        ) : null}
      </div>

      {detailCells.length > 0 ? (
        <dl className="mt-3 space-y-2.5 border-border/60 border-t pt-3">
          {detailCells.map((cell) => (
            <div key={cell.id} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground text-xs leading-5">
                {getCellLabel(cell)}
              </dt>
              <dd className="min-w-0 text-right text-sm leading-5 **:whitespace-normal">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </FramePanel>
  );
}

export function DataTableList<TData>({ table }: DataTableListProps<TData>) {
  const rows = table.getRowModel().rows;

  if (!rows.length) {
    return (
      <FramePanel className="flex min-h-48 items-center justify-center">
        <p className="text-center text-muted-foreground text-sm">No results.</p>
      </FramePanel>
    );
  }

  return (
    <>
      {rows.map((row) => (
        <DataTableListItem key={row.id} row={row} />
      ))}
    </>
  );
}
