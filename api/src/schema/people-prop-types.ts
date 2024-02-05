import { sql } from "drizzle-orm";
import { date, jsonb, pgTable, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const peoplePropTypes = pgTable("people_prop_types", {
  projectId: uuid("project_id")
    .notNull()
    .primaryKey()
    .references(() => projects.id),
  propTypes: jsonb("prop_types").notNull(),
  updatedAt: date("updated_at")
    .notNull()
    .default(sql`now()`),
});
