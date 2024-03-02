ALTER TABLE "project_users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "timezone" text DEFAULT 'US/Central' NOT NULL;