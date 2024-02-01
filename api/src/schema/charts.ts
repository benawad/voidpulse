import { relations, sql } from "drizzle-orm";
import { date, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { users } from "./users";
import { boardCharts } from "./board-charts";
import { metricSchema } from "../routes/charts/getInsight";
import { z } from "zod";
import { chartDataSchema } from "../routes/charts/createChart";
import { ChartType } from "../app-router-type";

export const charts = pgTable("charts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  title: text("title"),
  description: text("description"),
  type: integer("type").notNull().$type<ChartType>(),
  metrics: jsonb("metrics").notNull().$type<z.infer<typeof metricSchema>[]>(),
  data: jsonb("data").notNull().$type<z.infer<typeof chartDataSchema>>(),
  boardId: uuid("board_id"),
  dataUpdatedAt: date("data_updated_at")
    .notNull()
    .default(sql`now()`),
  creatorId: uuid("creator_id").notNull(),
});

export const chartRelations = relations(charts, ({ one, many }) => ({
  boardCharts: many(boardCharts),
  creator: one(users, {
    fields: [charts.creatorId],
    references: [users.id],
  }),
}));
