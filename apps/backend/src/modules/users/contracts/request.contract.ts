import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const createUserBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  roleId: z.string().min(1),
});

export const updateUserBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().max(320).optional(),
    password: z.string().min(8).max(128).optional(),
    roleId: z.string().min(1).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
