import { asc, eq } from "drizzle-orm";

import type { AppDb } from "@/database";
import type { PaymentMethodType } from "@/database/schema/payment-methods.schema";

import { invoices, paymentMethods } from "@/database/schema";

import type {
  CreatePaymentMethodBody,
  UpdatePaymentMethodBody,
} from "../contracts/request.contract";
import type { PaymentMethodDto } from "../contracts/response.contract";

type PaymentMethodRow = typeof paymentMethods.$inferSelect;

type PaymentMethodMutationResult =
  | { data: PaymentMethodDto }
  | { error: "payment_method_not_found" };

type DeletePaymentMethodResult =
  | { success: true }
  | { error: "payment_method_not_found" | "has_invoices" };

function newId() {
  return crypto.randomUUID();
}

export class PaymentMethodsService {
  constructor(private readonly deps: { db: AppDb }) {}

  async listPaymentMethods(): Promise<PaymentMethodDto[]> {
    const rows = await this.deps.db.query.paymentMethods.findMany({
      orderBy: [asc(paymentMethods.method), asc(paymentMethods.receiverName)],
    });
    return rows.map((row) => this.toDto(row));
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethodDto | null> {
    const row = await this.deps.db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, id),
    });
    return row ? this.toDto(row) : null;
  }

  async createPaymentMethod(input: CreatePaymentMethodBody): Promise<PaymentMethodMutationResult> {
    const id = newId();
    await this.deps.db.insert(paymentMethods).values({
      id,
      method: input.method,
      receiverName: input.receiverName,
      accountNumber: input.accountNumber ?? null,
    });

    const created = await this.getPaymentMethodById(id);
    if (!created) return { error: "payment_method_not_found" };
    return { data: created };
  }

  async updatePaymentMethod(
    id: string,
    input: UpdatePaymentMethodBody,
  ): Promise<PaymentMethodMutationResult> {
    const existing = await this.getPaymentMethodById(id);
    if (!existing) return { error: "payment_method_not_found" };

    const changes: {
      method?: PaymentMethodType;
      receiverName?: string;
      accountNumber?: string | null;
    } = {};

    if (input.method !== undefined) changes.method = input.method;
    if (input.receiverName !== undefined) changes.receiverName = input.receiverName;
    if (input.accountNumber !== undefined) changes.accountNumber = input.accountNumber;

    if (Object.keys(changes).length > 0) {
      await this.deps.db.update(paymentMethods).set(changes).where(eq(paymentMethods.id, id));
    }

    const updated = await this.getPaymentMethodById(id);
    if (!updated) return { error: "payment_method_not_found" };
    return { data: updated };
  }

  async deletePaymentMethod(id: string): Promise<DeletePaymentMethodResult> {
    const existing = await this.getPaymentMethodById(id);
    if (!existing) return { error: "payment_method_not_found" };

    const linkedInvoice = await this.deps.db.query.invoices.findFirst({
      where: eq(invoices.paymentMethodId, id),
      columns: { id: true },
    });
    if (linkedInvoice) return { error: "has_invoices" };

    await this.deps.db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return { success: true };
  }

  private toDto(row: PaymentMethodRow): PaymentMethodDto {
    return {
      id: row.id,
      method: row.method as PaymentMethodType,
      receiverName: row.receiverName,
      accountNumber: row.accountNumber,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
