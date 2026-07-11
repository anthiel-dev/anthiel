CREATE TABLE "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"method" text NOT NULL,
	"receiver_name" text NOT NULL,
	"account_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "payment_methods" ("id", "method", "receiver_name", "account_number")
VALUES ('pm_default_bca_franco', 'bca', 'Franco Clive Maleke', '0613197785');
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_method_id" text;--> statement-breakpoint
UPDATE "invoices" SET "payment_method_id" = 'pm_default_bca_franco' WHERE "payment_method_id" IS NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "payment_method_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_payment_method_id_idx" ON "invoices" USING btree ("payment_method_id");
