CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_pk" PRIMARY KEY("project_id","user_id"),
	CONSTRAINT "project_members_project_user_uid" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_business_id_idx" ON "projects" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_members_user_id_idx" ON "project_members" USING btree ("user_id");--> statement-breakpoint
INSERT INTO "projects" ("id", "business_id", "name", "status", "notes")
SELECT
	'proj_general_' || b."id",
	b."id",
	'General',
	'active',
	NULL
FROM "businesses" b
WHERE EXISTS (SELECT 1 FROM "invoices" i WHERE i."business_id" = b."id")
   OR EXISTS (SELECT 1 FROM "user" u WHERE u."business_id" = b."id");
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "project_id" text;--> statement-breakpoint
UPDATE "invoices" i
SET "project_id" = 'proj_general_' || i."business_id"
WHERE i."project_id" IS NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_project_id_idx" ON "invoices" USING btree ("project_id");--> statement-breakpoint
INSERT INTO "project_members" ("project_id", "user_id")
SELECT
	'proj_general_' || u."business_id",
	u."id"
FROM "user" u
WHERE u."role" = 'client'
  AND u."business_id" IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM "projects" p WHERE p."id" = 'proj_general_' || u."business_id"
  );
