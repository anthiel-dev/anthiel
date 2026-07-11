import { z } from "zod";

export const businessSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const listBusinessesResponseSchema = z.object({
  data: z.array(businessSchema),
});

export const getBusinessResponseSchema = z.object({
  data: businessSchema,
});

export const deleteBusinessResponseSchema = z.object({
  success: z.literal(true),
});

export const businessErrorResponseSchema = z.object({
  error: z.string(),
});

export type BusinessDto = z.infer<typeof businessSchema>;
