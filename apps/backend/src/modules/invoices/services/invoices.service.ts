import { and, desc, eq, inArray, like, ne } from "drizzle-orm";

import type { AppDb } from "@/database";
import type { InvoiceStatus, ServiceType } from "@/database/schema/invoices.schema";
import type { PaymentMethodType } from "@/database/schema/payment-methods.schema";

import {
  invoiceLineItems,
  invoices,
  paymentMethods,
  projectMembers,
  projects,
} from "@/database/schema";
import { env } from "@/env";
import { sendResendEmail } from "@/lib/resend";

import type {
  CreateInvoiceBody,
  InvoiceLineItemInput,
  ListInvoicesQuery,
  SendInvoiceEmailBody,
  UpdateInvoiceBody,
} from "../contracts/request.contract";
import type {
  InvoiceDto,
  PublicInvoiceDto,
  UnpaidInvoiceSummaryDto,
} from "../contracts/response.contract";

type InvoiceRow = typeof invoices.$inferSelect;
type LineItemRow = typeof invoiceLineItems.$inferSelect;
type BusinessRow = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
};
type ProjectRow = {
  id: string;
  name: string;
  status: string;
};
type PaymentMethodRow = {
  id: string;
  method: PaymentMethodType;
  receiverName: string;
  accountNumber: string | null;
};

const businessColumns = { id: true, name: true, email: true, address: true } as const;
const projectColumns = { id: true, name: true, status: true } as const;
const paymentMethodColumns = {
  id: true,
  method: true,
  receiverName: true,
  accountNumber: true,
} as const;

type InvoiceWithRelations = InvoiceRow & {
  lineItems: LineItemRow[];
  business: BusinessRow | null;
  project: ProjectRow | null;
  paymentMethod: PaymentMethodRow | null;
};

type InvoiceMutationError =
  | "project_not_found"
  | "payment_method_not_found"
  | "invoice_not_found"
  | "not_editable"
  | "invalid_status_transition"
  | "not_draft";

type SendInvoiceEmailError =
  | "invoice_not_found"
  | "already_sent"
  | "cancelled"
  | "missing_business_email"
  | "invalid_primary_email"
  | "email_not_configured"
  | "send_failed";

type InvoiceMutationResult = { data: InvoiceDto } | { error: InvoiceMutationError };

type SendInvoiceEmailResult =
  | { data: InvoiceDto }
  | { error: SendInvoiceEmailError; message?: string };

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildInvoiceEmailHtml(options: {
  invoiceNumber: string;
  businessName: string;
  projectName: string;
  totalFormatted: string;
  invoiceUrl: string;
  dueDate: string | null;
}) {
  const dueLabel = options.dueDate
    ? new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(options.dueDate))
    : "—";

  return `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.5; color: #111;">
      <p>Hello ${escapeHtml(options.businessName)},</p>
      <p>
        Please find invoice <strong>${escapeHtml(options.invoiceNumber)}</strong>
        for project <strong>${escapeHtml(options.projectName)}</strong>.
      </p>
      <p>
        <strong>Total:</strong> ${escapeHtml(options.totalFormatted)}<br />
        <strong>Due:</strong> ${escapeHtml(dueLabel)}
      </p>
      <p>
        <a href="${escapeHtml(options.invoiceUrl)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          View invoice
        </a>
      </p>
      <p style="color:#666;font-size:12px;">
        If the button does not work, open this link:<br />
        ${escapeHtml(options.invoiceUrl)}
      </p>
    </div>
  `.trim();
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
      const memberProjectIds = await this.getMemberProjectIds(options.currentUserId);
      if (memberProjectIds.length === 0) return [];
      conditions.push(inArray(invoices.projectId, memberProjectIds));
    } else {
      if (options.query.businessId) {
        conditions.push(eq(invoices.businessId, options.query.businessId));
      }
      if (options.query.projectId) {
        conditions.push(eq(invoices.projectId, options.query.projectId));
      }
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
          columns: businessColumns,
        },
        project: {
          columns: projectColumns,
        },
        paymentMethod: {
          columns: paymentMethodColumns,
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
      const isMember = await this.isProjectMember(row.projectId, options.currentUserId);
      if (!isMember) return null;
    }
    return this.toDto(row);
  }

  async getPublicInvoiceByShareToken(shareToken: string): Promise<PublicInvoiceDto | null> {
    const row = await this.deps.db.query.invoices.findFirst({
      where: and(eq(invoices.shareToken, shareToken), ne(invoices.status, "draft")),
      with: {
        lineItems: {
          orderBy: (table, { asc }) => [asc(table.sortOrder)],
        },
        business: {
          columns: businessColumns,
        },
        project: {
          columns: projectColumns,
        },
        paymentMethod: {
          columns: paymentMethodColumns,
        },
      },
    });

    if (!row) return null;
    return this.toPublicDto(row as InvoiceWithRelations);
  }

  async getLatestUnpaidInvoiceForProject(
    projectId: string,
  ): Promise<UnpaidInvoiceSummaryDto | null> {
    const row = await this.deps.db.query.invoices.findFirst({
      where: and(eq(invoices.status, "sent"), eq(invoices.projectId, projectId)),
      columns: {
        totalAmount: true,
        createdAt: true,
        dueDate: true,
        shareToken: true,
      },
      orderBy: [desc(invoices.createdAt)],
    });

    if (!row) return null;

    const dashboardUrl = env.DASHBOARD_URL.replace(/\/$/, "");
    return {
      totalAmount: row.totalAmount,
      createdAt: row.createdAt.toISOString(),
      dueDate: toIso(row.dueDate),
      invoiceUrl: `${dashboardUrl}/invoice/${encodeURIComponent(row.shareToken)}`,
    };
  }

  async createInvoice(
    input: CreateInvoiceBody,
    createdByUserId: string,
  ): Promise<InvoiceMutationResult> {
    const project = await this.findProject(input.projectId);
    if (!project) return { error: "project_not_found" };

    const paymentMethod = await this.findPaymentMethod(input.paymentMethodId);
    if (!paymentMethod) return { error: "payment_method_not_found" };

    const preparedLines = this.prepareLineItems(input.lineItems);
    const totalAmount = preparedLines.reduce((sum, line) => sum + line.lineAmount, 0);
    const invoiceId = newId();
    const number = await this.nextInvoiceNumber();
    const now = new Date();

    await this.deps.db.insert(invoices).values({
      id: invoiceId,
      number,
      shareToken: newShareToken(),
      businessId: project.businessId,
      projectId: project.id,
      paymentMethodId: input.paymentMethodId,
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
      input.projectId !== undefined ||
      input.paymentMethodId !== undefined ||
      input.dueDate !== undefined ||
      input.notes !== undefined ||
      input.lineItems !== undefined;

    if (isContentUpdate && existing.status !== "draft") {
      return { error: "not_editable" };
    }

    let nextBusinessId: string | undefined;
    if (input.projectId !== undefined) {
      const project = await this.findProject(input.projectId);
      if (!project) return { error: "project_not_found" };
      nextBusinessId = project.businessId;
    }

    if (input.paymentMethodId !== undefined) {
      const paymentMethod = await this.findPaymentMethod(input.paymentMethodId);
      if (!paymentMethod) return { error: "payment_method_not_found" };
    }

    const changes: {
      projectId?: string;
      businessId?: string;
      paymentMethodId?: string;
      dueDate?: Date | null;
      notes?: string | null;
      status?: InvoiceStatus;
      totalAmount?: number;
    } = {};

    if (input.projectId !== undefined) {
      changes.projectId = input.projectId;
      changes.businessId = nextBusinessId;
    }
    if (input.paymentMethodId !== undefined) changes.paymentMethodId = input.paymentMethodId;
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

  async sendInvoiceEmail(id: string, input: SendInvoiceEmailBody): Promise<SendInvoiceEmailResult> {
    const existing = await this.findInvoiceById(id);
    if (!existing) return { error: "invoice_not_found" };
    if (existing.emailSentAt) return { error: "already_sent" };
    if (existing.status === "cancelled") return { error: "cancelled" };

    const businessEmail = existing.business?.email?.trim().toLowerCase() ?? "";
    if (!businessEmail) return { error: "missing_business_email" };

    const emails = input.emails.map((email) => email.trim());
    if (emails[0]?.toLowerCase() !== businessEmail) {
      return { error: "invalid_primary_email" };
    }

    const dto = this.toDto(existing);
    const dashboardUrl = env.DASHBOARD_URL.replace(/\/$/, "");
    const invoiceUrl = `${dashboardUrl}/invoice/${encodeURIComponent(dto.shareToken)}`;
    const totalFormatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: dto.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(dto.totalAmount);

    const sent = await sendResendEmail({
      kind: "invoice",
      to: emails,
      subject: `Invoice ${dto.number} — ${dto.project.name}`,
      html: buildInvoiceEmailHtml({
        invoiceNumber: dto.number,
        businessName: dto.business.name,
        projectName: dto.project.name,
        totalFormatted,
        invoiceUrl,
        dueDate: dto.dueDate,
      }),
    });

    if (!sent.ok) {
      return sent.error === "email_not_configured"
        ? { error: "email_not_configured" }
        : { error: "send_failed", message: sent.message };
    }

    const now = new Date();
    const changes: { emailSentAt: Date; status?: InvoiceStatus } = { emailSentAt: now };
    if (existing.status === "draft") {
      changes.status = "sent";
    }

    await this.deps.db.update(invoices).set(changes).where(eq(invoices.id, id));

    const updated = await this.findInvoiceById(id);
    if (!updated) return { error: "invoice_not_found" };
    return { data: this.toDto(updated) };
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

  private findProject(id: string) {
    return this.deps.db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: { id: true, businessId: true, name: true, status: true },
    });
  }

  private findPaymentMethod(id: string) {
    return this.deps.db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, id),
      columns: paymentMethodColumns,
    });
  }

  private async getMemberProjectIds(userId: string) {
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

  private findInvoiceById(id: string): Promise<InvoiceWithRelations | undefined> {
    return this.deps.db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        lineItems: {
          orderBy: (table, { asc }) => [asc(table.sortOrder)],
        },
        business: {
          columns: businessColumns,
        },
        project: {
          columns: projectColumns,
        },
        paymentMethod: {
          columns: paymentMethodColumns,
        },
      },
    }) as Promise<InvoiceWithRelations | undefined>;
  }

  private toDto(row: InvoiceWithRelations): InvoiceDto {
    const business = row.business;
    const project = row.project;
    const paymentMethod = row.paymentMethod;
    return {
      id: row.id,
      number: row.number,
      shareToken: row.shareToken,
      businessId: row.businessId,
      business: {
        id: business?.id ?? row.businessId,
        name: business?.name ?? "Unknown",
        email: business?.email ?? null,
        address: business?.address ?? null,
      },
      projectId: row.projectId,
      project: {
        id: project?.id ?? row.projectId,
        name: project?.name ?? "Unknown",
        status: project?.status ?? "active",
      },
      paymentMethodId: row.paymentMethodId,
      paymentMethod: {
        id: paymentMethod?.id ?? row.paymentMethodId,
        method: (paymentMethod?.method ?? "bca") as PaymentMethodType,
        receiverName: paymentMethod?.receiverName ?? "Unknown",
        accountNumber: paymentMethod?.accountNumber ?? null,
      },
      createdByUserId: row.createdByUserId,
      status: row.status as InvoiceStatus,
      currency: row.currency,
      totalAmount: row.totalAmount,
      issueDate: row.issueDate.toISOString(),
      dueDate: toIso(row.dueDate),
      notes: row.notes,
      emailSentAt: toIso(row.emailSentAt),
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
      project: full.project,
      paymentMethod: full.paymentMethod,
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
