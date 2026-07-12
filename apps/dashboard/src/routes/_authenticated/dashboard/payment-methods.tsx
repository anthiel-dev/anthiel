import { createFileRoute } from "@tanstack/react-router";

import { requireAdmin } from "#/lib/auth-guards";
import { PaymentMethodsPage } from "#features/payment-methods";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/payment-methods")({
  staticData: {
    breadcrumb: "Payment methods",
  },
  beforeLoad: async ({ location }) =>
    requireAdmin({ pathname: location.pathname, searchStr: location.searchStr }),
  head: () => pageMeta("Payment methods", "Manage payment methods"),
  component: PaymentMethodsPage,
});
