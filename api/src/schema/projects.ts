import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projectUsers } from "./project-users";
import { boards } from "./boards";

export const projects = pgTable("projects", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
});

export const projectRelations = relations(projects, ({ many }) => ({
  projectUsers: many(projectUsers),
  boards: many(boards),
}));
