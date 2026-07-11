import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: {
    breadcrumb: "Dashboard",
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return <Outlet />;
}
