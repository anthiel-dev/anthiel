import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@anthiel/ui/components/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";

export type NavItem = {
  title: string;
  to:
    | "/dashboard"
    | "/dashboard/invoices"
    | "/dashboard/businesses"
    | "/dashboard/payment-methods"
    | "/dashboard/users"
    | "/dashboard/roles"
    | "/dashboard/permissions";
  icon: LucideIcon;
};

export function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.to}>
            <SidebarMenuButton
              isActive={pathname === item.to || pathname === `${item.to}/`}
              tooltip={item.title}
              render={<Link to={item.to} />}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
