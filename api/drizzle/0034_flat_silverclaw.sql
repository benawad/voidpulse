ALTER TABLE "projects" ADD COLUMN "query_api_key" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "query_api_key_idx" ON "projects" ("query_api_key");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_api_key_unique" UNIQUE("api_key");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_query_api_key_unique" UNIQUE("query_api_key");