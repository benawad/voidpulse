import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";
import { boardCharts } from "./board-charts";

export const boards = pgTable("boards", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  projectId: uuid("project_id").notNull(),
  creatorId: uuid("creator_id").notNull(),
});

export const boardRelations = relations(boards, ({ one, many }) => ({
  boardCharts: many(boardCharts),
  project: one(projects, {
    fields: [boards.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [boards.creatorId],
    references: [users.id],
  }),
}));
