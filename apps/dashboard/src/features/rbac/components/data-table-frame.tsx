import type { Table as TanStackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Frame } from "@anthiel/ui";

import { DataTable } from "./data-table";

type DataTableFrameProps<TData> = {
  table: TanStackTable<TData>;
  toolbar?: ReactNode;
};

export function DataTableFrame<TData>({ table, toolbar }: DataTableFrameProps<TData>) {
  return (
    <div className="flex w-full flex-col gap-3">
      {toolbar ? <div className="flex items-center justify-start">{toolbar}</div> : null}
      <Frame className="w-full">
        <DataTable table={table} />
      </Frame>
    </div>
  );
}
