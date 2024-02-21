ALTER TABLE "boards" DROP COLUMN IF EXISTS "widths";--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN IF EXISTS "heights";
ALTER TABLE "board_charts" DROP CONSTRAINT "board_charts_chart_id_charts_id_fk";
ALTER TABLE "board_charts" ADD CONSTRAINT "board_charts_chart_id_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "charts"("id") ON DELETE cascade ON UPDATE no action;