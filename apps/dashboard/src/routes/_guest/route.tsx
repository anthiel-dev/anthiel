import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireGuest } from "#/lib/auth-guards";

export const Route = createFileRoute("/_guest")({
  ssr: false,
  beforeLoad: async () => requireGuest(),
  component: GuestLayout,
});

function GuestLayout() {
  return <Outlet />;
}
