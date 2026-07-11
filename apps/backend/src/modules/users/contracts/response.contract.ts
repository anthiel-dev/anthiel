import { z } from "zod";

export const userRoleSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
});

export const userBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  roleId: z.string().nullable(),
  role: userRoleSchema.nullable(),
  businessId: z.string().nullable(),
  business: userBusinessSchema.nullable(),
  status: z.enum(["active", "banned"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const listUsersResponseSchema = z.object({
  data: z.array(userSchema),
});

export const getUserResponseSchema = z.object({
  data: userSchema,
});

export const deleteUserResponseSchema = z.object({
  success: z.literal(true),
});

export const userErrorResponseSchema = z.object({
  error: z.string(),
});

export type UserDto = z.infer<typeof userSchema>;
