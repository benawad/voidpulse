CREATE TABLE IF NOT EXISTS "people_prop_types" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"prop_types" jsonb NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "people_prop_types" ADD CONSTRAINT "people_prop_types_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
