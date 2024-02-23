import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projectUsers } from "./project-users";
import { boards } from "./boards";
import { messages } from "./messages";
import { charts } from "./charts";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    name: text("name").notNull(),
    apiKey: text("api_key").notNull(),
    boardOrder: jsonb("board_order").$type<string[]>(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      apiKeyIdx: index("api_key_idx").on(table.apiKey),
    };
  }
);

export const projectRelations = relations(projects, ({ many }) => ({
  projectUsers: many(projectUsers),
  boards: many(boards),
  charts: many(charts),
  messages: many(messages),
}));
