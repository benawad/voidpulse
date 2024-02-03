create extension if not exists "uuid-ossp";

CREATE TABLE IF NOT EXISTS "board_charts" (
	"board_id" uuid NOT NULL,
	"chart_id" uuid NOT NULL,
	CONSTRAINT "board_charts_board_id_chart_id_pk" PRIMARY KEY("board_id","chart_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boards" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"emoji" text,
	"title" text NOT NULL,
	"description" text,
	"project_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "charts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"title" text,
	"description" text,
	"chart_type" integer NOT NULL,
	"report_type" integer NOT NULL,
	"metrics" jsonb NOT NULL,
	"data" jsonb NOT NULL,
	"board_id" uuid,
	"data_updated_at" date DEFAULT now() NOT NULL,
	"creator_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people" (
	"distinct_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"properties" jsonb NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "people_distinct_id_project_id_pk" PRIMARY KEY("distinct_id","project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_users" (
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "project_users_user_id_project_id_pk" PRIMARY KEY("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"api_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_idx" ON "projects" ("api_key");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_charts" ADD CONSTRAINT "board_charts_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_charts" ADD CONSTRAINT "board_charts_chart_id_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "charts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_users" ADD CONSTRAINT "project_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
