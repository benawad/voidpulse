ALTER TABLE "charts" ADD COLUMN "time_range_type" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "from" date;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "to" date;