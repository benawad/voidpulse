import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import {
  ChartTimeRangeType,
  ChartType,
  EventCombination,
  LineChartGroupByTimeType,
  LtvType,
  LtvWindowType,
  ReportType,
  RetentionNumFormat,
} from "../app-router-type";
import { chartDataSchema } from "../routes/charts/chartDataSchema";
import {
  InputMetric,
  MetricFilter,
} from "../routes/charts/insight/eventFilterSchema";
import { messages } from "./messages";
import { projects } from "./projects";
import { users } from "./users";

export const charts = pgTable("charts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  title: text("title"),
  description: text("description"),
  chartType: integer("chart_type").notNull().$type<ChartType>(),
  reportType: integer("report_type").$type<ReportType>().notNull(),
  visibleDataMap: jsonb("visible_data_map").$type<Record<
    string,
    boolean
  > | null>(),
  ltvType: integer("ltv_type").$type<LtvType | null>(),
  ltvWindowType: integer("ltv_window_type").$type<LtvWindowType | null>(),
  lineChartGroupByTimeType: integer(
    "line_chart_group_by_time_type"
  ).$type<LineChartGroupByTimeType>(),
  isOverTime: boolean("is_over_time"),
  retentionNumFormat: integer(
    "retention_num_format"
  ).$type<RetentionNumFormat>(),
  timeRangeType: integer("time_range_type")
    .notNull()
    .$type<ChartTimeRangeType>(),
  from: text("from"),
  to: text("to"),
  metrics: jsonb("metrics").notNull().$type<InputMetric[]>(),
  breakdowns: jsonb("breakdowns").$type<MetricFilter[]>(),
  combinations: jsonb("combinations").$type<EventCombination[]>(),
  globalFilters: jsonb("global_filters").$type<MetricFilter[]>(),
  data: jsonb("data").notNull().$type<z.infer<typeof chartDataSchema>>(),
  boardId: uuid("board_id"),
  dataUpdatedAt: timestamp("data_updated_at")
    .notNull()
    .default(sql`now()`),
  creatorId: uuid("creator_id").notNull(),
  projectId: uuid("project_id").notNull(),
});

export const chartRelations = relations(charts, ({ one, many }) => ({
  messages: many(messages),
  creator: one(users, {
    fields: [charts.creatorId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [charts.projectId],
    references: [projects.id],
  }),
}));
