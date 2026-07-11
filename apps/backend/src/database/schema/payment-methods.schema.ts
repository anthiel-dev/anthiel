import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const PAYMENT_METHOD_TYPES = ["bca", "cash", "qris"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  method: text("method").$type<PaymentMethodType>().notNull(),
  receiverName: text("receiver_name").notNull(),
  accountNumber: text("account_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const paymentMethodsRelations = relations(paymentMethods, () => ({}));
