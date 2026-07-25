CREATE TABLE "contact_queries" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"ip" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_queries_ip_created_at_idx" ON "contact_queries" USING btree ("ip","created_at");
