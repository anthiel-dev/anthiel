import { createFileRoute } from "@tanstack/react-router";

import { PaymentMethodsPage } from "#features/payment-methods";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/payment-methods")({
  staticData: {
    breadcrumb: "Payment methods",
  },
  head: () => pageMeta("Payment methods", "Manage payment methods"),
  component: PaymentMethodsPage,
});
