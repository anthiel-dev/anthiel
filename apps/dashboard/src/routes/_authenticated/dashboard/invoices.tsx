import { createFileRoute } from "@tanstack/react-router";

import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/_authenticated/dashboard/invoices")({
  head: () => pageMeta("Invoices", "Manage invoices"),
  component: InvoicesPage,
});

function InvoicesPage() {
  return null;
}
