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
  WalletCardsIcon,
} from "lucide-react";

import { getAppHome, isAdminRole } from "#/lib/roles";
import { NavSection, type NavItem } from "#components/nav-section";
import { NavUser } from "#components/nav-user";

const platformItems: NavItem[] = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboardIcon,
    adminOnly: true,
  },
  {
    title: "Invoices",
    to: "/dashboard/invoices",
    icon: FileTextIcon,
  },
];

const manageItems: NavItem[] = [
  {
    title: "Businesses",
    to: "/dashboard/businesses",
    icon: Building2Icon,
    adminOnly: true,
  },
  {
    title: "Payment methods",
    to: "/dashboard/payment-methods",
    icon: WalletCardsIcon,
    adminOnly: true,
  },
  {
    title: "Users",
    to: "/dashboard/users",
    icon: UsersIcon,
    adminOnly: true,
  },
  {
    title: "Roles",
    to: "/dashboard/roles",
    icon: ShieldIcon,
    adminOnly: true,
  },
  {
    title: "Permissions",
    to: "/dashboard/permissions",
    icon: KeyRoundIcon,
    adminOnly: true,
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

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const admin = isAdminRole(user.role);
  const home = getAppHome(user.role);
  const visiblePlatform = platformItems.filter((item) => admin || !item.adminOnly);
  const visibleManage = admin ? manageItems : [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to={home} />}>
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
        {visiblePlatform.length > 0 ? (
          <NavSection label="Platform" items={visiblePlatform} />
        ) : null}
        {visibleManage.length > 0 ? <NavSection label="Manage" items={visibleManage} /> : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
