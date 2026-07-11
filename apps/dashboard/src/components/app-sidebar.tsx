import type { ComponentProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@anthiel/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import {
  FileTextIcon,
  GalleryVerticalEndIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldIcon,
} from "lucide-react";

import { NavSection } from "#components/nav-section";
import { NavUser } from "#components/nav-user";

const platformItems = [
  {
    title: "Dashboard",
    to: "/dashboard" as const,
    icon: LayoutDashboardIcon,
  },
  {
    title: "Invoices",
    to: "/dashboard/invoices" as const,
    icon: FileTextIcon,
  },
];

const manageItems = [
  {
    title: "Roles",
    to: "/dashboard/roles" as const,
    icon: ShieldIcon,
  },
  {
    title: "Permissions",
    to: "/dashboard/permissions" as const,
    icon: KeyRoundIcon,
  },
];

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Anthiel</span>
                <span className="truncate text-xs">Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Platform" items={platformItems} />
        <NavSection label="Manage" items={manageItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
