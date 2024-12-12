CREATE TABLE IF NOT EXISTS "event_prop_types" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"prop_types" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "board_charts";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_prop_types" ADD CONSTRAINT "event_prop_types_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
