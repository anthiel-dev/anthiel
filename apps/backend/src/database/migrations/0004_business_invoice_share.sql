CREATE TABLE "businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "business_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_client_user_id_user_id_fk";--> statement-breakpoint
DROP INDEX "invoices_client_user_id_idx";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "client_user_id";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "share_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "business_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_share_token_unique" UNIQUE("share_token");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_business_id_idx" ON "invoices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "invoices_share_token_idx" ON "invoices" USING btree ("share_token");
