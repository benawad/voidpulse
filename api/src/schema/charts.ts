import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { users } from "./users";
import { boardCharts } from "./board-charts";

export const charts = pgTable("charts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  boardId: uuid("board_id"),
  creatorId: uuid("creator_id").notNull(),
});

export const chartRelations = relations(charts, ({ one, many }) => ({
  boardCharts: many(boardCharts),
  creator: one(users, {
    fields: [charts.creatorId],
    references: [users.id],
  }),
}));
