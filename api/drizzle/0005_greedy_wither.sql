ALTER TABLE "charts" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "metrics" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "data_updated_at" date DEFAULT now() NOT NULL;