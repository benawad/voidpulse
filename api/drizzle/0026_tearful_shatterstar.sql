/*
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'event_prop_types'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually

    Hope to release this update as soon as possible
*/

ALTER TABLE "event_prop_types" ADD COLUMN "event_value" text NOT NULL;
ALTER TABLE "event_prop_types" DROP CONSTRAINT "event_prop_types_pkey";--> statement-breakpoint
ALTER TABLE "event_prop_types" ADD CONSTRAINT "event_prop_types_project_id_event_value_pk" PRIMARY KEY("project_id","event_value");--> statement-breakpoint