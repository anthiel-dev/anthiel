import { createFileRoute } from "@tanstack/react-router";

import { InvoiceCard } from "#/features/invoices/components/invoice-card";
import { useGetPublicInvoiceByNumber } from "#/generated/api";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/invoice/$number")({
  ssr: false,
  head: ({ params }) => pageMeta("Invoice", `Invoice ${params.number}`),
  component: PublicInvoicePage,
});

function PublicInvoicePage() {
  const { number } = Route.useParams();
  const invoiceNumber = decodeURIComponent(number);
  const invoiceQuery = useGetPublicInvoiceByNumber(invoiceNumber);

  if (invoiceQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl items-center justify-center px-4">
        <p className="text-muted-foreground text-sm">Loading invoice…</p>
      </main>
    );
  }

  if (invoiceQuery.error || invoiceQuery.data?.status !== 200) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-semibold text-xl tracking-tight">Invoice not found</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            This link is invalid or the invoice is not publicly available.
          </p>
        </div>
      </main>
    );
  }

  const invoice = invoiceQuery.data.data.data;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background px-4 py-4">
      <div className="relative mx-auto max-w-3xl">
        <InvoiceCard invoice={invoice} />
      </div>
    </main>
  );
}
