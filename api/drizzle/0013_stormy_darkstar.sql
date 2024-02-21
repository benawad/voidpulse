ALTER TABLE "boards" ADD COLUMN "positions" jsonb;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "widths" jsonb;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "heights" jsonb;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "theme_id";