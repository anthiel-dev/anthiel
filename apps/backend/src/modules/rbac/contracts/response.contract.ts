import { z } from "zod";

export const resourceSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export const permissionSchema = z.object({
  id: z.string(),
  key: z.string(),
  action: z.string(),
  description: z.string().nullable(),
  resourceId: z.string(),
  resourceKey: z.string(),
  resourceName: z.string(),
  roles: z.array(z.string()),
});

export const roleSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permissionCount: z.number().int().nonnegative(),
  resources: z.array(z.string()),
});

export const roleDetailSchema = roleSchema.extend({
  permissions: z.array(permissionSchema),
});

export const listResourcesResponseSchema = z.object({
  data: z.array(resourceSchema),
});

export const listPermissionsResponseSchema = z.object({
  data: z.array(permissionSchema),
});

export const listRolesResponseSchema = z.object({
  data: z.array(roleSchema),
});

export const getRoleResponseSchema = z.object({
  data: roleDetailSchema,
});

export type ResourceDto = z.infer<typeof resourceSchema>;
export type PermissionDto = z.infer<typeof permissionSchema>;
export type RoleDto = z.infer<typeof roleSchema>;
export type RoleDetailDto = z.infer<typeof roleDetailSchema>;
