import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_authenticated")({
  // Session cookie lives on the auth API origin; check on the client.
  ssr: false,
  beforeLoad: async ({ location }) =>
    requireAuth({ pathname: location.pathname, searchStr: location.searchStr }),
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
