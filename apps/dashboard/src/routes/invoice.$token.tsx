import { Badge } from "@anthiel/ui";
import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";

import {
  SERVICE_TYPE_OPTIONS,
  STATUS_LABELS,
  formatDate,
  formatIdr,
  getInvoiceShareUrl,
  type InvoiceServiceType,
  type InvoiceStatus,
} from "#/features/invoices/types";
import { useGetPublicInvoiceByToken } from "#/generated/api";
import { pageMeta } from "#lib/page-meta";

export const Route = createFileRoute("/invoice/$token")({
  ssr: false,
  head: ({ params }) => pageMeta("Invoice", `Public invoice ${params.token}`),
  component: PublicInvoicePage,
});

function serviceTypeLabel(value: InvoiceServiceType) {
  return SERVICE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function PublicInvoicePage() {
  const { token } = Route.useParams();
  const invoiceQuery = useGetPublicInvoiceByToken(token);
  const shareUrl = getInvoiceShareUrl(token);

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
          <h1 className="font-semibold text-xl">Invoice not found</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            This share link is invalid or the invoice is not publicly available.
          </p>
        </div>
      </main>
    );
  }

  const invoice = invoiceQuery.data.data.data;
  const watermarkText = `${invoice.number} · ${invoice.business.name} · Anthiel`;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="absolute whitespace-nowrap text-foreground/5 text-2xl font-semibold tracking-[0.3em] uppercase"
            style={{
              top: `${(index % 6) * 18 + 8}%`,
              left: `${Math.floor(index / 6) * 35 - 10}%`,
              transform: "rotate(-28deg)",
            }}
          >
            {watermarkText}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl space-y-8 rounded-2xl border bg-background/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Anthiel Invoice
            </p>
            <h1 className="mt-1 font-semibold text-2xl tracking-tight">{invoice.number}</h1>
            <p className="mt-1 text-muted-foreground text-sm">{invoice.business.name}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Badge className="capitalize">{STATUS_LABELS[invoice.status as InvoiceStatus]}</Badge>
            <div className="rounded-lg border bg-background p-2">
              <QRCodeSVG value={shareUrl} size={96} level="M" marginSize={1} />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Info label="Issued" value={formatDate(invoice.issueDate)} />
          <Info label="Due" value={formatDate(invoice.dueDate)} />
          <Info label="Total" value={formatIdr(invoice.totalAmount)} />
        </section>

        <section className="space-y-3">
          <h2 className="font-medium text-sm">Line items</h2>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Service</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium text-right">Qty</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((line) => (
                  <tr key={line.id} className="border-t">
                    <td className="px-3 py-3 capitalize">
                      {serviceTypeLabel(line.serviceType as InvoiceServiceType)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{line.description}</td>
                    <td className="px-3 py-3 text-right">{line.quantity}</td>
                    <td className="px-3 py-3 text-right">{formatIdr(line.lineAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {invoice.notes ? (
          <section>
            <h2 className="font-medium text-sm">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground text-sm">
              {invoice.notes}
            </p>
          </section>
        ) : null}

        <p className="text-muted-foreground text-xs">
          This page is watermarked for authenticity. Verify the QR code matches this invoice share
          link.
        </p>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium text-sm">{value}</p>
    </div>
  );
}
