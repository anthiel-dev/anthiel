import { Elysia } from "elysia";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";
import { canManage } from "@/modules/rbac";

import {
  addProjectMemberBodySchema,
  createProjectBodySchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  projectMemberParamsSchema,
  updateProjectBodySchema,
} from "../contracts/request.contract";
import {
  addProjectMemberResponseSchema,
  deleteProjectResponseSchema,
  getProjectResponseSchema,
  listProjectMembersResponseSchema,
  listProjectsResponseSchema,
  projectErrorResponseSchema,
  removeProjectMemberResponseSchema,
} from "../contracts/response.contract";
import { ProjectsService } from "../services/projects.service";

export const projectsRoutes = (db: AppDb) => {
  const projectsService = new ProjectsService({ db });

  return new Elysia({ prefix: "/projects", name: "projects", tags: ["Projects"] })
    .use(authGuardPlugin)
    .get(
      "",
      async ({ query, user }) => {
        const manage = canManage(user.role);
        return {
          data: await projectsService.listProjects({
            isAdmin: manage,
            currentUserId: user.id,
            query: manage ? query : { status: query.status },
          }),
        };
      },
      {
        auth: true,
        query: listProjectsQuerySchema,
        response: listProjectsResponseSchema,
        detail: {
          summary: "List projects",
          operationId: "listProjects",
        },
      },
    )
    .get(
      "/:id",
      async ({ params, status, user }) => {
        const project = await projectsService.getProjectById(params.id, {
          isAdmin: canManage(user.role),
          currentUserId: user.id,
        });
        if (!project) return status(404, { error: "Project not found" });
        return { data: project };
      },
      {
        auth: true,
        params: projectIdParamsSchema,
        response: {
          200: getProjectResponseSchema,
          404: projectErrorResponseSchema,
        },
        detail: {
          summary: "Get project by id",
          operationId: "getProjectById",
        },
      },
    )
    .post(
      "",
      async ({ body, status }) => {
        const result = await projectsService.createProject(body);
        if ("error" in result) {
          if (result.error === "business_not_found") {
            return status(404, { error: "Business not found" });
          }
          return status(500, { error: "Created project could not be loaded" });
        }
        return status(201, { data: result.data });
      },
      {
        manage: true,
        body: createProjectBodySchema,
        response: {
          201: getProjectResponseSchema,
          404: projectErrorResponseSchema,
          500: projectErrorResponseSchema,
        },
        detail: {
          summary: "Create project",
          operationId: "createProject",
        },
      },
    )
    .patch(
      "/:id",
      async ({ body, params, status }) => {
        const result = await projectsService.updateProject(params.id, body);
        if ("error" in result) {
          return status(404, { error: "Project not found" });
        }
        return { data: result.data };
      },
      {
        manage: true,
        params: projectIdParamsSchema,
        body: updateProjectBodySchema,
        response: {
          200: getProjectResponseSchema,
          404: projectErrorResponseSchema,
        },
        detail: {
          summary: "Update project",
          operationId: "updateProject",
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, status }) => {
        const result = await projectsService.deleteProject(params.id);
        if ("error" in result) {
          if (result.error === "has_invoices") {
            return status(409, { error: "Project still has invoices" });
          }
          if (result.error === "has_members") {
            return status(409, { error: "Project still has members" });
          }
          return status(404, { error: "Project not found" });
        }
        return { success: true as const };
      },
      {
        manage: true,
        params: projectIdParamsSchema,
        response: {
          200: deleteProjectResponseSchema,
          404: projectErrorResponseSchema,
          409: projectErrorResponseSchema,
        },
        detail: {
          summary: "Delete project",
          operationId: "deleteProject",
        },
      },
    )
    .get(
      "/:id/members",
      async ({ params, status }) => {
        const members = await projectsService.listMembers(params.id);
        if (!members) return status(404, { error: "Project not found" });
        return { data: members };
      },
      {
        manage: true,
        params: projectIdParamsSchema,
        response: {
          200: listProjectMembersResponseSchema,
          404: projectErrorResponseSchema,
        },
        detail: {
          summary: "List project members",
          operationId: "listProjectMembers",
        },
      },
    )
    .post(
      "/:id/members",
      async ({ body, params, status }) => {
        const result = await projectsService.addMember(params.id, body);
        if ("error" in result) {
          if (result.error === "project_not_found") {
            return status(404, { error: "Project not found" });
          }
          if (result.error === "user_not_found") {
            return status(404, { error: "User not found" });
          }
          if (result.error === "already_member") {
            return status(409, { error: "User is already a project member" });
          }
          if (result.error === "client_business_mismatch") {
            return status(409, {
              error: "Client users can only join projects for their business",
            });
          }
          return status(409, { error: "Unable to add project member" });
        }
        return status(201, { data: result.data });
      },
      {
        manage: true,
        params: projectIdParamsSchema,
        body: addProjectMemberBodySchema,
        response: {
          201: addProjectMemberResponseSchema,
          404: projectErrorResponseSchema,
          409: projectErrorResponseSchema,
        },
        detail: {
          summary: "Add project member",
          operationId: "addProjectMember",
        },
      },
    )
    .delete(
      "/:id/members/:userId",
      async ({ params, status }) => {
        const result = await projectsService.removeMember(params.id, params.userId);
        if ("error" in result) {
          if (result.error === "not_member") {
            return status(404, { error: "Project member not found" });
          }
          return status(404, { error: "Project not found" });
        }
        return { success: true as const };
      },
      {
        manage: true,
        params: projectMemberParamsSchema,
        response: {
          200: removeProjectMemberResponseSchema,
          404: projectErrorResponseSchema,
        },
        detail: {
          summary: "Remove project member",
          operationId: "removeProjectMember",
        },
      },
    );
};
