ALTER TABLE "project_users" ADD COLUMN "role" integer DEFAULT 40 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_users" ADD COLUMN "board_order" jsonb;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "board_order";