import { z } from "zod";

export const contactQueryRateLimitSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  retryAfterMinutes: z.number().int().nonnegative(),
  resetAt: z.string().datetime().nullable(),
});

export const getContactQueryRateLimitResponseSchema = z.object({
  data: contactQueryRateLimitSchema,
});

export const createContactQueryResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    remaining: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    resetAt: z.string().datetime().nullable(),
  }),
});

export const contactQueryErrorResponseSchema = z.object({
  error: z.string(),
  retryAfterMinutes: z.number().int().nonnegative().optional(),
  resetAt: z.string().datetime().nullable().optional(),
});

export type ContactQueryRateLimit = z.infer<typeof contactQueryRateLimitSchema>;
