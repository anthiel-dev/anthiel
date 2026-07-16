import { z } from "zod";

import { PROJECT_STATUSES } from "@/database/schema/projects.schema";

export const projectBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const projectSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  business: projectBusinessSchema,
  name: z.string(),
  status: z.enum(PROJECT_STATUSES),
  notes: z.string().nullable(),
  memberCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const projectMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  businessId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const listProjectsResponseSchema = z.object({
  data: z.array(projectSchema),
});

export const getProjectResponseSchema = z.object({
  data: projectSchema,
});

export const listProjectMembersResponseSchema = z.object({
  data: z.array(projectMemberSchema),
});

export const addProjectMemberResponseSchema = z.object({
  data: projectMemberSchema,
});

export const deleteProjectResponseSchema = z.object({
  success: z.literal(true),
});

export const removeProjectMemberResponseSchema = z.object({
  success: z.literal(true),
});

export const projectErrorResponseSchema = z.object({
  error: z.string(),
});

export type ProjectDto = z.infer<typeof projectSchema>;
export type ProjectMemberDto = z.infer<typeof projectMemberSchema>;
