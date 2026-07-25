import { z } from "zod";

export const createContactQueryBodySchema = z.object({
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(2000),
});

export type CreateContactQueryBody = z.infer<typeof createContactQueryBodySchema>;
