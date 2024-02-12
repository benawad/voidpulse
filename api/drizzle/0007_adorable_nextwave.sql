CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"text" text NOT NULL,
	"role" integer NOT NULL,
	"created_at" date DEFAULT now(),
	"user_id" uuid NOT NULL
);
