import { z } from "zod";

import { PROJECT_STATUSES } from "@/database/schema/projects.schema";

export const projectIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const projectMemberParamsSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
});

export const listProjectsQuerySchema = z.object({
  businessId: z.string().min(1).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const createProjectBodySchema = z.object({
  businessId: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  status: z.enum(PROJECT_STATUSES).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const addProjectMemberBodySchema = z.object({
  userId: z.string().min(1),
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type AddProjectMemberBody = z.infer<typeof addProjectMemberBodySchema>;
