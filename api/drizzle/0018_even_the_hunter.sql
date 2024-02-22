ALTER TABLE "charts" ALTER COLUMN "from" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "charts" ALTER COLUMN "to" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "charts" ALTER COLUMN "data_updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "people_prop_types" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "people" ALTER COLUMN "created_at" SET DATA TYPE timestamp;