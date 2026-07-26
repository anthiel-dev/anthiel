import { and, desc, eq } from "drizzle-orm";

import type { AppDb } from "@/database";

import { projectApiKeys, projects } from "@/database/schema";
import { generateApiKey, hashApiKey } from "@/lib/api-key";

import type { CreateProjectApiKeyBody } from "../contracts/request.contract";
import type { CreatedProjectApiKeyDto, ProjectApiKeyDto } from "../contracts/response.contract";

type CreateApiKeyResult = { data: CreatedProjectApiKeyDto } | { error: "project_not_found" };

type DeleteApiKeyResult = { success: true } | { error: "project_not_found" | "api_key_not_found" };

export type ResolvedProjectApiKey = {
  id: string;
  projectId: string;
  name: string;
};

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export class ProjectApiKeysService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listApiKeys(projectId: string): Promise<ProjectApiKeyDto[] | null> {
    const project = await this.findProject(projectId);
    if (!project) return null;

    const rows = await this.deps.db.query.projectApiKeys.findMany({
      where: eq(projectApiKeys.projectId, projectId),
      orderBy: [desc(projectApiKeys.createdAt)],
      columns: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      lastUsedAt: toIso(row.lastUsedAt),
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async createApiKey(
    projectId: string,
    input: CreateProjectApiKeyBody,
    createdByUserId: string,
  ): Promise<CreateApiKeyResult> {
    const project = await this.findProject(projectId);
    if (!project) return { error: "project_not_found" };

    const generated = generateApiKey();
    const id = crypto.randomUUID();

    await this.deps.db.insert(projectApiKeys).values({
      id,
      projectId,
      name: input.name,
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash,
      createdByUserId,
    });

    return {
      data: {
        id,
        name: input.name,
        keyPrefix: generated.keyPrefix,
        apiKey: generated.apiKey,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async deleteApiKey(projectId: string, apiKeyId: string): Promise<DeleteApiKeyResult> {
    const project = await this.findProject(projectId);
    if (!project) return { error: "project_not_found" };

    const existing = await this.deps.db.query.projectApiKeys.findFirst({
      where: and(eq(projectApiKeys.id, apiKeyId), eq(projectApiKeys.projectId, projectId)),
      columns: { id: true },
    });
    if (!existing) return { error: "api_key_not_found" };

    await this.deps.db.delete(projectApiKeys).where(eq(projectApiKeys.id, apiKeyId));
    return { success: true };
  }

  async resolveApiKey(rawKey: string): Promise<ResolvedProjectApiKey | null> {
    const keyHash = hashApiKey(rawKey);
    const row = await this.deps.db.query.projectApiKeys.findFirst({
      where: eq(projectApiKeys.keyHash, keyHash),
      columns: {
        id: true,
        projectId: true,
        name: true,
      },
    });
    if (!row) return null;

    await this.deps.db
      .update(projectApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(projectApiKeys.id, row.id));

    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
    };
  }

  private findProject(id: string) {
    return this.deps.db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: { id: true },
    });
  }
}
