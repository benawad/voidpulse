import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";
import { ProjectRoleId } from "../app-router-type";

export const projectUsers = pgTable(
  "project_users",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    role: integer("role")
      .notNull()
      .$type<ProjectRoleId>()
      .default(ProjectRoleId.owner),
    boardOrder: jsonb("board_order").$type<string[]>(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.projectId] }),
  })
);

export const projectUsersRelations = relations(projectUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUsers.userId],
    references: [users.id],
  }),
}));
