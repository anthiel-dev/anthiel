import { and, asc, count, eq, inArray } from "drizzle-orm";

import type { AppDb } from "@/database";
import type { ProjectStatus } from "@/database/schema/projects.schema";

import {
  businesses,
  invoices,
  projectMembers,
  projects,
  user as userTable,
} from "@/database/schema";
import { ROLE } from "@/modules/rbac";

import type {
  AddProjectMemberBody,
  CreateProjectBody,
  ListProjectsQuery,
  UpdateProjectBody,
} from "../contracts/request.contract";
import type { ProjectDto, ProjectMemberDto } from "../contracts/response.contract";

type ProjectRow = typeof projects.$inferSelect;
type BusinessRow = { id: string; name: string };

type ProjectWithBusiness = ProjectRow & {
  business: BusinessRow | null;
};

type ProjectMutationError =
  | "business_not_found"
  | "project_not_found"
  | "user_not_found"
  | "already_member"
  | "client_business_mismatch"
  | "has_invoices"
  | "has_members";

type ProjectMutationResult = { data: ProjectDto } | { error: ProjectMutationError };

type DeleteProjectResult =
  | { success: true }
  | { error: "project_not_found" | "has_invoices" | "has_members" };

type MemberMutationResult =
  | { data: ProjectMemberDto }
  | {
      error:
        | "project_not_found"
        | "user_not_found"
        | "already_member"
        | "client_business_mismatch"
        | "not_member";
    };

type RemoveMemberResult = { success: true } | { error: "project_not_found" | "not_member" };

function newId() {
  return crypto.randomUUID();
}

function toIso(value: Date) {
  return value.toISOString();
}

export class ProjectsService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listProjects(options: {
    isAdmin: boolean;
    currentUserId: string;
    query: ListProjectsQuery;
  }): Promise<ProjectDto[]> {
    const conditions = [];

    if (!options.isAdmin) {
      const memberProjectIds = await this.getMemberProjectIds(options.currentUserId);
      if (memberProjectIds.length === 0) return [];
      conditions.push(inArray(projects.id, memberProjectIds));
    } else if (options.query.businessId) {
      conditions.push(eq(projects.businessId, options.query.businessId));
    }

    if (options.query.status) {
      conditions.push(eq(projects.status, options.query.status));
    }

    const rows = await this.deps.db.query.projects.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        business: { columns: { id: true, name: true } },
      },
      orderBy: [asc(projects.name)],
    });

    const memberCounts = await this.getMemberCounts(rows.map((row) => row.id));

    return rows.map((row) => this.toDto(row as ProjectWithBusiness, memberCounts.get(row.id) ?? 0));
  }

  async getProjectById(
    id: string,
    options: { isAdmin: boolean; currentUserId: string },
  ): Promise<ProjectDto | null> {
    const row = await this.findProjectById(id);
    if (!row) return null;

    if (!options.isAdmin) {
      const isMember = await this.isProjectMember(id, options.currentUserId);
      if (!isMember) return null;
    }

    const memberCounts = await this.getMemberCounts([id]);
    return this.toDto(row, memberCounts.get(id) ?? 0);
  }

  async createProject(input: CreateProjectBody): Promise<ProjectMutationResult> {
    const business = await this.findBusiness(input.businessId);
    if (!business) return { error: "business_not_found" };

    const id = newId();
    await this.deps.db.insert(projects).values({
      id,
      businessId: input.businessId,
      name: input.name,
      status: input.status ?? "active",
      notes: input.notes ?? null,
    });

    const created = await this.findProjectById(id);
    if (!created) return { error: "project_not_found" };
    return { data: this.toDto(created, 0) };
  }

  async updateProject(id: string, input: UpdateProjectBody): Promise<ProjectMutationResult> {
    const existing = await this.findProjectById(id);
    if (!existing) return { error: "project_not_found" };

    const changes: {
      name?: string;
      status?: ProjectStatus;
      notes?: string | null;
    } = {};

    if (input.name !== undefined) changes.name = input.name;
    if (input.status !== undefined) changes.status = input.status;
    if (input.notes !== undefined) changes.notes = input.notes;

    if (Object.keys(changes).length > 0) {
      await this.deps.db.update(projects).set(changes).where(eq(projects.id, id));
    }

    const updated = await this.findProjectById(id);
    if (!updated) return { error: "project_not_found" };
    const memberCounts = await this.getMemberCounts([id]);
    return { data: this.toDto(updated, memberCounts.get(id) ?? 0) };
  }

  async deleteProject(id: string): Promise<DeleteProjectResult> {
    const existing = await this.findProjectById(id);
    if (!existing) return { error: "project_not_found" };

    const linkedInvoice = await this.deps.db.query.invoices.findFirst({
      where: eq(invoices.projectId, id),
      columns: { id: true },
    });
    if (linkedInvoice) return { error: "has_invoices" };

    const linkedMember = await this.deps.db.query.projectMembers.findFirst({
      where: eq(projectMembers.projectId, id),
      columns: { userId: true },
    });
    if (linkedMember) return { error: "has_members" };

    await this.deps.db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  }

  async listMembers(projectId: string): Promise<ProjectMemberDto[] | null> {
    const project = await this.findProjectById(projectId);
    if (!project) return null;

    const rows = await this.deps.db.query.projectMembers.findMany({
      where: eq(projectMembers.projectId, projectId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            businessId: true,
          },
        },
      },
      orderBy: [asc(projectMembers.createdAt)],
    });

    return rows.map((row) => ({
      userId: row.userId,
      name: row.user?.name ?? "Unknown",
      email: row.user?.email ?? "",
      role: row.user?.role ?? null,
      businessId: row.user?.businessId ?? null,
      createdAt: toIso(row.createdAt),
    }));
  }

  async addMember(projectId: string, input: AddProjectMemberBody): Promise<MemberMutationResult> {
    const project = await this.findProjectById(projectId);
    if (!project) return { error: "project_not_found" };

    const user = await this.deps.db.query.user.findFirst({
      where: eq(userTable.id, input.userId),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessId: true,
      },
    });
    if (!user) return { error: "user_not_found" };

    if (user.role === ROLE.client) {
      if (!user.businessId || user.businessId !== project.businessId) {
        return { error: "client_business_mismatch" };
      }
    }

    const existing = await this.deps.db.query.projectMembers.findFirst({
      where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, input.userId)),
      columns: { userId: true },
    });
    if (existing) return { error: "already_member" };

    const now = new Date();
    await this.deps.db.insert(projectMembers).values({
      projectId,
      userId: input.userId,
      createdAt: now,
    });

    return {
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        createdAt: toIso(now),
      },
    };
  }

  async removeMember(projectId: string, userId: string): Promise<RemoveMemberResult> {
    const project = await this.findProjectById(projectId);
    if (!project) return { error: "project_not_found" };

    const deleted = await this.deps.db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
      .returning({ userId: projectMembers.userId });

    if (deleted.length === 0) return { error: "not_member" };
    return { success: true };
  }

  async getMemberProjectIds(userId: string): Promise<string[]> {
    const rows = await this.deps.db.query.projectMembers.findMany({
      where: eq(projectMembers.userId, userId),
      columns: { projectId: true },
    });
    return rows.map((row) => row.projectId);
  }

  private async isProjectMember(projectId: string, userId: string) {
    const row = await this.deps.db.query.projectMembers.findFirst({
      where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
      columns: { userId: true },
    });
    return Boolean(row);
  }

  private async getMemberCounts(projectIds: string[]) {
    const counts = new Map<string, number>();
    if (projectIds.length === 0) return counts;

    const rows = await this.deps.db
      .select({
        projectId: projectMembers.projectId,
        memberCount: count(),
      })
      .from(projectMembers)
      .where(inArray(projectMembers.projectId, projectIds))
      .groupBy(projectMembers.projectId);

    for (const row of rows) {
      counts.set(row.projectId, Number(row.memberCount));
    }
    return counts;
  }

  private findBusiness(id: string) {
    return this.deps.db.query.businesses.findFirst({
      where: eq(businesses.id, id),
      columns: { id: true, name: true },
    });
  }

  private findProjectById(id: string): Promise<ProjectWithBusiness | undefined> {
    return this.deps.db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        business: { columns: { id: true, name: true } },
      },
    }) as Promise<ProjectWithBusiness | undefined>;
  }

  private toDto(row: ProjectWithBusiness, memberCount: number): ProjectDto {
    return {
      id: row.id,
      businessId: row.businessId,
      business: {
        id: row.business?.id ?? row.businessId,
        name: row.business?.name ?? "Unknown",
      },
      name: row.name,
      status: row.status as ProjectStatus,
      notes: row.notes,
      memberCount,
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
    };
  }
}
