import { relations, sql } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projectUsers } from "./project-users";
import { boards } from "./boards";
import { messages } from "./messages";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  email: text("email").notNull().unique(),
  refreshTokenVersion: integer("token_version").notNull().default(0),
  passwordHash: text("password_hash").notNull(),
  themeId: integer("theme_id"),
});

export const usersRelations = relations(users, ({ many }) => ({
  projectUsers: many(projectUsers),
  boards: many(boards),
  messages: many(messages),
}));
