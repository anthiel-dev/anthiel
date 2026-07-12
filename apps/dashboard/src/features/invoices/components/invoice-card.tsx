import { Card, CardPanel } from "@anthiel/ui";
import { QRCodeSVG } from "qrcode.react";

import { paymentMethodLabel, type PaymentMethodType } from "#/features/payment-methods/types";

import { SERVICE_TYPE_OPTIONS, formatDate, formatIdr, type InvoiceServiceType } from "../types";

export type InvoiceCardData = {
  number: string;
  business: {
    name: string;
    address: string | null;
  };
  paymentMethod: {
    method: PaymentMethodType;
    receiverName: string;
    accountNumber: string | null;
  };
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  totalAmount: number;
  lineItems: Array<{
    id: string;
    serviceType: InvoiceServiceType;
    description: string;
    quantity: number;
    lineAmount: number;
  }>;
};

function serviceTypeLabel(value: InvoiceServiceType) {
  return SERVICE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function InvoiceCard({ invoice, shareUrl }: { invoice: InvoiceCardData; shareUrl: string }) {
  const watermarkText = `Anthiel - ${invoice.number}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-background/95 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <Watermark text={watermarkText} />

      <div className="relative space-y-4">
        <header className="flex items-end justify-between gap-4 border-b pb-2">
          <div>
            <p className="text-muted-foreground text-sm">Invoice</p>
            <h1 className="font-semibold text-xl tracking-tight">{invoice.number}</h1>
          </div>
          <p className="font-semibold text-xl tracking-tight">
            Anthiel
            <span className="text-orange-500" aria-hidden>
              .
            </span>
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Billed to
            </p>
            <p className="font-medium text-sm tracking-tight">{invoice.business.name}</p>
            {invoice.business.address ? (
              <p className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">
                {invoice.business.address}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:justify-items-end">
            <Info label="Invoice date" value={formatDate(invoice.issueDate)} />
            <Info label="Due" value={formatDate(invoice.dueDate)} align="end" />
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="font-medium text-sm tracking-tight">Items</h2>
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
                    <td className="px-3 py-3 capitalize">{serviceTypeLabel(line.serviceType)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{line.description}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{line.quantity}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatIdr(line.lineAmount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/50">
                  <td colSpan={3} className="px-3 py-3 font-medium text-base">
                    Total
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-base tabular-nums tracking-tight">
                    {formatIdr(invoice.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex items-stretch gap-3 pt-2">
          <Card className="h-18 min-w-0 flex-1 bg-transparent shadow-none before:hidden">
            <CardPanel className="flex h-full items-center p-4">
              <dl className="grid w-full gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground text-xs">Method</dt>
                  <dd className="mt-0.5 font-medium">
                    {paymentMethodLabel(invoice.paymentMethod.method)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Receiver</dt>
                  <dd className="mt-0.5 font-medium">{invoice.paymentMethod.receiverName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Account no.</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {invoice.paymentMethod.accountNumber ?? "—"}
                  </dd>
                </div>
              </dl>
            </CardPanel>
          </Card>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="aspect-square h-18 overflow-hidden rounded-2xl border bg-background p-1">
              <QRCodeSVG
                value={shareUrl}
                level="M"
                marginSize={3}
                className="size-full rounded-xl"
              />
            </div>
            <p className="max-w-18 text-center text-[10px] text-muted-foreground leading-tight">
              Scan to verify
            </p>
          </div>
        </div>

        {invoice.notes ? (
          <section className="border-t pt-4">
            <h2 className="font-medium text-sm tracking-tight">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">
              {invoice.notes}
            </p>
          </section>
        ) : null}

        <footer className="space-y-2 border-t pt-3 text-center">
          <p className="text-muted-foreground text-xs">
            Terima kasih atas bisnis Anda. Mohon cantumkan nomor invoice saat pembayaran.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Watermark({ text }: { text: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="absolute whitespace-nowrap text-foreground/[0.04] text-base font-semibold tracking-[0.3em] uppercase"
          style={{
            top: `${(index % 6) * 18 + 8}%`,
            left: `${Math.floor(index / 6) * 35 - 10}%`,
            transform: "rotate(-28deg)",
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}

function Info({
  label,
  value,
  align = "start",
}: {
  label: string;
  value: string;
  align?: "start" | "end";
}) {
  return (
    <div className={align === "end" ? "text-right" : undefined}>
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium text-sm tabular-nums">{value}</p>
    </div>
  );
}
