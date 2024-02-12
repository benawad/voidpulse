import { relations, sql } from "drizzle-orm";
import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";
import { charts } from "./charts";

export const messages = pgTable("messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  text: text("text").notNull(),
  role: integer("role").notNull(),
  chartId: uuid("chart_id").notNull(),
  createdAt: date("created_at").default(sql`now()`),
  projectId: uuid("project_id").notNull(),
  userId: uuid("user_id").notNull(),
});

export const messageRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  chart: one(charts, {
    fields: [messages.chartId],
    references: [charts.id],
  }),
}));
