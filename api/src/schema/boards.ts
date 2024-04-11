import { relations, sql } from "drizzle-orm";
import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const boards = pgTable("boards", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  emoji: text("emoji"),
  title: text("title").notNull(),
  description: text("description"),
  positions: jsonb("positions").$type<
    {
      rowId: string;
      height: number;
      cols: {
        width: number;
        chartId: string;
      }[];
    }[]
  >(),
  projectId: uuid("project_id").notNull(),
  creatorId: uuid("creator_id").notNull(),
});

export const boardRelations = relations(boards, ({ one, many }) => ({
  project: one(projects, {
    fields: [boards.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [boards.creatorId],
    references: [users.id],
  }),
}));
