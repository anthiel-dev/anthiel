import { z } from "zod";

import { PAYMENT_METHOD_TYPES } from "@/database/schema/payment-methods.schema";

export const paymentMethodIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const createPaymentMethodBodySchema = z.object({
  method: z.enum(PAYMENT_METHOD_TYPES),
  receiverName: z.string().trim().min(1).max(200),
  accountNumber: z.string().trim().max(100).nullable().optional(),
});

export const updatePaymentMethodBodySchema = z
  .object({
    method: z.enum(PAYMENT_METHOD_TYPES).optional(),
    receiverName: z.string().trim().min(1).max(200).optional(),
    accountNumber: z.string().trim().max(100).nullable().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export type CreatePaymentMethodBody = z.infer<typeof createPaymentMethodBodySchema>;
export type UpdatePaymentMethodBody = z.infer<typeof updatePaymentMethodBodySchema>;
