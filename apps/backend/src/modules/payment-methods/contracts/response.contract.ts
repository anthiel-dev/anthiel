import { z } from "zod";

import { PAYMENT_METHOD_TYPES } from "@/database/schema/payment-methods.schema";

export const paymentMethodSchema = z.object({
  id: z.string(),
  method: z.enum(PAYMENT_METHOD_TYPES),
  receiverName: z.string(),
  accountNumber: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const listPaymentMethodsResponseSchema = z.object({
  data: z.array(paymentMethodSchema),
});

export const getPaymentMethodResponseSchema = z.object({
  data: paymentMethodSchema,
});

export const deletePaymentMethodResponseSchema = z.object({
  success: z.literal(true),
});

export const paymentMethodErrorResponseSchema = z.object({
  error: z.string(),
});

export type PaymentMethodDto = z.infer<typeof paymentMethodSchema>;
