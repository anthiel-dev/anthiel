import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@anthiel/ui/components/dialog";

import type { InvoiceRecord } from "../types";

import { InvoiceCard } from "./invoice-card";

type InvoicePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceRecord | null;
};

export function InvoicePreviewDialog({ open, onOpenChange, invoice }: InvoicePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-3xl" showCloseButton>
        <DialogHeader className="sr-only">
          <DialogTitle>{invoice ? `Invoice ${invoice.number}` : "Invoice"}</DialogTitle>
          <DialogDescription>Preview of the public invoice card.</DialogDescription>
        </DialogHeader>
        <DialogPanel className="p-4 sm:p-6">
          {invoice ? <InvoiceCard invoice={invoice} /> : null}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
