import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";
import { businesses } from "./businesses.schema";
import { paymentMethods } from "./payment-methods.schema";
import { projects } from "./projects.schema";

export const INVOICE_STATUSES = ["draft", "sent", "paid", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const SERVICE_TYPES = ["development", "maintenance", "server", "other"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    number: text("number").notNull().unique(),
    shareToken: text("share_token").notNull().unique(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "restrict" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    paymentMethodId: text("payment_method_id")
      .notNull()
      .references(() => paymentMethods.id, { onDelete: "restrict" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: text("status").$type<InvoiceStatus>().notNull().default("draft"),
    currency: text("currency").notNull().default("IDR"),
    totalAmount: integer("total_amount").notNull().default(0),
    issueDate: timestamp("issue_date").notNull(),
    dueDate: timestamp("due_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invoices_business_id_idx").on(table.businessId),
    index("invoices_project_id_idx").on(table.projectId),
    index("invoices_payment_method_id_idx").on(table.paymentMethodId),
    index("invoices_status_idx").on(table.status),
    index("invoices_share_token_idx").on(table.shareToken),
  ],
);

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    serviceType: text("service_type").$type<ServiceType>().notNull(),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitAmount: integer("unit_amount").notNull(),
    lineAmount: integer("line_amount").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("invoice_line_items_invoice_id_idx").on(table.invoiceId)],
);

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  lineItems: many(invoiceLineItems),
  business: one(businesses, {
    fields: [invoices.businessId],
    references: [businesses.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [invoices.paymentMethodId],
    references: [paymentMethods.id],
  }),
  createdByUser: one(user, {
    fields: [invoices.createdByUserId],
    references: [user.id],
    relationName: "invoiceCreator",
  }),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));
