ALTER TABLE "boards" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "name";