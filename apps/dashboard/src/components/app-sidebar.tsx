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
  Building2Icon,
  FileTextIcon,
  GalleryVerticalEndIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UsersIcon,
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
    title: "Businesses",
    to: "/dashboard/businesses" as const,
    icon: Building2Icon,
  },
  {
    title: "Users",
    to: "/dashboard/users" as const,
    icon: UsersIcon,
  },
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
    role?: string | null;
  };
};

function isAdminRole(role: string | null | undefined) {
  if (!role) return false;
  return role
    .split(",")
    .map((value) => value.trim())
    .includes("admin");
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const showManage = isAdminRole(user.role);

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
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Platform" items={platformItems} />
        {showManage ? <NavSection label="Manage" items={manageItems} /> : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
