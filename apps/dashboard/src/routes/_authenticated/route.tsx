import { Separator } from "@anthiel/ui/components/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@anthiel/ui/components/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "#/lib/auth-guards";
import { AppBreadcrumb } from "#components/app-breadcrumb";
import { AppSidebar } from "#components/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
  // Session cookie lives on the auth API origin; check on the client.
  ssr: false,
  beforeLoad: async ({ location }) =>
    requireAuth({ pathname: location.pathname, searchStr: location.searchStr }),
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          avatar: session.user.image,
        }}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6 mr-2" />
            <AppBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
