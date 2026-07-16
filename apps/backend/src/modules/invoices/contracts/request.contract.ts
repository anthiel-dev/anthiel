import { z } from "zod";

import { INVOICE_STATUSES, SERVICE_TYPES } from "@/database/schema/invoices.schema";

export const invoiceIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const invoiceShareTokenParamsSchema = z.object({
  shareToken: z.string().min(1).max(128),
});

export const listInvoicesQuerySchema = z.object({
  status: z.enum(INVOICE_STATUSES).optional(),
  businessId: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
});

export const invoiceLineItemInputSchema = z.object({
  serviceType: z.enum(SERVICE_TYPES),
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().positive().max(1_000_000),
  unitAmount: z.number().int().nonnegative().max(1_000_000_000_000),
});

export const createInvoiceBodySchema = z.object({
  projectId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  lineItems: z.array(invoiceLineItemInputSchema).min(1).max(100),
});

export const updateInvoiceBodySchema = z
  .object({
    projectId: z.string().min(1).optional(),
    paymentMethodId: z.string().min(1).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
    status: z.enum(INVOICE_STATUSES).optional(),
    lineItems: z.array(invoiceLineItemInputSchema).min(1).max(100).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export type CreateInvoiceBody = z.infer<typeof createInvoiceBodySchema>;
export type UpdateInvoiceBody = z.infer<typeof updateInvoiceBodySchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemInputSchema>;
