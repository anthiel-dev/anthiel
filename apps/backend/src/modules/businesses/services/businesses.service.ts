import { asc, eq } from "drizzle-orm";

import type { AppDb } from "@/database";

import { businesses, invoices, user as userTable } from "@/database/schema";

import type { CreateBusinessBody, UpdateBusinessBody } from "../contracts/request.contract";
import type { BusinessDto } from "../contracts/response.contract";

type BusinessRow = typeof businesses.$inferSelect;

type BusinessMutationResult = { data: BusinessDto } | { error: "business_not_found" };

type DeleteBusinessResult =
  | { success: true }
  | { error: "business_not_found" | "has_users" | "has_invoices" };

function newId() {
  return crypto.randomUUID();
}

export class BusinessesService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listBusinesses(): Promise<BusinessDto[]> {
    const rows = await this.deps.db.query.businesses.findMany({
      orderBy: [asc(businesses.name)],
    });
    return rows.map((row) => this.toDto(row));
  }

  async getBusinessById(id: string): Promise<BusinessDto | null> {
    const row = await this.deps.db.query.businesses.findFirst({
      where: eq(businesses.id, id),
    });
    return row ? this.toDto(row) : null;
  }

  async createBusiness(input: CreateBusinessBody): Promise<BusinessMutationResult> {
    const id = newId();
    await this.deps.db.insert(businesses).values({
      id,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    });

    const created = await this.getBusinessById(id);
    if (!created) return { error: "business_not_found" };
    return { data: created };
  }

  async updateBusiness(id: string, input: UpdateBusinessBody): Promise<BusinessMutationResult> {
    const existing = await this.getBusinessById(id);
    if (!existing) return { error: "business_not_found" };

    const changes: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      notes?: string | null;
    } = {};

    if (input.name !== undefined) changes.name = input.name;
    if (input.email !== undefined) changes.email = input.email;
    if (input.phone !== undefined) changes.phone = input.phone;
    if (input.address !== undefined) changes.address = input.address;
    if (input.notes !== undefined) changes.notes = input.notes;

    if (Object.keys(changes).length > 0) {
      await this.deps.db.update(businesses).set(changes).where(eq(businesses.id, id));
    }

    const updated = await this.getBusinessById(id);
    if (!updated) return { error: "business_not_found" };
    return { data: updated };
  }

  async deleteBusiness(id: string): Promise<DeleteBusinessResult> {
    const existing = await this.getBusinessById(id);
    if (!existing) return { error: "business_not_found" };

    const linkedUser = await this.deps.db.query.user.findFirst({
      where: eq(userTable.businessId, id),
      columns: { id: true },
    });
    if (linkedUser) return { error: "has_users" };

    const linkedInvoice = await this.deps.db.query.invoices.findFirst({
      where: eq(invoices.businessId, id),
      columns: { id: true },
    });
    if (linkedInvoice) return { error: "has_invoices" };

    await this.deps.db.delete(businesses).where(eq(businesses.id, id));
    return { success: true };
  }

  private toDto(row: BusinessRow): BusinessDto {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
