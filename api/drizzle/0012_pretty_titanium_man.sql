ALTER TABLE "board_charts" DROP CONSTRAINT "board_charts_board_id_boards_id_fk";
--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_charts" ADD CONSTRAINT "board_charts_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
