import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@anthiel/ui";
import { Checkbox } from "@anthiel/ui/components/checkbox";

import type { ListPermissions200DataItem, ListRoles200DataItem } from "#/generated/api/model";

import { DataTableColumnHeader } from "./data-table-column-header";

type CreatePermissionColumnsOptions = {
  roles: ListRoles200DataItem[];
  pendingKey: string | null;
  onToggle: (input: { roleId: string; permissionId: string; granted: boolean }) => void;
};

export function createPermissionColumns({
  roles,
  pendingKey,
  onToggle,
}: CreatePermissionColumnsOptions): ColumnDef<ListPermissions200DataItem>[] {
  const roleColumns: ColumnDef<ListPermissions200DataItem>[] = roles.map((role) => ({
    id: `role:${role.key}`,
    accessorFn: (row) => (row.roles.includes(role.key) ? 1 : 0),
    header: ({ column }) => <DataTableColumnHeader column={column} title={role.name} />,
    cell: ({ row }) => {
      const granted = row.original.roles.includes(role.key);
      const toggleKey = `${role.id}:${row.original.id}`;
      const isPending = pendingKey === toggleKey;

      return (
        <Checkbox
          checked={granted}
          disabled={isPending}
          aria-label={`${granted ? "Revoke" : "Grant"} ${row.original.key} for ${role.name}`}
          onCheckedChange={(checked) => {
            onToggle({
              roleId: role.id,
              permissionId: row.original.id,
              granted: checked,
            });
          }}
        />
      );
    },
  }));

  return [
    {
      accessorKey: "key",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Permission" />,
      cell: ({ row }) => (
        <code className="font-mono text-foreground text-xs">{row.original.key}</code>
      ),
    },
    {
      accessorKey: "resourceKey",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal capitalize">
          {row.original.resourceKey}
        </Badge>
      ),
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground text-xs">{row.original.action}</span>
      ),
    },
    ...roleColumns,
  ];
}
