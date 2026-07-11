import type { Table as TanStackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Frame, FramePanel, Spinner } from "@anthiel/ui";

import { DataTable } from "./data-table";

type DataTableFrameProps<TData> = {
  table: TanStackTable<TData>;
  toolbar?: ReactNode;
  loading?: boolean;
  error?: string | null;
};

export function DataTableFrame<TData>({
  table,
  toolbar,
  loading = false,
  error = null,
}: DataTableFrameProps<TData>) {
  return (
    <div className="flex w-full flex-col gap-3">
      {toolbar ? <div className="flex items-center justify-start">{toolbar}</div> : null}
      <Frame className="w-full">
        {loading ? (
          <FramePanel className="flex min-h-48 items-center justify-center">
            <Spinner className="size-5 text-muted-foreground" />
          </FramePanel>
        ) : error ? (
          <FramePanel className="flex min-h-48 items-center justify-center">
            <p className="text-center text-destructive text-sm">{error}</p>
          </FramePanel>
        ) : (
          <DataTable table={table} />
        )}
      </Frame>
    </div>
  );
}
