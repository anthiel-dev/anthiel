import { z } from "zod";

import { INVOICE_STATUSES, SERVICE_TYPES } from "@/database/schema/invoices.schema";

export const invoiceBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
});

export const invoiceLineItemSchema = z.object({
  id: z.string(),
  serviceType: z.enum(SERVICE_TYPES),
  description: z.string(),
  quantity: z.number().int(),
  unitAmount: z.number().int(),
  lineAmount: z.number().int(),
  sortOrder: z.number().int(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  shareToken: z.string(),
  businessId: z.string(),
  business: invoiceBusinessSchema,
  createdByUserId: z.string(),
  status: z.enum(INVOICE_STATUSES),
  currency: z.string(),
  totalAmount: z.number().int(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  lineItems: z.array(invoiceLineItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const publicInvoiceSchema = z.object({
  number: z.string(),
  business: invoiceBusinessSchema,
  status: z.enum(INVOICE_STATUSES),
  currency: z.string(),
  totalAmount: z.number().int(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  lineItems: z.array(invoiceLineItemSchema),
});

export const listInvoicesResponseSchema = z.object({
  data: z.array(invoiceSchema),
});

export const getInvoiceResponseSchema = z.object({
  data: invoiceSchema,
});

export const getPublicInvoiceResponseSchema = z.object({
  data: publicInvoiceSchema,
});

export const deleteInvoiceResponseSchema = z.object({
  success: z.literal(true),
});

export const invoiceErrorResponseSchema = z.object({
  error: z.string(),
});

export type InvoiceDto = z.infer<typeof invoiceSchema>;
export type PublicInvoiceDto = z.infer<typeof publicInvoiceSchema>;
export type InvoiceLineItemDto = z.infer<typeof invoiceLineItemSchema>;
