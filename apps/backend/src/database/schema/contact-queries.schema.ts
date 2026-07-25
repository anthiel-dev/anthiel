import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const contactQueries = pgTable(
  "contact_queries",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    ip: text("ip").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("contact_queries_ip_created_at_idx").on(table.ip, table.createdAt)],
);
