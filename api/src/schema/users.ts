import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projectUsers } from "./project-users";
import { boards } from "./boards";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projectUsers: many(projectUsers),
  boards: many(boards),
}));
