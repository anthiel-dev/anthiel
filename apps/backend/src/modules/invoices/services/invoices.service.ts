import { and, desc, eq, like, ne } from "drizzle-orm";

import type { AppDb } from "@/database";
import type { InvoiceStatus, ServiceType } from "@/database/schema/invoices.schema";

import { businesses, invoiceLineItems, invoices, user as userTable } from "@/database/schema";

import type {
  CreateInvoiceBody,
  InvoiceLineItemInput,
  ListInvoicesQuery,
  UpdateInvoiceBody,
} from "../contracts/request.contract";
import type { InvoiceDto, PublicInvoiceDto } from "../contracts/response.contract";

type InvoiceRow = typeof invoices.$inferSelect;
type LineItemRow = typeof invoiceLineItems.$inferSelect;
type BusinessRow = {
  id: string;
  name: string;
  email: string | null;
};

type InvoiceWithRelations = InvoiceRow & {
  lineItems: LineItemRow[];
  business: BusinessRow | null;
};

type InvoiceMutationError =
  | "business_not_found"
  | "invoice_not_found"
  | "not_editable"
  | "invalid_status_transition"
  | "not_draft";

type InvoiceMutationResult = { data: InvoiceDto } | { error: InvoiceMutationError };

type DeleteInvoiceResult = { success: true } | { error: "invoice_not_found" | "not_draft" };

const ALLOWED_STATUS_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

function newId() {
  return crypto.randomUUID();
}

function newShareToken() {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export class InvoicesService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listInvoices(options: {
    isAdmin: boolean;
    currentUserId: string;
    query: ListInvoicesQuery;
  }): Promise<InvoiceDto[]> {
    const conditions = [];

    if (!options.isAdmin) {
      const membership = await this.getUserBusinessId(options.currentUserId);
      if (!membership) return [];
      conditions.push(eq(invoices.businessId, membership));
    } else if (options.query.businessId) {
      conditions.push(eq(invoices.businessId, options.query.businessId));
    }

    if (options.query.status) {
      conditions.push(eq(invoices.status, options.query.status));
    }

    const rows = await this.deps.db.query.invoices.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        lineItems: {
          orderBy: (table, { asc }) => [asc(table.sortOrder)],
        },
        business: {
          columns: { id: true, name: true, email: true },
        },
      },
      orderBy: [desc(invoices.createdAt)],
    });

    return rows.map((row) => this.toDto(row as InvoiceWithRelations));
  }

  async getInvoiceById(
    id: string,
    options: { isAdmin: boolean; currentUserId: string },
  ): Promise<InvoiceDto | null> {
    const row = await this.findInvoiceById(id);
    if (!row) return null;
    if (!options.isAdmin) {
      const membership = await this.getUserBusinessId(options.currentUserId);
      if (!membership || row.businessId !== membership) return null;
    }
    return this.toDto(row);
  }

  async getPublicInvoiceByToken(token: string): Promise<PublicInvoiceDto | null> {
    const row = await this.deps.db.query.invoices.findFirst({
      where: and(eq(invoices.shareToken, token), ne(invoices.status, "draft")),
      with: {
        lineItems: {
          orderBy: (table, { asc }) => [asc(table.sortOrder)],
        },
        business: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!row) return null;
    return this.toPublicDto(row as InvoiceWithRelations);
  }

  async createInvoice(
    input: CreateInvoiceBody,
    createdByUserId: string,
  ): Promise<InvoiceMutationResult> {
    const business = await this.findBusiness(input.businessId);
    if (!business) return { error: "business_not_found" };

    const preparedLines = this.prepareLineItems(input.lineItems);
    const totalAmount = preparedLines.reduce((sum, line) => sum + line.lineAmount, 0);
    const invoiceId = newId();
    const number = await this.nextInvoiceNumber();
    const now = new Date();

    await this.deps.db.insert(invoices).values({
      id: invoiceId,
      number,
      shareToken: newShareToken(),
      businessId: input.businessId,
      createdByUserId,
      status: "draft",
      currency: "IDR",
      totalAmount,
      issueDate: now,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      notes: input.notes ?? null,
    });

    await this.deps.db.insert(invoiceLineItems).values(
      preparedLines.map((line, index) => ({
        id: newId(),
        invoiceId,
        serviceType: line.serviceType,
        description: line.description,
        quantity: line.quantity,
        unitAmount: line.unitAmount,
        lineAmount: line.lineAmount,
        sortOrder: index,
      })),
    );

    const created = await this.findInvoiceById(invoiceId);
    if (!created) return { error: "invoice_not_found" };
    return { data: this.toDto(created) };
  }

  async updateInvoice(id: string, input: UpdateInvoiceBody): Promise<InvoiceMutationResult> {
    const existing = await this.findInvoiceById(id);
    if (!existing) return { error: "invoice_not_found" };

    if (input.status !== undefined && input.status !== existing.status) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status as InvoiceStatus];
      if (!allowed.includes(input.status)) {
        return { error: "invalid_status_transition" };
      }
    }

    const isContentUpdate =
      input.businessId !== undefined ||
      input.dueDate !== undefined ||
      input.notes !== undefined ||
      input.lineItems !== undefined;

    if (isContentUpdate && existing.status !== "draft") {
      return { error: "not_editable" };
    }

    if (input.businessId !== undefined) {
      const business = await this.findBusiness(input.businessId);
      if (!business) return { error: "business_not_found" };
    }

    const changes: {
      businessId?: string;
      dueDate?: Date | null;
      notes?: string | null;
      status?: InvoiceStatus;
      totalAmount?: number;
    } = {};

    if (input.businessId !== undefined) changes.businessId = input.businessId;
    if (input.dueDate !== undefined) {
      changes.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.notes !== undefined) changes.notes = input.notes;
    if (input.status !== undefined) changes.status = input.status;

    if (input.lineItems) {
      const preparedLines = this.prepareLineItems(input.lineItems);
      changes.totalAmount = preparedLines.reduce((sum, line) => sum + line.lineAmount, 0);

      await this.deps.db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));
      await this.deps.db.insert(invoiceLineItems).values(
        preparedLines.map((line, index) => ({
          id: newId(),
          invoiceId: id,
          serviceType: line.serviceType,
          description: line.description,
          quantity: line.quantity,
          unitAmount: line.unitAmount,
          lineAmount: line.lineAmount,
          sortOrder: index,
        })),
      );
    }

    if (Object.keys(changes).length > 0) {
      await this.deps.db.update(invoices).set(changes).where(eq(invoices.id, id));
    }

    const updated = await this.findInvoiceById(id);
    if (!updated) return { error: "invoice_not_found" };
    return { data: this.toDto(updated) };
  }

  async deleteInvoice(id: string): Promise<DeleteInvoiceResult> {
    const existing = await this.findInvoiceById(id);
    if (!existing) return { error: "invoice_not_found" };
    if (existing.status !== "draft") return { error: "not_draft" };

    await this.deps.db.delete(invoices).where(eq(invoices.id, id));
    return { success: true };
  }

  private prepareLineItems(items: InvoiceLineItemInput[]) {
    return items.map((item) => ({
      serviceType: item.serviceType as ServiceType,
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      lineAmount: item.quantity * item.unitAmount,
    }));
  }

  private async nextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const latest = await this.deps.db.query.invoices.findFirst({
      where: like(invoices.number, `${prefix}%`),
      orderBy: [desc(invoices.number)],
      columns: { number: true },
    });

    const nextSeq = latest ? Number(latest.number.slice(prefix.length)) + 1 : 1;
    return `${prefix}${String(nextSeq).padStart(4, "0")}`;
  }

  private findBusiness(id: string) {
    return this.deps.db.query.businesses.findFirst({
      where: eq(businesses.id, id),
      columns: { id: true, name: true, email: true },
    });
  }

  private async getUserBusinessId(userId: string) {
    const row = await this.deps.db.query.user.findFirst({
      where: eq(userTable.id, userId),
      columns: { businessId: true },
    });
    return row?.businessId ?? null;
  }

  private findInvoiceById(id: string): Promise<InvoiceWithRelations | undefined> {
    return this.deps.db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        lineItems: {
          orderBy: (table, { asc }) => [asc(table.sortOrder)],
        },
        business: {
          columns: { id: true, name: true, email: true },
        },
      },
    }) as Promise<InvoiceWithRelations | undefined>;
  }

  private toDto(row: InvoiceWithRelations): InvoiceDto {
    const business = row.business;
    return {
      id: row.id,
      number: row.number,
      shareToken: row.shareToken,
      businessId: row.businessId,
      business: {
        id: business?.id ?? row.businessId,
        name: business?.name ?? "Unknown",
        email: business?.email ?? null,
      },
      createdByUserId: row.createdByUserId,
      status: row.status as InvoiceStatus,
      currency: row.currency,
      totalAmount: row.totalAmount,
      issueDate: row.issueDate.toISOString(),
      dueDate: toIso(row.dueDate),
      notes: row.notes,
      lineItems: row.lineItems.map((line) => ({
        id: line.id,
        serviceType: line.serviceType as ServiceType,
        description: line.description,
        quantity: line.quantity,
        unitAmount: line.unitAmount,
        lineAmount: line.lineAmount,
        sortOrder: line.sortOrder,
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toPublicDto(row: InvoiceWithRelations): PublicInvoiceDto {
    const full = this.toDto(row);
    return {
      number: full.number,
      business: full.business,
      status: full.status,
      currency: full.currency,
      totalAmount: full.totalAmount,
      issueDate: full.issueDate,
      dueDate: full.dueDate,
      notes: full.notes,
      lineItems: full.lineItems,
    };
  }
}
