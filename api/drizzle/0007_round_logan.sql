ALTER TABLE "charts" RENAME COLUMN "type" TO "chart_type";--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "report_type" integer NOT NULL;