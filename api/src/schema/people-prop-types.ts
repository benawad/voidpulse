import { sql } from "drizzle-orm";
import { date, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { DataType } from "../app-router-type";

export const peoplePropTypes = pgTable("people_prop_types", {
  projectId: uuid("project_id")
    .notNull()
    .primaryKey()
    .references(() => projects.id),
  propTypes: jsonb("prop_types")
    .$type<Record<string, { type: DataType }>>()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
