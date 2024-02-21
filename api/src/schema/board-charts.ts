import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { charts } from "./charts";

export const boardCharts = pgTable(
  "board_charts",
  {
    chartId: uuid("chart_id")
      .notNull()
      .references(() => charts.id, { onDelete: "cascade" }),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.boardId, t.chartId] }),
  })
);

export const boardChartsRelations = relations(boardCharts, ({ one }) => ({
  board: one(boards, {
    fields: [boardCharts.boardId],
    references: [boards.id],
  }),
  chart: one(charts, {
    fields: [boardCharts.chartId],
    references: [charts.id],
  }),
}));
