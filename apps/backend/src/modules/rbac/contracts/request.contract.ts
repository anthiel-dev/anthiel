import { z } from "zod";

export const roleIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateRolePermissionBodySchema = z.object({
  permissionId: z.string().min(1),
  granted: z.boolean(),
});

export type RoleIdParams = z.infer<typeof roleIdParamsSchema>;
export type UpdateRolePermissionBody = z.infer<typeof updateRolePermissionBodySchema>;
